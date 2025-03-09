import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReturnsService } from 'src/app/services/returns.service';
import { Returns, RetourStatus, RetourType } from 'src/app/models/returns/returns.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-return-form',
  templateUrl: './return-form.component.html',
  styleUrls: ['./return-form.component.css']
})
export class ReturnFormComponent implements OnInit {
  returnForm!: FormGroup;
  retourStatusList: RetourStatus[] = Object.values(RetourStatus);
  retourTypeList: RetourType[] = Object.values(RetourType);
  errorMessage: string = '';
  successMessage: string = '';
  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private returnsService: ReturnsService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  // Créer le formulaire
  createForm(): void {
    this.returnForm = this.fb.group({
      returnID: [null],  // ID généré automatiquement côté backend
      retourstatus: ['PENDING'],
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required],
      //parcelId: ['', Validators.required]  // Assurez-vous que 'parcelId' est inclus
    });
  }

  // Soumettre le formulaire
  onSubmit() {
    if (this.returnForm.invalid) {
        return;
    }
    

    const returnData = this.returnForm.value;

    // Log the data sent to the backend
    console.log('Form data to send:', returnData);

    this.returnsService.createReturn(returnData).subscribe(
        (response) => {
            console.log('Return added:', response);
            this.successMessage = 'Return successfully created!';
            this.returnForm.reset();
            this.router.navigate(['/returns']);
        },
        (error) => {
            console.error('Error creating return:', error);
            this.errorMessage = 'There was an error creating the return. Please try again.';
        }
    );
}
}
