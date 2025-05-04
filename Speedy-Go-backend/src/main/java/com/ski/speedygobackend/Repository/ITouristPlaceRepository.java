package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.TouristManagement.TouristPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITouristPlaceRepository extends JpaRepository<TouristPlace, Long> {
    // Find tourist places by governorate name
    List<TouristPlace> findByGovernorate(String governorate);

    // Find tourist places by type (e.g., "Museum", "Park", "Historical Site")
    List<TouristPlace> findByType(String type);

    // Find tourist places by rating greater than or equal to a value
    List<TouristPlace> findByRatingGreaterThanEqual(Double rating);

    // Find tourist places by governorate and type
    List<TouristPlace> findByGovernorateAndType(String governorate, String type);
}