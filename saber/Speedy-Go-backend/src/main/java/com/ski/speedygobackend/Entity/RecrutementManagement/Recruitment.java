package com.ski.speedygobackend.Entity.RecrutementManagement;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RecruitmentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "recruitment")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Recruitment implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recruitment_id")
    @JsonProperty("recruitmentId")
    Long recruitmentId;

    // Personal Experience Details
    @Column(name = "years_of_experience")
    @JsonProperty("yearsOfExperience")
    Integer yearsOfExperience;

    @Column(name = "previous_employer", length = 255)
    @JsonProperty("previousEmployer")
    String previousEmployer;

    @Column(name = "driving_license_number", length = 100)
    @JsonProperty("drivingLicenseNumber")
    String drivingLicenseNumber;

    @Column(name = "driving_license_issue_date")
    @JsonProperty("drivingLicenseIssueDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime drivingLicenseIssueDate;

    @Column(name = "driving_license_category", length = 50)
    @JsonProperty("drivingLicenseCategory")
    String drivingLicenseCategory;

    // Application Details
    @Column(name = "application_date")
    @JsonProperty("applicationDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime applicationDate;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    @JsonProperty("coverLetter")
    String coverLetter;

    @Column(name = "resume_file_path", length = 255)
    @JsonProperty("resumeFilePath")
    String resumeFilePath;

    // Status tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @JsonProperty("status")
    RecruitmentStatus status;

    @Column(name = "admin_feedback", columnDefinition = "TEXT")
    @JsonProperty("adminFeedback")
    String adminFeedback;

    @Column(name = "last_status_update_date")
    @JsonProperty("lastStatusUpdateDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime lastStatusUpdateDate;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonProperty("applicant")
    @JsonIgnoreProperties({"password", "roles", "authorities"})
    User applicant;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "vehicle_id")
    @JsonProperty("deliveryVehicle")
    DeliveryVehicle deliveryVehicle;

    // Pre-persist hook to set default values
    @PrePersist
    protected void onCreate() {
        if (applicationDate == null) {
            applicationDate = LocalDateTime.now();
        }
        if (status == null) {
            status = RecruitmentStatus.PENDING;
        }
        lastStatusUpdateDate = LocalDateTime.now();
    }

    // Pre-update hook to update status change date
    @PreUpdate
    protected void onUpdate() {
        lastStatusUpdateDate = LocalDateTime.now();
    }

    
}