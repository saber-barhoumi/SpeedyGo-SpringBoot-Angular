package com.ski.speedygobackend.Repository.DeliveryManagement;

import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryOrder;
import com.ski.speedygobackend.Entity.DeliveryManagement.DeliveryService;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    // Method to find orders by customer
    List<DeliveryOrder> findByCustomer(User customer);

    // Method to find orders by delivery service
    List<DeliveryOrder> findByDeliveryService(DeliveryService service);

    // Method to find orders by delivery person ID
    List<DeliveryOrder> findByDeliveryPersonId(Long personId);

    // Method to find orders by delivery person ID and status
    List<DeliveryOrder> findByDeliveryPersonIdAndStatus(Long personId, OrderStatus status);

    // Custom query to find orders by customer ID and status
    @Query("SELECT o FROM DeliveryOrder o WHERE o.customer.UserId = :userId AND o.status IN :statuses")
    List<DeliveryOrder> findByCustomerIdAndStatusIn(
            @Param("userId") Long userId,
            @Param("statuses") List<OrderStatus> statuses
    );
}