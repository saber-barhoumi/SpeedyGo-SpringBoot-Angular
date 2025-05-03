package com.ski.speedygobackend.Controller.TouristManagement;

import com.ski.speedygobackend.DTO.TouristPlaceDTO;
import com.ski.speedygobackend.Entity.TouristManagement.TouristPlace;
import com.ski.speedygobackend.Service.TouristManagement.ITouristPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/tourist-places")
@RequiredArgsConstructor
public class TouristPlaceRestController {

    private final ITouristPlaceService touristPlaceService;

    // Convert entity to DTO
    private TouristPlaceDTO convertToDTO(TouristPlace touristPlace) {
        return new TouristPlaceDTO(
                touristPlace.getId(),
                touristPlace.getName(),
                touristPlace.getGovernorate(),
                touristPlace.getRating(),
                touristPlace.getReviews(),
                touristPlace.getType(),
                touristPlace.getImageUrl(),
                touristPlace.getCreatedAt()
        );
    }

    // Convert from DTO to entity
    private TouristPlace convertToEntity(TouristPlaceDTO dto) {
        TouristPlace entity = new TouristPlace();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setGovernorate(dto.getGovernorate());
        entity.setRating(dto.getRating());
        entity.setReviews(dto.getReviews());
        entity.setType(dto.getType());
        entity.setImageUrl(dto.getImageUrl());
        entity.setCreatedAt(dto.getCreatedAt());
        return entity;
    }

    @GetMapping
    public ResponseEntity<List<TouristPlaceDTO>> getAllTouristPlaces() {
        List<TouristPlace> touristPlaces = touristPlaceService.getAllTouristPlaces();
        List<TouristPlaceDTO> touristPlaceDTOs = touristPlaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(touristPlaceDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TouristPlaceDTO> getTouristPlaceById(@PathVariable Long id) {
        Optional<TouristPlace> touristPlaceOptional = touristPlaceService.getTouristPlaceById(id);
        return touristPlaceOptional
                .map(touristPlace -> ResponseEntity.ok(convertToDTO(touristPlace)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TouristPlaceDTO> createTouristPlace(@RequestBody TouristPlaceDTO touristPlaceDTO) {
        TouristPlace touristPlace = convertToEntity(touristPlaceDTO);
        TouristPlace createdTouristPlace = touristPlaceService.createTouristPlace(touristPlace);
        return ResponseEntity.ok(convertToDTO(createdTouristPlace));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TouristPlaceDTO> updateTouristPlace(@PathVariable Long id, @RequestBody TouristPlaceDTO touristPlaceDTO) {
        try {
            TouristPlace touristPlace = convertToEntity(touristPlaceDTO);
            TouristPlace updatedTouristPlace = touristPlaceService.updateTouristPlace(id, touristPlace);
            return ResponseEntity.ok(convertToDTO(updatedTouristPlace));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTouristPlace(@PathVariable Long id) {
        touristPlaceService.deleteTouristPlace(id);
        return ResponseEntity.noContent().build();
    }

    // Search endpoints
    @GetMapping("/search/governorate/{governorate}")
    public ResponseEntity<List<TouristPlaceDTO>> getTouristPlacesByGovernorate(@PathVariable String governorate) {
        List<TouristPlace> touristPlaces = touristPlaceService.findTouristPlacesByGovernorate(governorate);
        List<TouristPlaceDTO> touristPlaceDTOs = touristPlaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(touristPlaceDTOs);
    }

    @GetMapping("/search/type/{type}")
    public ResponseEntity<List<TouristPlaceDTO>> getTouristPlacesByType(@PathVariable String type) {
        List<TouristPlace> touristPlaces = touristPlaceService.findTouristPlacesByType(type);
        List<TouristPlaceDTO> touristPlaceDTOs = touristPlaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(touristPlaceDTOs);
    }

    @GetMapping("/search/rating/{rating}")
    public ResponseEntity<List<TouristPlaceDTO>> getTouristPlacesByMinimumRating(@PathVariable Double rating) {
        List<TouristPlace> touristPlaces = touristPlaceService.findTouristPlacesByMinimumRating(rating);
        List<TouristPlaceDTO> touristPlaceDTOs = touristPlaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(touristPlaceDTOs);
    }

    @GetMapping("/search/governorate/{governorate}/type/{type}")
    public ResponseEntity<List<TouristPlaceDTO>> getTouristPlacesByGovernorateAndType(
            @PathVariable String governorate,
            @PathVariable String type) {
        List<TouristPlace> touristPlaces = touristPlaceService.findTouristPlacesByGovernorateAndType(governorate, type);
        List<TouristPlaceDTO> touristPlaceDTOs = touristPlaces.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(touristPlaceDTOs);
    }
}