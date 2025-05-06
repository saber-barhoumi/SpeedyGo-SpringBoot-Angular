package com.ski.speedygobackend.Controller.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Enum.DeliveryType;
import com.ski.speedygobackend.Service.DeliveryManagement.DeliveryServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/delivery-services")
@RequiredArgsConstructor
public class DeliveryServiceController {

    private final DeliveryServiceService deliveryServiceService;

    @PostMapping("/register")
    public ResponseEntity<DeliveryService> registerDeliveryService(
            @RequestParam Long userId,
            @RequestParam DeliveryType type,
            @RequestParam(required = false) Set<String> countries,
            @RequestParam(required = false) Set<String> goodTypes,
            @RequestParam Double maxWeight,
            @RequestParam Integer maxOrders,
            @RequestParam Double basePrice,
            @RequestParam Double pricePerKg) {

        DeliveryService service = deliveryServiceService.registerDeliveryService(
                userId, type, countries, goodTypes, maxWeight, maxOrders, basePrice, pricePerKg);

        return ResponseEntity.ok(service);
    }

    @GetMapping("/international")
    public ResponseEntity<List<DeliveryService>> getInternationalServices() {
        List<DeliveryService> services = deliveryServiceService.getActiveInternationalServices();
        return ResponseEntity.ok(services);
    }

    @PutMapping("/{serviceId}/availability")
    public ResponseEntity<Void> updateServiceAvailability(
            @PathVariable Long serviceId,
            @RequestParam boolean isActive) {

        deliveryServiceService.updateServiceAvailability(serviceId, isActive);
        return ResponseEntity.ok().build();
    }
    // Add to DeliveryServiceController
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<DeliveryService>> getProviderServices(
            @PathVariable Long providerId) {
        List<DeliveryService> services = deliveryServiceService.getServicesByProviderId(providerId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<DeliveryService> getServiceById(@PathVariable Long serviceId) {
        DeliveryService service = deliveryServiceService.getServiceById(serviceId);
        return ResponseEntity.ok(service);
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        deliveryServiceService.deleteService(serviceId);
        return ResponseEntity.ok().build();
    }

}