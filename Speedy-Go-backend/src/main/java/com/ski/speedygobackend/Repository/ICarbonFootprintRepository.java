package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.EnvironmentalImpactManagement.CarbonFootPrint;
import com.ski.speedygobackend.Entity.TripManagement.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICarbonFootprintRepository extends JpaRepository<CarbonFootPrint, Long> {


}
