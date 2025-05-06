package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IParcelRepository extends JpaRepository<Parcel, Long> {
    @Query("SELECT p FROM Parcel p LEFT JOIN FETCH p.offres WHERE p.parcelId = :id")
    Optional<Parcel> findById(@Param("id") Long id);

    List<Parcel> findByUserId(Long userId);
}