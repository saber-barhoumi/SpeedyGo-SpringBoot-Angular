import { Component, OnInit } from '@angular/core';
import { Report } from 'src/app/Models/returns/report.module';
import {ReportsServiceService } from 'src/app/Services/reports.service.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit{
  reportItems: Report[] = [];
  selectedReport: Report | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

 
  constructor(private reportsService: ReportsServiceService) {}

  ngOnInit(): void {
    this.getAllReports();
  }
  getAllReports(): void {
    this.reportsService.getAllReports().subscribe({
      next: (reports: Report[]) => {
        console.log('Reports received:', reports);
        this.reportItems = reports; // Correction de l'affectation
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load reports';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  deleteReport(id: number | undefined): void {
    if (id === undefined) {
      this.errorMessage = 'Invalid Return ID';
      return;  // Si l'ID est invalide, on arrête l'exécution
    }
  
    if (confirm('Are you sure you want to delete this return?')) {
      this.reportsService.deleteReport(id).subscribe(
        () => {
          console.log('Return deleted successfully');
          this.getAllReports();
        },
       
      );
    }
  }
}
