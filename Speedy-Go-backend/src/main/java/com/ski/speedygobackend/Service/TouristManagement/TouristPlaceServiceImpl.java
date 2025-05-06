package com.ski.speedygobackend.Service.TouristManagement;

import com.ski.speedygobackend.Entity.TouristManagement.TouristPlace;
import com.ski.speedygobackend.Repository.ITouristPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TouristPlaceServiceImpl implements ITouristPlaceService {

    private static final Logger logger = LoggerFactory.getLogger(TouristPlaceServiceImpl.class);
    private final ITouristPlaceRepository touristPlaceRepository;

    @Override
    public List<TouristPlace> getAllTouristPlaces() {
        return touristPlaceRepository.findAll();
    }

    @Override
    public Optional<TouristPlace> getTouristPlaceById(Long id) {
        return touristPlaceRepository.findById(id);
    }

    @Override
    @Transactional
    public TouristPlace createTouristPlace(TouristPlace touristPlace) {
        try {
            logger.debug("Saving tourist place: {}", touristPlace);
            return touristPlaceRepository.save(touristPlace);
        } catch (Exception e) {
            logger.error("Error creating tourist place", e);
            throw e;
        }
    }

    @Override
    @Transactional
    public TouristPlace updateTouristPlace(Long id, TouristPlace updatedTouristPlace) {
        return touristPlaceRepository.findById(id).map(touristPlace -> {
            touristPlace.setName(updatedTouristPlace.getName());
            touristPlace.setGovernorate(updatedTouristPlace.getGovernorate());
            touristPlace.setRating(updatedTouristPlace.getRating());
            touristPlace.setReviews(updatedTouristPlace.getReviews());
            touristPlace.setType(updatedTouristPlace.getType());
            touristPlace.setUrl(updatedTouristPlace.getUrl());
            touristPlace.setImageUrl(updatedTouristPlace.getImageUrl());

            return touristPlaceRepository.save(touristPlace);
        }).orElseThrow(() -> new RuntimeException("Tourist place not found with id: " + id));
    }

    @Override
    @Transactional
    public void deleteTouristPlace(Long id) {
        touristPlaceRepository.deleteById(id);
    }

    @Override
    public List<TouristPlace> findTouristPlacesByGovernorate(String governorate) {
        return touristPlaceRepository.findByGovernorate(governorate);
    }

    @Override
    public List<TouristPlace> findTouristPlacesByType(String type) {
        return touristPlaceRepository.findByType(type);
    }

    @Override
    public List<TouristPlace> findTouristPlacesByMinimumRating(Double rating) {
        return touristPlaceRepository.findByRatingGreaterThanEqual(rating);
    }

    @Override
    public List<TouristPlace> findTouristPlacesByGovernorateAndType(String governorate, String type) {
        return touristPlaceRepository.findByGovernorateAndType(governorate, type);
    }
}