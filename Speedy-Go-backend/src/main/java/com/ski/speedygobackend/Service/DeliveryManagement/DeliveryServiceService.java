package com.ski.speedygobackend.Service.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.DeliveryType;
import com.ski.speedygobackend.Enum.OrderStatus;
import com.ski.speedygobackend.Repository.DeliveryManagement.DeliveryServiceRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DeliveryServiceService {

    private final DeliveryServiceRepository deliveryServiceRepository;
    private final IUserRepository userRepository;

    public DeliveryService registerDeliveryService(Long userId, DeliveryType type,
                                                   Set<String> countries, Set<String> goodTypes,
                                                   Double maxWeight, Integer maxOrders,
                                                   Double basePrice, Double pricePerKg) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        DeliveryService service = new DeliveryService();
        service.setDeliveryPerson(user);
        service.setDeliveryType(type);

        if (type == DeliveryType.INTERNATIONAL) {
            service.setCountriesServed(countries);
            service.setAcceptedGoodTypes(goodTypes);
        }

        // Set conditions
        service.setMaxWeightPerOrder(maxWeight);
        service.setMaxOrdersPerDay(maxOrders);
        service.setBasePrice(basePrice);
        service.setPricePerKg(pricePerKg);

        return deliveryServiceRepository.save(service);
    }

    public List<DeliveryService> getActiveInternationalServices() {
        return deliveryServiceRepository.findByDeliveryTypeAndIsActive(
                DeliveryType.INTERNATIONAL, true);
    }

    public void updateServiceAvailability(Long serviceId, boolean isActive) {
        Optional<DeliveryService> serviceOpt = deliveryServiceRepository.findById(serviceId);
        if (serviceOpt.isPresent()) {
            DeliveryService service = serviceOpt.get();
            service.setIsActive(isActive);
            deliveryServiceRepository.save(service);
        }
    }

    public void checkAndUpdateServiceAvailability(Long serviceId) {
        Optional<DeliveryService> serviceOpt = deliveryServiceRepository.findById(serviceId);
        if (serviceOpt.isPresent()) {
            DeliveryService service = serviceOpt.get();
            long activeOrders = service.getOrders().stream()
                    .filter(order -> order.getStatus() != OrderStatus.DELIVERED &&
                            order.getStatus() != OrderStatus.REJECTED &&
                            order.getStatus() != OrderStatus.CANCELED)
                    .count();

            if (activeOrders >= service.getMaxOrdersPerDay()) {
                service.setIsActive(false);
                deliveryServiceRepository.save(service);
            }
        }
    }


    public List<DeliveryService> getServicesByProviderId(Long providerId) {
        return deliveryServiceRepository.findByDeliveryPersonId(providerId);
    }

    public void deleteService(Long serviceId) {
        Optional<DeliveryService> serviceOpt = deliveryServiceRepository.findById(serviceId);
        if (serviceOpt.isPresent()) {
            deliveryServiceRepository.deleteById(serviceId);
        } else {
            throw new RuntimeException("Delivery service not found with id: " + serviceId);
        }
    }

    public DeliveryService getServiceById(Long serviceId) {
        Optional<DeliveryService> serviceOpt = deliveryServiceRepository.findById(serviceId);
        if (serviceOpt.isPresent()) {
            return serviceOpt.get();
        } else {
            throw new RuntimeException("Delivery service not found with id: " + serviceId);
        }
    }


}