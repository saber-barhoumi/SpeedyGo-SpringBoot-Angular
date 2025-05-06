package com.ski.speedygobackend.Controller.RecrutementManagement;

import com.ski.speedygobackend.DTO.RecruitmentDTO;
import com.ski.speedygobackend.Entity.RecrutementManagement.DeliveryVehicle;
import com.ski.speedygobackend.Entity.RecrutementManagement.Recruitment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Repository.IUserRepository;
import com.ski.speedygobackend.Service.RecrutementManagement.IDeliveryVehicleService;
import com.ski.speedygobackend.Service.RecrutementManagement.IRecruitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recruitment-form")
@CrossOrigin(origins = "http://localhost:4200")
public class RecruitmentFormController {

    private final IRecruitmentService recruitmentService;
    private final IDeliveryVehicleService deliveryVehicleService;
    private final IUserRepository userRepository;

    @Autowired
    public RecruitmentFormController(
            IRecruitmentService recruitmentService,
            IDeliveryVehicleService deliveryVehicleService,
            IUserRepository userRepository) {
        this.recruitmentService = recruitmentService;
        this.deliveryVehicleService = deliveryVehicleService;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitRecruitmentForm(@RequestBody RecruitmentDTO recruitmentDTO) {
        try {
            // Find the user
            User applicant = userRepository.findById(recruitmentDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + recruitmentDTO.getUserId()));

            // Check if the user already has an active application
            if (recruitmentService.hasActiveApplication(applicant)) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "You already have an active application in progress.");
                return ResponseEntity.badRequest().body(response);
            }

            // Check if license plate is already registered
            if (deliveryVehicleService.isLicensePlateAlreadyRegistered(recruitmentDTO.getLicensePlate())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "A vehicle with this license plate is already registered.");
                return ResponseEntity.badRequest().body(response);
            }

            // Create vehicle object
            DeliveryVehicle deliveryVehicle = new DeliveryVehicle();
            deliveryVehicle.setBrand(recruitmentDTO.getVehicleBrand());
            deliveryVehicle.setModel(recruitmentDTO.getVehicleModel());
            deliveryVehicle.setYearOfManufacture(recruitmentDTO.getVehicleYearOfManufacture());
            deliveryVehicle.setLicensePlate(recruitmentDTO.getLicensePlate());
            deliveryVehicle.setRegistrationNumber(recruitmentDTO.getRegistrationNumber());
            deliveryVehicle.setVehicleType(recruitmentDTO.getVehicleType());
            deliveryVehicle.setMaxLoadCapacity(Double.valueOf(recruitmentDTO.getMaxLoadCapacity()));
            deliveryVehicle.setHasRefrigeration(recruitmentDTO.getHasRefrigeration());
            deliveryVehicle.setIsInsured(recruitmentDTO.getIsInsured());
            deliveryVehicle.setInsuranceProvider(recruitmentDTO.getInsuranceProvider());
            deliveryVehicle.setInsurancePolicyNumber(recruitmentDTO.getInsurancePolicyNumber());

            // Create recruitment object
            Recruitment recruitment = new Recruitment();
            recruitment.setApplicant(applicant);
            recruitment.setYearsOfExperience(recruitmentDTO.getYearsOfExperience());
            recruitment.setPreviousEmployer(recruitmentDTO.getPreviousEmployer());
            recruitment.setDrivingLicenseNumber(recruitmentDTO.getDrivingLicenseNumber());

            // Parse the date string to LocalDateTime
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            recruitment.setDrivingLicenseIssueDate(LocalDateTime.parse(recruitmentDTO.getDrivingLicenseIssueDate(), formatter));

            recruitment.setDrivingLicenseCategory(recruitmentDTO.getDrivingLicenseCategory());
            recruitment.setCoverLetter(recruitmentDTO.getCoverLetter());

            // Link vehicle to recruitment
            recruitment.setDeliveryVehicle(deliveryVehicle);

            // Save the recruitment (which will also save the vehicle due to cascade)
            Recruitment savedRecruitment = recruitmentService.createRecruitment(recruitment);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedRecruitment);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}