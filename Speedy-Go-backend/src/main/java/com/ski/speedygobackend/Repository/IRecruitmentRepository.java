package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.RecrutementManagement.Recruitment;
import com.ski.speedygobackend.Entity.UserManagement.User;
import com.ski.speedygobackend.Enum.RecruitmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRecruitmentRepository extends JpaRepository<Recruitment, Long> {
    List<Recruitment> findByStatus(RecruitmentStatus status);
    List<Recruitment> findByApplicant(User applicant);
    boolean existsByApplicantAndStatusIn(User applicant, List<RecruitmentStatus> statuses);
}