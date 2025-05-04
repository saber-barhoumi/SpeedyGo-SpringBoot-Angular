package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.RecrutementManagement.Recruitment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RecruitmentStatus;
import com.ski.speedygobackend.Repository.IDeliveryVehicleRepository;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.RecrutementManagement.IDeliveryVehicleService;
import com.ski.speedygobackend.Service.RecrutementManagement.IRecruitmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment")
@CrossOrigin(origins = "http://localhost:4200")
public class RecruitmentController {

    @Autowired
    private final IDeliveryVehicleService deliveryVehicleService;


    private static final Logger logger = LoggerFactory.getLogger(RecruitmentController.class);


    private final IRecruitmentService recruitmentService;
    private final IUserRepository userRepository;
    private final IDeliveryVehicleRepository deliveryVehicleRepository;



    @Autowired
    public RecruitmentController(IRecruitmentService recruitmentService,
                                 IUserRepository userRepository,
                                 IDeliveryVehicleService deliveryVehicleService, IDeliveryVehicleRepository deliveryVehicleRepository) {
        this.recruitmentService = recruitmentService;
        this.userRepository = userRepository;
        this.deliveryVehicleService = deliveryVehicleService;
        this.deliveryVehicleRepository = deliveryVehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Recruitment>> getAllRecruitments() {
        return ResponseEntity.ok(recruitmentService.getAllRecruitments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recruitment> getRecruitmentById(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentService.getRecruitmentById(id));
    }

    // Updated method to use path variable for user ID
    @PostMapping("/{userId}")
    public ResponseEntity<?> createRecruitment(@RequestBody Recruitment recruitment, @PathVariable Long userId) {
        try {
            logger.info("Creating recruitment for user ID: {}", userId);

            // Get the user
            User applicant = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Check if user already has an active application
            if (recruitmentService.hasActiveApplication(applicant)) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You already have an active application in progress.");
                response.put("timestamp", LocalDateTime.now().toString());
                response.put("user", applicant.getFirstName() + " " + applicant.getLastName());
                return ResponseEntity.badRequest().body(response);
            }

            // Set the applicant
            recruitment.setApplicant(applicant);

            // Handle vehicle reference if provided
            if (recruitment.getDeliveryVehicle() != null && recruitment.getDeliveryVehicle().getVehicleId() != null) {
                Long vehicleId = recruitment.getDeliveryVehicle().getVehicleId();

                // Instead of creating a new vehicle, fetch it from the database
                DeliveryVehicle vehicle = deliveryVehicleRepository.findById(vehicleId)
                        .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));

                // Set the fetched vehicle
                recruitment.setDeliveryVehicle(vehicle);
                logger.info("Associated vehicle with ID: {} to recruitment", vehicleId);
            }

            // Set default status if not provided
            if (recruitment.getStatus() == null) {
                recruitment.setStatus(RecruitmentStatus.PENDING);
            }

            // Set application date if not provided
            if (recruitment.getApplicationDate() == null) {
                recruitment.setApplicationDate(LocalDateTime.now());
            }

            // Set last status update date
            recruitment.setLastStatusUpdateDate(LocalDateTime.now());

            // Create the recruitment
            Recruitment createdRecruitment = recruitmentService.createRecruitment(recruitment);
            logger.info("Created recruitment with ID: {}", createdRecruitment.getRecruitmentId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdRecruitment);
        } catch (RuntimeException e) {
            logger.error("Error creating recruitment for user ID: " + userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("status", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error creating recruitment for user ID: " + userId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("error", "An unexpected error occurred while creating recruitment");
            response.put("message", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("status", "Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateRecruitment(@PathVariable Long id, @RequestBody Recruitment recruitmentDetails) {
        try {
            logger.info("Updating recruitment with ID: {}", id);

            // Get the current recruitment
            Recruitment currentRecruitment = recruitmentService.getRecruitmentById(id);

            // Keep the same applicant - we don't allow changing applicant
            recruitmentDetails.setApplicant(currentRecruitment.getApplicant());

            // Handle vehicle reference if provided
            if (recruitmentDetails.getDeliveryVehicle() != null && recruitmentDetails.getDeliveryVehicle().getVehicleId() != null) {
                Long vehicleId = recruitmentDetails.getDeliveryVehicle().getVehicleId();

                // Fetch vehicle from database
                DeliveryVehicle vehicle = deliveryVehicleRepository.findById(vehicleId)
                        .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));

                // Set the fetched vehicle
                recruitmentDetails.setDeliveryVehicle(vehicle);
                logger.info("Updated vehicle association to ID: {}", vehicleId);
            } else {
                // Keep the existing vehicle if new one not provided
                recruitmentDetails.setDeliveryVehicle(currentRecruitment.getDeliveryVehicle());
            }

            // Update timestamps
            recruitmentDetails.setLastStatusUpdateDate(LocalDateTime.now());
            if (recruitmentDetails.getApplicationDate() == null) {
                recruitmentDetails.setApplicationDate(currentRecruitment.getApplicationDate());
            }

            // Update the recruitment
            Recruitment updatedRecruitment = recruitmentService.updateRecruitment(id, recruitmentDetails);
            logger.info("Successfully updated recruitment with ID: {}", id);

            return ResponseEntity.ok(updatedRecruitment);
        } catch (RuntimeException e) {
            logger.error("Error updating recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error updating recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred while updating recruitment");
            response.put("message", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecruitment(@PathVariable Long id) {
        try {
            logger.info("Attempting to delete recruitment with ID: {}", id);

            // Verify recruitment exists before deleting
            Recruitment recruitment = recruitmentService.getRecruitmentById(id);
            logger.info("Found recruitment to delete: {} for applicant: {}",
                    recruitment.getRecruitmentId(),
                    recruitment.getApplicant().getEmail());

            // Delete the recruitment
            recruitmentService.deleteRecruitment(id);
            logger.info("Successfully deleted recruitment with ID: {}", id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Recruitment deleted successfully");
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error deleting recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error deleting recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred while deleting recruitment");
            response.put("message", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Recruitment>> getRecruitmentsByStatus(@PathVariable RecruitmentStatus status) {
        return ResponseEntity.ok(recruitmentService.getRecruitmentsByStatus(status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRecruitmentsByUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            return ResponseEntity.ok(recruitmentService.getRecruitmentsByApplicant(user));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateRecruitmentStatus(
            @PathVariable Long id,
            @RequestParam RecruitmentStatus status,
            @RequestParam(required = false) String feedback) {
        try {
            logger.info("Updating recruitment status for ID: {} to status: {} with feedback: {}",
                    id, status, feedback);

            Recruitment updatedRecruitment = recruitmentService.updateRecruitmentStatus(id, status, feedback);
            logger.info("Successfully updated status for recruitment ID: {}", id);

            return ResponseEntity.ok(updatedRecruitment);
        } catch (RuntimeException e) {
            logger.error("Error updating status for recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Unexpected error updating status for recruitment with ID: " + id, e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred while updating recruitment status");
            response.put("message", e.getMessage());
            response.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @GetMapping("/{id}/recommendation")
    public ResponseEntity<?> getRecommendation(@PathVariable Long id) {
        try {
            Map<String, Object> recommendation = recruitmentService.getAiRecommendation(id);
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}