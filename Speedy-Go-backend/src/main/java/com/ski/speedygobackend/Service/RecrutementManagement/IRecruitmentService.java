package com.ski.speedygobackend.Service.RecrutementManagement;

import com.ski.speedygobackend.Entity.RecrutementManagement.Recruitment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RecruitmentStatus;

import java.util.List;

public interface IRecruitmentService {
    List<Recruitment> getAllRecruitments();
    Recruitment getRecruitmentById(Long id);
    Recruitment createRecruitment(Recruitment recruitment);
    Recruitment updateRecruitment(Long id, Recruitment recruitmentDetails);
    void deleteRecruitment(Long id);
    List<Recruitment> getRecruitmentsByStatus(RecruitmentStatus status);
    List<Recruitment> getRecruitmentsByApplicant(User applicant);
    boolean hasActiveApplication(User applicant);
    Recruitment updateRecruitmentStatus(Long id, RecruitmentStatus newStatus, String feedback);
}