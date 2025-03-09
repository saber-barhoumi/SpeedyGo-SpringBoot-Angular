package com.ski.speedygobackend.Service.ReportManagement;

import com.ski.speedygobackend.Entity.ReportManagement.Report;

import com.ski.speedygobackend.Repository.IReportRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@AllArgsConstructor
public class ReportServicesImpl implements  IReportServices {
    @Autowired
    IReportRepository reportRepository;





/*
    @Override
    public Report updateReport(Long reportID, Report updatedReport) {
        // Fetch the existing report from the database
        Report existingReport = reportRepository.findById(reportID)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportID));

        // Update only the fields that are provided in the updatedReport
        if (updatedReport.getReportName() != null) {
            existingReport.setReportName(updatedReport.getReportName());
        }
        if (updatedReport.getReportDescription() != null) {
            existingReport.setReportDescription(updatedReport.getReportDescription());
        }
        if (updatedReport.getStatus() != null) {
            existingReport.setStatus(updatedReport.getStatus());
        }
        if (updatedReport.getUser() != null) {
            existingReport.setUser(updatedReport.getUser());
        }

        // Save the updated report
        return reportRepository.save(existingReport);
    }

*/
    public void deleteReport(Long reportID) {
        reportRepository.deleteById(reportID);
    }


    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }


    public Report getReportById(Long id) {

        return reportRepository.findById(id).orElse(null);
    }

    @Override
    public Report addReport(Report report) {
        return reportRepository.save(report);
    }


}
