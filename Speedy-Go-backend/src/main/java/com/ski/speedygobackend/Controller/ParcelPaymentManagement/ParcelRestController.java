package com.ski.speedygobackend.Controller.ParcelPaymentManagement;

import com.ski.speedygobackend.Config.ParcelStatusPublisher;
import com.ski.speedygobackend.DTO.ParcelDTO;
import com.ski.speedygobackend.Entity.ParcelPaymentManagement.Parcel;
import com.ski.speedygobackend.Enum.ParcelStatus;
import com.ski.speedygobackend.Service.ParcelPaymentManagement.IParcelServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("/parcel")
@RestController
public class ParcelRestController {
    private static final Logger logger = LoggerFactory.getLogger(ParcelRestController.class);
    private final IParcelServices parcelServices;
    private final ParcelStatusPublisher statusPublisher;

    @Autowired
    public ParcelRestController(IParcelServices parcelServices, ParcelStatusPublisher statusPublisher) {
        this.parcelServices = parcelServices;
        this.statusPublisher = statusPublisher;
    }

    @PostMapping("/add")
    public ResponseEntity<ParcelDTO> addParcel(@RequestBody Parcel parcel) {
        if (parcel == null || parcel.getUserId() == null || parcel.getParcelstatus() == null) {
            logger.warn("Invalid parcel data: {}", parcel);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Parcel savedParcel = parcelServices.addParcel(parcel);
        logger.info("Added parcel with ID: {}", savedParcel.getParcelId());
        return ResponseEntity.ok(toParcelDTO(savedParcel));
    }

    @PutMapping("/update/{parcelId}")
    public ResponseEntity<ParcelDTO> updateParcel(@PathVariable Long parcelId, @RequestBody Parcel parcel) {
        if (parcelId == null || parcelId <= 0 || parcel == null) {
            logger.warn("Invalid update request: parcelId={}, parcel={}", parcelId, parcel);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Parcel updatedParcel = parcelServices.updateParcel(parcelId, parcel);
        if (updatedParcel == null) {
            logger.warn("Parcel not found for update: parcelId={}", parcelId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        logger.info("Updated parcel with ID: {}", parcelId);
        return ResponseEntity.ok(toParcelDTO(updatedParcel));
    }

    @GetMapping("/get/{parcelId}")
    public ResponseEntity<ParcelDTO> getParcel(@PathVariable Long parcelId) {
        if (parcelId == null || parcelId <= 0) {
            logger.warn("Invalid parcelId: {}", parcelId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Optional<Parcel> parcelOpt = parcelServices.findById(parcelId);
        if (parcelOpt.isPresent()) {
            ParcelDTO dto = toParcelDTO(parcelOpt.get());
            logger.info("Retrieved parcel with ID: {}, DTO: {}", parcelId, dto);
            return ResponseEntity.ok(dto);
        }
        logger.warn("Parcel not found: parcelId={}", parcelId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ParcelDTO>> getAll() {
        List<Parcel> parcels = parcelServices.retrieveAll();
        List<ParcelDTO> parcelDTOs = parcels.stream()
                .map(this::toParcelDTO)
                .toList();
        logger.info("Retrieved {} parcels", parcelDTOs.size());
        return ResponseEntity.ok(parcelDTOs);
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<ParcelDTO>> getParcelsByUserId(@PathVariable Long userId) {
        if (userId == null || userId <= 0) {
            logger.warn("Invalid userId: {}", userId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        List<Parcel> parcels = parcelServices.findByUserId(userId);
        List<ParcelDTO> parcelDTOs = parcels.stream()
                .map(this::toParcelDTO)
                .toList();
        logger.info("Retrieved {} parcels for userId: {}, DTOs: {}", parcelDTOs.size(), userId, parcelDTOs);
        return ResponseEntity.ok(parcelDTOs);
    }

    @DeleteMapping("/delete/{parcelId}")
    public ResponseEntity<Void> deleteParcel(@PathVariable Long parcelId) {
        if (parcelId == null || parcelId <= 0) {
            logger.warn("Invalid parcelId for deletion: {}", parcelId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        parcelServices.deleteParcel(parcelId);
        logger.info("Deleted parcel with ID: {}", parcelId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rest/{id}/next-status")
    public ResponseEntity<Map<String, Object>> advanceParcelStatus(@PathVariable Long id) {
        if (id == null || id <= 0) {
            logger.warn("Invalid parcelId for status update: {}", id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid parcel ID"));
        }
        Optional<Parcel> parcelOpt = parcelServices.findById(id);
        if (!parcelOpt.isPresent()) {
            logger.warn("Parcel not found for status update: parcelId={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parcel not found"));
        }

        Parcel parcel = parcelOpt.get();
        ParcelStatus currentStatus = parcel.getParcelstatus();
        ParcelStatus[] allStatuses = ParcelStatus.values();
        int nextIndex = currentStatus.ordinal() + 1;

        if (nextIndex < allStatuses.length && currentStatus != ParcelStatus.REFUSED) {
            ParcelStatus newStatus = allStatuses[nextIndex];
            parcelServices.changeParcelStatus(parcel, newStatus);
            statusPublisher.notifyStatusChange(id, newStatus);
            logger.info("Advanced parcel status: parcelId={}, newStatus={}", id, newStatus);
            return ResponseEntity.ok(Map.of("status", newStatus.name()));
        }

        logger.warn("Cannot advance status: parcelId={}, currentStatus={}", id, currentStatus);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Cannot advance status from " + currentStatus));
    }

    @PostMapping("/rest/{id}/refuse")
    public ResponseEntity<Map<String, Object>> refuseParcel(@PathVariable Long id) {
        if (id == null || id <= 0) {
            logger.warn("Invalid parcelId for refusal: {}", id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid parcel ID"));
        }
        Optional<Parcel> parcelOpt = parcelServices.findById(id);
        if (!parcelOpt.isPresent()) {
            logger.warn("Parcel not found for refusal: parcelId={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parcel not found"));
        }

        Parcel parcel = parcelOpt.get();
        if (parcel.getParcelstatus() != ParcelStatus.ORDERED) {
            logger.warn("Parcel cannot be refused, not in ORDERED status: parcelId={}, status={}", id, parcel.getParcelstatus());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Parcel can only be refused in ORDERED status"));
        }

        parcelServices.changeParcelStatus(parcel, ParcelStatus.REFUSED);
        statusPublisher.notifyStatusChange(id, ParcelStatus.REFUSED);
        logger.info("Parcel refused: parcelId={}, newStatus=REFUSED", id);
        return ResponseEntity.ok(Map.of("status", ParcelStatus.REFUSED.name()));
    }

    @PostMapping("/rest/{id}/accept")
    public ResponseEntity<Map<String, Object>> acceptParcel(@PathVariable Long id) {
        if (id == null || id <= 0) {
            logger.warn("Invalid parcelId for acceptance: {}", id);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid parcel ID"));
        }
        Optional<Parcel> parcelOpt = parcelServices.findById(id);
        if (!parcelOpt.isPresent()) {
            logger.warn("Parcel not found for acceptance: parcelId={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parcel not found"));
        }

        Parcel parcel = parcelOpt.get();
        if (parcel.getParcelstatus() != ParcelStatus.ORDERED && parcel.getParcelstatus() != ParcelStatus.REFUSED) {
            logger.warn("Parcel cannot be accepted, not in ORDERED or REFUSED status: parcelId={}, status={}", id, parcel.getParcelstatus());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Parcel can only be accepted in ORDERED or REFUSED status"));
        }

        // If already ORDERED, no status change needed; otherwise, change from REFUSED to ORDERED
        if (parcel.getParcelstatus() != ParcelStatus.ORDERED) {
            parcelServices.changeParcelStatus(parcel, ParcelStatus.ORDERED);
            statusPublisher.notifyStatusChange(id, ParcelStatus.ORDERED);
        }
        logger.info("Parcel accepted: parcelId={}, newStatus=ORDERED", id);
        return ResponseEntity.ok(Map.of("status", ParcelStatus.ORDERED.name()));
    }

    @GetMapping("/tracking/{parcelId}")
    public ResponseEntity<Map<String, Object>> getTrackingInfo(@PathVariable Long parcelId) {
        if (parcelId == null || parcelId <= 0) {
            logger.warn("Invalid parcelId for tracking: {}", parcelId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid parcel ID"));
        }
        Optional<Parcel> parcelOpt = parcelServices.findById(parcelId);
        if (!parcelOpt.isPresent()) {
            logger.warn("Parcel not found for tracking: parcelId={}", parcelId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parcel not found"));
        }

        Parcel parcel = parcelOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("parcelId", parcel.getParcelId());
        response.put("status", parcel.getParcelstatus().name());
        response.put("parcelName", parcel.getParcelName());
        logger.info("Retrieved tracking info: parcelId={}", parcelId);
        return ResponseEntity.ok(response);
    }

    private ParcelDTO toParcelDTO(Parcel parcel) {
        ParcelDTO dto = new ParcelDTO();
        dto.setParcelId(parcel.getParcelId());
        dto.setParcelName(parcel.getParcelName());
        dto.setDeliveryAddress(parcel.getDeliveryAddress());
        dto.setCurrentLocation(parcel.getCurrentLocation());
        dto.setWeight(parcel.getWeight());
        dto.setTrip(parcel.getTrip());
        dto.setInternationalShipping(parcel.getInternationalShipping());
        dto.setUserId(parcel.getUserId());
        dto.setParcelstatus(parcel.getParcelstatus() != null ? parcel.getParcelstatus().name() : null);
        return dto;
    }
}