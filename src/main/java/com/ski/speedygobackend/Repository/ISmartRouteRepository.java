package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.RouteManagement.SmartRoute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ISmartRouteRepository extends JpaRepository<SmartRoute, Long> {
    List<SmartRoute> findByStartLocationAndEndLocation(String startLocation, String endLocation);
}
