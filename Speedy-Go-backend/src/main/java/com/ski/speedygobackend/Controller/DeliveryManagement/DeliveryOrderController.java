package com.ski.speedygobackend.Controller.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryOrder;
import com.ski.speedygobackend.Enum.OrderStatus;
import com.ski.speedygobackend.Service.DeliveryManagement.DeliveryOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-orders")
@RequiredArgsConstructor
public class DeliveryOrderController {

    private final DeliveryOrderService deliveryOrderService;

    @GetMapping
    public ResponseEntity<List<DeliveryOrder>> getAllOrders() {
        return ResponseEntity.ok(deliveryOrderService.getAllOrders());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DeliveryOrder>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(deliveryOrderService.getOrdersByUserId(userId));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<DeliveryOrder>> getOrdersByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(deliveryOrderService.getOrdersByServiceId(serviceId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<DeliveryOrder> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(deliveryOrderService.getOrderById(orderId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DeliveryOrder> createOrder(
            @RequestParam("customerId") Long customerId,
            @RequestParam("serviceId") Long serviceId,
            @RequestParam("destinationCountry") String destinationCountry,
            @RequestParam("destinationAddress") String destinationAddress,
            @RequestParam("weight") Double weight,
            @RequestParam("itemDescription") String itemDescription,
            @RequestParam(value = "itemPhoto", required = false) MultipartFile itemPhoto) throws IOException {

        return ResponseEntity.ok(deliveryOrderService.createOrder(
                customerId,
                serviceId,
                destinationCountry,
                destinationAddress,
                weight,
                itemDescription,
                itemPhoto
        ));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<DeliveryOrder> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String statusReason) {

        return ResponseEntity.ok(deliveryOrderService.updateOrderStatus(orderId, status, statusReason));
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<DeliveryOrder> updateOrder(
            @PathVariable Long orderId,
            @RequestBody DeliveryOrder order) {

        return ResponseEntity.ok(deliveryOrderService.updateOrder(orderId, order));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        deliveryOrderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{orderId}/photo")
    public ResponseEntity<byte[]> getOrderPhoto(@PathVariable Long orderId) {
        DeliveryOrder order = deliveryOrderService.getOrderById(orderId);

        if (order.getItemPhoto() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(order.getItemPhotoType()))
                .body(order.getItemPhoto());
    }

    @GetMapping("/delivery-person/{personId}")
    public ResponseEntity<List<DeliveryOrder>> getOrdersByDeliveryPerson(@PathVariable Long personId) {
        return ResponseEntity.ok(deliveryOrderService.getDeliveryPersonOrders(personId));
    }

    @PatchMapping("/{orderId}/rating")
    public ResponseEntity<DeliveryOrder> rateOrder(
            @PathVariable Long orderId,
            @RequestParam Double rating) {

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        return ResponseEntity.ok(deliveryOrderService.rateOrder(orderId, rating));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<DeliveryOrderService.DeliveryOrderStats> getDeliveryStats(@PathVariable Long userId) {
        DeliveryOrderService.DeliveryOrderStats stats = deliveryOrderService.calculateDeliveryStats(userId);
        return ResponseEntity.ok(stats);
    }
}