package com.ski.speedygobackend.DTO;

import com.ski.speedygobackend.Enum.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecruitmentDTO {
    // Recruitment information
    private Long userId;
    private Integer yearsOfExperience;
    private String previousEmployer;
    private String drivingLicenseNumber;
    private String drivingLicenseIssueDate;
    private String drivingLicenseCategory;
    private String coverLetter;

    // Vehicle information
    private String vehicleBrand;
    private String vehicleModel;
    private Integer vehicleYearOfManufacture;
    private String licensePlate;
    private String registrationNumber;
    private VehicleType vehicleType;
    private Float maxLoadCapacity;
    private Boolean hasRefrigeration;
    private Boolean isInsured;
    private String insuranceProvider;
    private String insurancePolicyNumber;
}