package com.ski.speedygobackend.Controller.ReportManagement;

import com.ski.speedygobackend.Entity.ReportManagement.Report;

import com.ski.speedygobackend.Service.ReportManagement.ReportServicesImpl;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/report")
public class ReportRestController {

    private final ReportServicesImpl reportService;

    // Constructor injection
    @Autowired
    public ReportRestController(ReportServicesImpl reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public Report addReport(@RequestBody Report report) {
        return reportService.addReport(report);
    }

    // Récupérer tous les rapports
    @GetMapping
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    // Récupérer un rapport par ID
    @GetMapping("/getReport/{id}")
    public Report getReport(@PathVariable Long id) {
        return reportService.getReportById(id);
    }
/*
    @PutMapping("/{id}")
    public Report updateReport(@PathVariable Long id, @Valid @RequestBody Report report) {
        return reportService.updateReport(id, report);
    }
*/
    // Supprimer un rapport
    @DeleteMapping("/{id}")
    public void deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
    }
}

