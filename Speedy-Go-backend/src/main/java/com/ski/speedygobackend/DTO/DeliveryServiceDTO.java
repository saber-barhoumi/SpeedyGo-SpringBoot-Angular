package com.ski.speedygobackend.DTO;




import com.ski.speedygobackend.Enum.DeliveryType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryServiceDTO implements Serializable {
    private Long serviceId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Delivery type is required")
    private DeliveryType deliveryType;

    private Set<String> countriesServed = new HashSet<>();
    private Set<String> acceptedGoodTypes = new HashSet<>();

    @Positive(message = "Max weight per order must be positive")
    private Double maxWeightPerOrder;

    @Positive(message = "Max orders per day must be positive")
    private Integer maxOrdersPerDay;

    @Positive(message = "Base price must be positive")
    private Double basePrice;

    @Positive(message = "Price per kg must be positive")
    private Double pricePerKg;

    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}