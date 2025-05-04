import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from 'src/app/services/report.service';
import { Router } from '@angular/router';
import { Report, ReportStatus } from 'src/app/models/report';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formreport',
  templateUrl: './formreport.component.html',
  styleUrls: ['./formreport.component.css']
})
export class FormReportComponent {

  reportForm: FormGroup;
  reportStatusEnum = ReportStatus;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private router: Router
  ) {
    this.reportForm = this.fb.group({
      report_name: ['', Validators.required],
      report_description: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      const report: Report = this.reportForm.value;
      this.reportService.addReport(report).subscribe(
        (response) => {
          console.log('Rapport ajouté avec succès', response);

          // ✅ Affichage du message de succès avec redirection ensuite
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Le rapport a été ajouté avec succès !',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/customer']);
          });
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du rapport', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de l\'ajout du rapport.'
          });
        }
      );
    }
  }
}
