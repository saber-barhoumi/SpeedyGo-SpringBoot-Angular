package com.ski.speedygobackend.Service.ReportManagement;

import com.ski.speedygobackend.Entity.ReportManagement.Report;
import com.ski.speedygobackend.Entity.ReturnManagment.Returns;

import java.util.List;

public interface IReportServices {

    List<Report> getAllReports();
    Report getReportById(Long id);
    Report addReport(Report report);
    void deleteReport(Long id);
   // public Report updateReport(Long reportID, Report report);

}
