package com.ski.speedygobackend.Repository.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Enum.DeliveryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryServiceRepository extends JpaRepository<DeliveryService, Long> {
    List<DeliveryService> findByDeliveryTypeAndIsActive(DeliveryType type, Boolean isActive);

    @Query("SELECT ds FROM DeliveryService ds WHERE ds.deliveryPerson.UserId = :providerId")
    List<DeliveryService> findByDeliveryPersonId(@Param("providerId") Long providerId);
}