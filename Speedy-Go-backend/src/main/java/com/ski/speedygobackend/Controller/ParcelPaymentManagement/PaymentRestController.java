package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.DTO.CartItemDto;
import com.ski.speedygobackend.DTO.PaymentDto;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.ski.speedygobackend.Entity.OfferManagement.Offres;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Enum.PaymentMethod;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IPaymentServices;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Invoice;
import com.stripe.model.InvoiceItem;
import com.stripe.model.PaymentIntent;
import com.stripe.param.InvoiceCreateParams;
import com.stripe.param.InvoiceItemCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.validation.Valid;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("payment")
@RestController
public class PaymentRestController {
  private static final Map<String, Double> EXCHANGE_RATES = new HashMap<>();

  static {
    EXCHANGE_RATES.put("USD", 1.0);
    EXCHANGE_RATES.put("EUR", 0.85);
    EXCHANGE_RATES.put("GBP", 0.73);
    EXCHANGE_RATES.put("TND", 3.30);
  }

  private final IPaymentServices paymentServices;
  private final IParcelServices parcelServices;
  private final ParcelStatusPublisher statusPublisher;
  private final ObjectMapper objectMapper;

  @Value("${stripe.secret.key}")
  private String stripeSecretKey;

  @Autowired
  public PaymentRestController(
          IPaymentServices paymentServices,
          IParcelServices parcelServices,
          ParcelStatusPublisher statusPublisher,
          ObjectMapper objectMapper) {
    this.paymentServices = paymentServices;
    this.parcelServices = parcelServices;
    this.statusPublisher = statusPublisher;
    this.objectMapper = objectMapper;
  }

  @PostMapping("/create-payment-intent")
  public ResponseEntity<Map<String, String>> createPaymentIntent(
          @Valid @RequestBody PaymentRequest request) {
    try {
      System.out.println("Received create-payment-intent request: " + objectMapper.writeValueAsString(request));
      if (request.getItems() == null || request.getItems().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Items list is required and cannot be empty"));
      }
      if (request.getCurrency() == null || request.getCurrency().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Currency is required"));
      }

      Stripe.apiKey = stripeSecretKey;

      String currency = request.getCurrency().toUpperCase();
      if (!EXCHANGE_RATES.containsKey(currency)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency"));
      }

      double totalUSD = request.getItems().stream()
              .mapToDouble(item -> {
                if (item.getOffer() == null) {
                  throw new IllegalArgumentException("Offer cannot be null");
                }
                double finalPrice = item.getOffer().getPrice() * (1 - item.getOffer().getDiscount() / 100);
                return finalPrice * item.getQuantity();
              })
              .sum();

      double exchangeRate = EXCHANGE_RATES.get(currency);
      long amount = Math.round(totalUSD * exchangeRate * 100);

      PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
              .setAmount(amount)
              .setCurrency(currency.toLowerCase())
              .setAutomaticPaymentMethods(
                      PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                              .setEnabled(true)
                              .build()
              )
              .putMetadata("totalAmount", String.valueOf(totalUSD));

      if (request.getUserId() != null) {
        paramsBuilder.putMetadata("userId", request.getUserId().toString());
      }

      PaymentIntentCreateParams params = paramsBuilder.build();
      PaymentIntent paymentIntent = PaymentIntent.create(params);

      System.out.println("Created PaymentIntent: id=" + paymentIntent.getId() + ", clientSecret=" + paymentIntent.getClientSecret());

      Map<String, String> response = new HashMap<>();
      response.put("clientSecret", paymentIntent.getClientSecret());
      response.put("paymentIntentId", paymentIntent.getId());
      System.out.println("create-payment-intent response: " + objectMapper.writeValueAsString(response));
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
      System.err.println("Validation error in create-payment-intent: " + e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (StripeException e) {
      System.err.println("Stripe error in create-payment-intent: " + e.getMessage());
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      System.err.println("Unexpected error in create-payment-intent: " + e.getMessage());
      return ResponseEntity.status(500).body(Map.of("error", "Unexpected error: " + e.getMessage()));
    }
  }

  @PostMapping("/confirm-payment")
  public ResponseEntity<Map<String, Object>> confirmPayment(
          @Valid @RequestBody ConfirmPaymentRequest request) {
    try {
      System.out.println("Received confirm-payment request: " + objectMapper.writeValueAsString(request));
      if (request.getPaymentIntentId() == null || request.getPaymentIntentId().trim().isEmpty()) {
        System.err.println("Validation failed: paymentIntentId is null or empty");
        return ResponseEntity.badRequest().body(Map.of("error", "paymentIntentId is required"));
      }
      if (request.getItems() == null || request.getItems().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Items list is required and cannot be empty"));
      }
      if (request.getCurrency() == null || request.getCurrency().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Currency is required"));
      }

      Stripe.apiKey = stripeSecretKey;
      PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

      if (!"succeeded".equals(paymentIntent.getStatus())) {
        System.err.println("PaymentIntent status is not succeeded: " + paymentIntent.getStatus());
        return ResponseEntity.badRequest().body(Map.of("error", "Payment not completed"));
      }

      // Create Stripe Invoice
      String invoicePdfUrl = createStripeInvoice(paymentIntent, request.getItems(), request.getUserId(), request.getCurrency());

      // Create one Parcel for all cart items
      Parcel parcel = new Parcel();
      parcel.setParcelName("Order #" + paymentIntent.getId());
      parcel.setDeliveryAddress("Default Delivery Address");
      parcel.setCurrentLocation("Warehouse");
      parcel.setWeight((float) request.getItems().stream().mapToDouble(item -> 1.0f * item.getQuantity()).sum());
      parcel.setParcelstatus(ParcelStatus.ORDERED);
      parcel.setUserId(request.getUserId());
      parcel.setTrip(null);
      parcel.setInternationalShipping(null);

      Set<Offres> offres = new HashSet<>();
      for (CartItemDto item : request.getItems()) {
        if (item.getOffer().getOffreId() == null) {
          throw new IllegalArgumentException("Invalid offreId for item: " + item.getOffer().getTitle());
        }

        Offres offre = new Offres();
        offre.setOffreId(item.getOffer().getOffreId());
        offre.setPrice(item.getOffer().getPrice());
        offre.setDiscount(item.getOffer().getDiscount());
        offre.setTitle(item.getOffer().getTitle());
        offre.setDescription(item.getOffer().getDescription());
        offre.setImage(item.getOffer().getImage());
        offre.setCategory(item.getOffer().getCategory());
        offre.setDateStart(item.getOffer().getDateStart());
        offre.setAvailable(item.getOffer().isAvailable());
        offre.setStore(null);

        offres.add(offre);
      }
      parcel.setOffres(offres);

      Parcel savedParcel = parcelServices.addParcel(parcel);
      List<Long> parcelIds = new ArrayList<>();
      parcelIds.add(savedParcel.getParcelId());

      statusPublisher.notifyStatusChange(savedParcel.getParcelId(), ParcelStatus.ORDERED);

      Payment payment = new Payment();
      payment.setAmount(Double.parseDouble(paymentIntent.getMetadata().get("totalAmount")));
      payment.setPaymentDate(new Date());
      payment.setPaymentMethod(PaymentMethod.CREDIT_CARD);
      payment.setPaymentIntentId(paymentIntent.getId());
      System.out.println("Inserting payment with paymentMethod: " + payment.getPaymentMethod().getDatabaseValue());

      String userIdStr = paymentIntent.getMetadata().get("userId");
      if (userIdStr != null) {
        User user = new User();
        user.setUserId(Long.parseLong(userIdStr));
        payment.setUser(user);
      } else {
        payment.setUser(null);
      }

      Payment savedPayment = paymentServices.addPayment(payment);

      Map<String, Object> response = new HashMap<>();
      response.put("status", "success");
      response.put("paymentId", savedPayment.getPaymentId().toString());
      response.put("invoicePdfUrl", invoicePdfUrl);
      response.put("parcelIds", parcelIds);
      System.out.println("confirm-payment response: " + objectMapper.writeValueAsString(response));
      return ResponseEntity.ok(response);
    } catch (StripeException e) {
      System.err.println("Stripe error in confirm-payment: " + e.getMessage());
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      System.err.println("Unexpected error in confirm-payment: " + e.getMessage());
      return ResponseEntity.status(500).body(Map.of("error", "Unexpected error: " + e.getMessage()));
    }
  }

  private String createStripeInvoice(PaymentIntent paymentIntent, List<CartItemDto> items, Long userId, String currency) throws StripeException {
    String customerId = getOrCreateCustomer(userId);

    String currencyUpper = currency.toUpperCase();
    if (!EXCHANGE_RATES.containsKey(currencyUpper)) {
      throw new IllegalArgumentException("Invalid currency: " + currency);
    }

    InvoiceCreateParams invoiceParams = InvoiceCreateParams.builder()
            .setCustomer(customerId)
            .setCurrency(currency.toLowerCase())
            .setCollectionMethod(InvoiceCreateParams.CollectionMethod.SEND_INVOICE)
            .setDaysUntilDue(7L)
            .setDescription("Purchase from SpeedyGo")
            .setAutoAdvance(true)
            .putMetadata("paymentIntentId", paymentIntent.getId())
            .build();
    Invoice invoice = Invoice.create(invoiceParams);

    for (CartItemDto item : items) {
      double finalPrice = item.getOffer().getPrice() * (1 - item.getOffer().getDiscount() / 100);
      double exchangeRate = EXCHANGE_RATES.get(currencyUpper);
      long unitAmount = Math.round(finalPrice * exchangeRate * 100);

      InvoiceItemCreateParams itemParams = InvoiceItemCreateParams.builder()
              .setCustomer(customerId)
              .setInvoice(invoice.getId())
              .setQuantity((long) item.getQuantity())
              .setUnitAmount(unitAmount)
              .setDescription(item.getOffer().getTitle())
              .setCurrency(currency.toLowerCase())
              .build();
      InvoiceItem.create(itemParams);
    }

    invoice = invoice.finalizeInvoice();
    return invoice.getHostedInvoiceUrl();
  }

  private String getOrCreateCustomer(Long userId) throws StripeException {
    String email = null;
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (principal instanceof UserDetails) {
      email = ((UserDetails) principal).getUsername();
    }

    com.stripe.param.CustomerCreateParams.Builder customerParams = com.stripe.param.CustomerCreateParams.builder()
            .setMetadata(Map.of("userId", userId.toString()));

    if (email != null && !email.trim().isEmpty()) {
      customerParams.setEmail(email);
    } else {
      customerParams.setEmail("no-email-provided@speedygo.com");
    }

    com.stripe.model.Customer customer = com.stripe.model.Customer.create(customerParams.build());
    return customer.getId();
  }

  @GetMapping("/getAll")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<PaymentDto>> getAll() {
    List<Payment> payments = paymentServices.retrieveAll();
    List<PaymentDto> paymentDtos = payments.stream()
            .map(payment -> new PaymentDto(
                    payment.getPaymentId(),
                    payment.getAmount(),
                    payment.getPaymentDate(),
                    payment.getPaymentMethod(),
                    payment.getUser() != null ? payment.getUser().getUserId() : null,
                    payment.getUser() != null ? payment.getUser().getEmail() : null
            ))
            .collect(Collectors.toList());
    return ResponseEntity.ok(paymentDtos);
  }

  public static class ConfirmPaymentRequest {
    private String paymentIntentId;
    private List<CartItemDto> items;
    private Long userId;
    private String currency;

    @JsonProperty("paymentIntentId")
    public String getPaymentIntentId() {
      return paymentIntentId;
    }

    @JsonProperty("paymentIntentId")
    public void setPaymentIntentId(String paymentIntentId) {
      this.paymentIntentId = paymentIntentId;
    }

    @JsonProperty("items")
    public List<CartItemDto> getItems() {
      return items;
    }

    @JsonProperty("items")
    public void setItems(List<CartItemDto> items) {
      this.items = items;
    }

    @JsonProperty("userId")
    public Long getUserId() {
      return userId;
    }

    @JsonProperty("userId")
    public void setUserId(Long userId) {
      this.userId = userId;
    }

    @JsonProperty("currency")
    public String getCurrency() {
      return currency;
    }

    @JsonProperty("currency")
    public void setCurrency(String currency) {
      this.currency = currency;
    }
  }

  public static class PaymentRequest {
    private List<CartItemDto> items;
    private Long userId;
    private String currency;

    @JsonProperty("items")
    public List<CartItemDto> getItems() {
      return items;
    }

    @JsonProperty("items")
    public void setItems(List<CartItemDto> items) {
      this.items = items;
    }

    @JsonProperty("userId")
    public Long getUserId() {
      return userId;
    }

    @JsonProperty("userId")
    public void setUserId(Long userId) {
      this.userId = userId;
    }

    @JsonProperty("currency")
    public String getCurrency() {
      return currency;
    }

    @JsonProperty("currency")
    public void setCurrency(String currency) {
      this.currency = currency;
    }

    @Override
    public String toString() {
      return "PaymentRequest{items=" + items + ", userId=" + userId + ", currency='" + currency + "'}";
    }
  }

  @PostMapping("/add")
  @PreAuthorize("hasRole('ADMIN')")
  public Payment addPayment(@RequestBody Payment payment) {
    return paymentServices.addPayment(payment);
  }

  @PutMapping("/update/{paymentId}")
  @PreAuthorize("hasRole('ADMIN')")
  public Payment updatePayment(@PathVariable Long paymentId, @RequestBody Payment payment) {
    return paymentServices.updatePayment(paymentId, payment);
  }

  @GetMapping("get/{paymentId}")
  @PreAuthorize("hasRole('ADMIN')")
  public Payment getPayment(@PathVariable Long paymentId) {
    return paymentServices.retrievePayment(paymentId);
  }

  @DeleteMapping("/delete/{paymentId}")
  @PreAuthorize("hasRole('ADMIN')")
  public void deletePayment(@PathVariable Long paymentId) {
    paymentServices.deletePayment(paymentId);
  }
}