package com.ski.speedygobackend.Service.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryOrder;
import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.OrderStatus;
import com.ski.speedygobackend.Repository.DeliveryManagement.DeliveryOrderRepository;
import com.ski.speedygobackend.Repository.DeliveryManagement.DeliveryServiceRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

    private final DeliveryOrderRepository orderRepository;
    private final DeliveryServiceRepository serviceRepository;
    private final IUserRepository userRepository;
    private final DeliveryServiceService deliveryServiceService;

    public List<DeliveryOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<DeliveryOrder> getOrdersByUserId(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return orderRepository.findByCustomer(userOpt.get());
    }

    public List<DeliveryOrder> getOrdersByServiceId(Long serviceId) {
        Optional<DeliveryService> serviceOpt = serviceRepository.findById(serviceId);
        if (serviceOpt.isEmpty()) {
            throw new RuntimeException("Service not found");
        }
        return orderRepository.findByDeliveryService(serviceOpt.get());
    }

    public DeliveryOrder getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public DeliveryOrder createOrder(
            Long customerId,
            Long serviceId,
            String destinationCountry,
            String destinationAddress,
            Double weight,
            String itemDescription,
            MultipartFile itemPhoto) throws IOException {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        DeliveryService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Delivery service not found"));

        if (!service.getIsActive()) {
            throw new RuntimeException("Delivery service is not currently active");
        }

        if (weight > service.getMaxWeightPerOrder()) {
            throw new RuntimeException("Order exceeds maximum weight limit of " + service.getMaxWeightPerOrder() + " kg");
        }

        Set<String> countriesServed = service.getCountriesServed();
        if (countriesServed != null && !countriesServed.contains(destinationCountry)) {
            throw new RuntimeException("Delivery service does not serve the destination country: " + destinationCountry);
        }

        DeliveryOrder order = new DeliveryOrder();
        order.setCustomer(customer);
        order.setDeliveryService(service);
        order.setDestinationCountry(destinationCountry);
        order.setDestinationAddress(destinationAddress);
        order.setWeight(weight);
        order.setItemDescription(itemDescription);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        order.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(7));

        double price = service.getBasePrice() + (weight * service.getPricePerKg());
        order.setTotalPrice(price);

        if (itemPhoto != null && !itemPhoto.isEmpty()) {
            order.setItemPhoto(itemPhoto.getBytes());
            order.setItemPhotoType(itemPhoto.getContentType());
        }

        DeliveryOrder savedOrder = orderRepository.save(order);

        deliveryServiceService.checkAndUpdateServiceAvailability(service.getServiceId());

        return savedOrder;
    }

    public DeliveryOrder updateOrderStatus(Long orderId, OrderStatus status, String statusReason) {
        DeliveryOrder order = getOrderById(orderId);
        LocalDateTime now = LocalDateTime.now();

        order.setStatus(status);
        order.setUpdatedAt(now);

        order.setPickedUpAt(null);
        order.setInTransitAt(null);
        order.setDeliveredAt(null);
        order.setCanceledAt(null);
        order.setRejectedAt(null);

        switch (status) {
            case PENDING:
                break;
            case ACCEPTED:
                break;
            case PICKED_UP:
                order.setPickedUpAt(now);
                break;
            case IN_TRANSIT:
                order.setInTransitAt(now);
                break;
            case DELIVERED:
                order.setDeliveredAt(now);
                break;
            case REJECTED:
                order.setRejectedAt(now);
                break;
            case CANCELED:
                order.setCanceledAt(now);
                break;
        }

        if (statusReason != null && !statusReason.trim().isEmpty()) {
            order.setStatusReason(statusReason);
        }

        return orderRepository.save(order);
    }

    public DeliveryOrder updateOrder(Long orderId, DeliveryOrder updateOrder) {
        DeliveryOrder existingOrder = getOrderById(orderId);

        if (existingOrder.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be updated");
        }

        if (updateOrder.getDestinationAddress() != null) {
            existingOrder.setDestinationAddress(updateOrder.getDestinationAddress());
        }

        if (updateOrder.getDestinationCountry() != null) {
            existingOrder.setDestinationCountry(updateOrder.getDestinationCountry());
        }

        if (updateOrder.getItemDescription() != null) {
            existingOrder.setItemDescription(updateOrder.getItemDescription());
        }

        if (updateOrder.getWeight() != null) {
            if (updateOrder.getWeight() > existingOrder.getDeliveryService().getMaxWeightPerOrder()) {
                throw new RuntimeException("Updated weight exceeds maximum weight limit");
            }
            existingOrder.setWeight(updateOrder.getWeight());

            double newPrice = existingOrder.getDeliveryService().getBasePrice() +
                    (updateOrder.getWeight() * existingOrder.getDeliveryService().getPricePerKg());
            existingOrder.setTotalPrice(newPrice);
        }

        existingOrder.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(existingOrder);
    }

    public void deleteOrder(Long orderId) {
        DeliveryOrder order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be deleted");
        }

        orderRepository.delete(order);
    }

    public List<DeliveryOrder> getDeliveryPersonOrders(Long personId) {
        return orderRepository.findByDeliveryPersonId(personId);
    }

    public DeliveryOrder rateOrder(Long orderId, Double rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        DeliveryOrder order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only delivered orders can be rated");
        }

        order.setRating(rating);
        return orderRepository.save(order);
    }

    public Double calculateAverageRatingForDeliveryPerson(Long personId) {
        List<DeliveryOrder> completedOrders = orderRepository.findByDeliveryPersonIdAndStatus(
                personId, OrderStatus.DELIVERED);

        List<DeliveryOrder> ratedOrders = completedOrders.stream()
                .filter(order -> order.getRating() != null)
                .collect(Collectors.toList());

        if (ratedOrders.isEmpty()) {
            return 0.0;
        }

        Double totalRating = ratedOrders.stream()
                .mapToDouble(DeliveryOrder::getRating)
                .sum();

        return totalRating / ratedOrders.size();
    }

    public DeliveryOrderStats calculateDeliveryStats(Long userId) {
        List<DeliveryOrder> completedOrders = getCompletedOrders(userId);
        Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED);
        int totalDeliveries = (int) completedOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .count();

        double totalEarnings = completedOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(order -> order.getTotalPrice())
                .sum();

        return new DeliveryOrderStats(totalDeliveries, totalEarnings);
    }

    private List<DeliveryOrder> getCompletedOrders(Long userId) {
        return orderRepository.findByCustomerIdAndStatusIn(
                userId,
                Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED)
        );
    }

    public static class DeliveryOrderStats {
        private int totalDeliveries;
        private double totalEarnings;

        public DeliveryOrderStats(int totalDeliveries, double totalEarnings) {
            this.totalDeliveries = totalDeliveries;
            this.totalEarnings = totalEarnings;
        }

        public int getTotalDeliveries() {
            return totalDeliveries;
        }

        public double getTotalEarnings() {
            return totalEarnings;
        }
    }

}