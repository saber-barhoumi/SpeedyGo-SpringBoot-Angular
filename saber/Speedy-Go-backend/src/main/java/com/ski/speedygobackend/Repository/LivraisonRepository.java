package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.RecrutementManagement.Livraison;
import com.ski.speedygobackend.Enum.LivraisonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LivraisonRepository extends JpaRepository<Livraison, Long> {
    List<Livraison> findByStatus(LivraisonStatus status);
    List<Livraison> findByAssignedVehicleVehicleId(Long vehicleId);

    // Using JPQL query to be more explicit about the join
    @Query("SELECT l FROM Livraison l WHERE l.createdBy.UserId = :userId")
    List<Livraison> findByCreatedByUserId(@Param("userId") Long userId);
}