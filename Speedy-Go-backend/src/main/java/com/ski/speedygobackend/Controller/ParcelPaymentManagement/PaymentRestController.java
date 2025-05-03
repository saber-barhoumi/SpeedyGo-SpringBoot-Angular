package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.DTO.CartItemDto;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Payment;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IPaymentServices;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

  @Value("${stripe.secret.key}")
  private String stripeSecretKey;

  @PostMapping("/create-payment-intent")
  public ResponseEntity<Map<String, String>> createPaymentIntent(
    @Valid @RequestBody PaymentRequest request) {
    try {
      Stripe.apiKey = stripeSecretKey;

      // Validate currency
      String currency = request.getCurrency().toUpperCase();
      if (!EXCHANGE_RATES.containsKey(currency)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency"));
      }

      // Calculate total in USD
      double totalUSD = request.getItems().stream()
        .mapToDouble(item -> {
          double finalPrice = item.getOffer().getPrice() * (1 - item.getOffer().getDiscount() / 100);
          return finalPrice * item.getQuantity();
        })
        .sum();

      // Convert to selected currency and to cents (or millimes for TND)
      double exchangeRate = EXCHANGE_RATES.get(currency);
      long amount = Math.round(totalUSD * exchangeRate * 100); // Stripe uses smallest unit

      // Create Payment Intent
      PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .setAmount(amount)
        .setCurrency(currency.toLowerCase()) // Stripe uses lowercase
        .setAutomaticPaymentMethods(
          PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
            .setEnabled(true)
            .build()
        )
        .build();

      PaymentIntent paymentIntent = PaymentIntent.create(params);

      Map<String, String> response = new HashMap<>();
      response.put("clientSecret", paymentIntent.getClientSecret());
      return ResponseEntity.ok(response);
    } catch (StripeException e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }

  // DTO for request body
  public static class PaymentRequest {
    private List<CartItemDto> items;
    private Long userId;
    private String currency;

    public List<CartItemDto> getItems() {
      return items;
    }

    public void setItems(List<CartItemDto> items) {
      this.items = items;
    }

    public Long getUserId() {
      return userId;
    }

    public void setUserId(Long userId) {
      this.userId = userId;
    }

    public String getCurrency() {
      return currency;
    }

    public void setCurrency(String currency) {
      this.currency = currency;
    }
  }

    @Autowired // Explicitly tell Spring to inject this dependency
    public PaymentRestController(IPaymentServices paymentServices) {
        this.paymentServices = paymentServices;
    }
    @PostMapping("/add")
    public Payment addPayment(@RequestBody Payment payment) {
        return paymentServices.addPayment(payment);
    }

    @PutMapping("/update/{paymentId}")
    public Payment updatePayment(@PathVariable Long paymentId, @RequestBody Payment payment){
        return paymentServices.updatePayment(paymentId,payment);
    }

    @GetMapping("get/{paymentId}")
    public Payment getPayment (@PathVariable Long paymentId){
        return paymentServices.retrievePayment(paymentId);
    }

    @GetMapping("/getAll")
    public List<Payment> getAll(){
        return paymentServices.retrieveAll();
    }

    @DeleteMapping("/delete/{paymentId}")
    public void deletePayment (@PathVariable Long paymentId){
        paymentServices.deletePayment(paymentId);
    }
}


