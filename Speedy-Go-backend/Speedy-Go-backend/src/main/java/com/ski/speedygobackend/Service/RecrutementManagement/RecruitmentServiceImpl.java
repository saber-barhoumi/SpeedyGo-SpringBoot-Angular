package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.Recruitment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RecruitmentStatus;
import com.ski.speedygobackend.Repository.IRecruitmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class RecruitmentServiceImpl implements IRecruitmentService {

    private final IRecruitmentRepository recruitmentRepository;

    @Autowired
    public RecruitmentServiceImpl(IRecruitmentRepository recruitmentRepository) {
        this.recruitmentRepository = recruitmentRepository;
    }

    @Override
    public List<Recruitment> getAllRecruitments() {
        return recruitmentRepository.findAll();
    }

    @Override
    public Recruitment getRecruitmentById(Long id) {
        return recruitmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recruitment not found with id: " + id));
    }

    @Override
    public Recruitment createRecruitment(Recruitment recruitment) {
        // Set application date to now
        recruitment.setApplicationDate(LocalDateTime.now());

        // Set initial status to PENDING
        recruitment.setStatus(RecruitmentStatus.PENDING);

        // Set last status update date
        recruitment.setLastStatusUpdateDate(LocalDateTime.now());

        return recruitmentRepository.save(recruitment);
    }

    @Override
    public Recruitment updateRecruitment(Long id, Recruitment recruitmentDetails) {
        Recruitment recruitment = getRecruitmentById(id);

        // Update fields
        recruitment.setYearsOfExperience(recruitmentDetails.getYearsOfExperience());
        recruitment.setPreviousEmployer(recruitmentDetails.getPreviousEmployer());
        recruitment.setDrivingLicenseNumber(recruitmentDetails.getDrivingLicenseNumber());
        recruitment.setDrivingLicenseIssueDate(recruitmentDetails.getDrivingLicenseIssueDate());
        recruitment.setDrivingLicenseCategory(recruitmentDetails.getDrivingLicenseCategory());
        recruitment.setCoverLetter(recruitmentDetails.getCoverLetter());
        recruitment.setResumeFilePath(recruitmentDetails.getResumeFilePath());

        // Don't update status here - use updateRecruitmentStatus method

        return recruitmentRepository.save(recruitment);
    }

    @Override
    public void deleteRecruitment(Long id) {
        Recruitment recruitment = getRecruitmentById(id);
        recruitmentRepository.delete(recruitment);
    }

    @Override
    public List<Recruitment> getRecruitmentsByStatus(RecruitmentStatus status) {
        return recruitmentRepository.findByStatus(status);
    }

    @Override
    public List<Recruitment> getRecruitmentsByApplicant(User applicant) {
        return recruitmentRepository.findByApplicant(applicant);
    }

    @Override
    public boolean hasActiveApplication(User applicant) {
        // Check if user has any application in non-final statuses
        List<RecruitmentStatus> activeStatuses = Arrays.asList(
                RecruitmentStatus.PENDING,
                RecruitmentStatus.UNDER_REVIEW,
                RecruitmentStatus.INTERVIEW_SCHEDULED
        );

        return recruitmentRepository.existsByApplicantAndStatusIn(applicant, activeStatuses);
    }

    @Override
    public Recruitment updateRecruitmentStatus(Long id, RecruitmentStatus newStatus, String feedback) {
        Recruitment recruitment = getRecruitmentById(id);

        // Update status
        recruitment.setStatus(newStatus);
        recruitment.setLastStatusUpdateDate(LocalDateTime.now());

        // Set feedback if provided
        if (feedback != null && !feedback.isEmpty()) {
            recruitment.setAdminFeedback(feedback);
        }

        return recruitmentRepository.save(recruitment);
    }
}