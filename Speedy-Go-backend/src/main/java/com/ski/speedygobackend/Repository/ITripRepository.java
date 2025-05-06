package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.TripManagement.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITripRepository extends JpaRepository<Trip, Long> {
}
