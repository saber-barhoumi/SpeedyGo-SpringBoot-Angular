package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.CarpoolingManagement.ReservationCarpoo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IReservationRepository extends JpaRepository <ReservationCarpoo,Long>{

    List<ReservationCarpoo> findByUserId(Long userId);

}
