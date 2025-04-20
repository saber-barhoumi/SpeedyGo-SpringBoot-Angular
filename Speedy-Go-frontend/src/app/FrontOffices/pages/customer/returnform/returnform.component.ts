import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReturnService } from 'src/app/services/return.service';
import { Returns } from 'src/app/models/return';

@Component({
  selector: 'app-returnform',
  templateUrl: './returnform.component.html'
})
export class ReturnFormComponent {
  returnForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private returnService: ReturnService
  ) {
    this.returnForm = this.fb.group({
      retourstatus: ['', Validators.required],
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.returnForm.valid) {
      const returnData: Returns = this.returnForm.value;
      this.returnService.addReturn(returnData).subscribe({
        next: (response) => {
          console.log('Retour ajouté :', response);
          this.returnForm.reset();
        },
        error: (error) => {
          console.error('Erreur lors de l’ajout :', error);
        }
      });
    }
  }
}
