package com.ski.speedygobackend.Repository;

import com.ski.speedygobackend.Entity.ReportManagement.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IReportRepository extends JpaRepository<Report,Long> {
}
