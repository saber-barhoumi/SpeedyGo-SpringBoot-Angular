import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';
import { Report } from 'src/app/models/report';

@Component({
  selector: 'app-listreport',
  templateUrl: './listreport.component.html',
  styleUrls: ['./listreport.component.css']
})
export class ListreportComponent implements OnInit {
  reports: Report[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe(
      (data) => {
        this.reports = data;
        console.log('Rapports récupérés :', data);
      },
      (error) => {
        console.error('Erreur lors du chargement des rapports', error);
      }
    );
  }
}
