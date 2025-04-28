package com.ski.speedygobackend.Service.TouristManagement;

import com.ski.speedygobackend.Entity.TouristManagement.TouristPlace;

import java.util.List;
import java.util.Optional;

public interface ITouristPlaceService {
    List<TouristPlace> getAllTouristPlaces();
    Optional<TouristPlace> getTouristPlaceById(Long id);
    TouristPlace createTouristPlace(TouristPlace touristPlace);
    TouristPlace updateTouristPlace(Long id, TouristPlace touristPlace);
    void deleteTouristPlace(Long id);

    // Search methods
    List<TouristPlace> findTouristPlacesByGovernorate(String governorate);
    List<TouristPlace> findTouristPlacesByType(String type);
    List<TouristPlace> findTouristPlacesByMinimumRating(Double rating);
    List<TouristPlace> findTouristPlacesByGovernorateAndType(String governorate, String type);
}
