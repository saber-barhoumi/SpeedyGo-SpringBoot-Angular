import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportStatus } from 'src/app/Models/returns/report.module';
import { ReportsServiceService } from 'src/app/Services/reports.service.service';

@Component({
  selector: 'app-reportsform',
  templateUrl: './reportsform.component.html',
  styleUrls: ['./reportsform.component.css']
})
export class ReportsformComponent implements OnInit {

  reportForm!: FormGroup;
  retourStatusList: ReportStatus[] = Object.values(ReportStatus);
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private reportService: ReportsServiceService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  // Créer le formulaire
  createForm(): void {
    this.reportForm = this.fb.group({
      report_id: [null],  // ID généré automatiquement côté backend
      report_name: ['', Validators.required],
      report_description: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  // Soumettre le formulaire
  onSubmit() {
    if (this.reportForm.invalid) {
      return;
    }

    const reportData = this.reportForm.value;

    console.log('Form data to send:', reportData);

    this.reportService.addReport(reportData).subscribe(
      (response) => {
        console.log('Report added:', response);
        this.successMessage = 'Report successfully created!';
        this.reportForm.reset();

        // Redirection après un petit délai
        setTimeout(() => {
          this.router.navigate(['/reports']);
        }, 1500);
      },
      (error) => {
        console.error('Error creating report:', error);
        this.errorMessage = 'There was an error creating the report. Please try again.';
      }
    );
  }
}
