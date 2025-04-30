import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from 'src/app/services/report.service';
import { Router } from '@angular/router';
import { Report, ReportStatus } from 'src/app/models/report';

@Component({
  selector: 'app-formreport',
  templateUrl: './formreport.component.html',
  styleUrls: ['./formreport.component.css']
})
export class FormReportComponent {

  reportForm: FormGroup;
  reportStatusEnum = ReportStatus; // Ajout de l'enum pour pouvoir l'utiliser dans le template

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private router: Router
  ) {
    // Création du formulaire avec des validations
    this.reportForm = this.fb.group({
      report_name: ['', Validators.required],
      report_description: ['', Validators.required],
    });
  }

  // Fonction d'ajout du rapport
  onSubmit(): void {
    if (this.reportForm.valid) {
      const report: Report = this.reportForm.value;
      this.reportService.addReport(report).subscribe(
        (response) => {
          console.log('Rapport ajouté avec succès', response);
        //  this.router.navigate(['/reports']);  // Redirection vers la liste des rapports
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du rapport', error);
        }
      );
    }
  }
}
