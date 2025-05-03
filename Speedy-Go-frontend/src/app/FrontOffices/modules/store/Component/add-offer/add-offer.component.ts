import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService, Offer } from 'src/app/FrontOffices/services/offres/offre.service';

@Component({
  selector: 'app-add-offer',
  templateUrl: './add-offer.component.html',
  styleUrls: ['./add-offer.component.css']
})
export class AddOfferComponent implements OnInit {
  offerForm!: FormGroup;
  isSubmitting = false;
  storeId!: number;

  constructor(
    private fb: FormBuilder,
    private offersService: OffersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.storeId = params['storeId'];
    });
  }

  initForm(): void {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      image: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      date_start: [null],
      available: [true, Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.offerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.offerForm.valid) {
      this.isSubmitting = true;
      const offerData: Offer = this.offerForm.value;

      this.offersService.createOffer(offerData, this.storeId).subscribe({
        next: (response) => {
          console.log('Offer created successfully', response);
          this.isSubmitting = false;
          this.router.navigate(['/offres']);
        },
        error: (error) => {
          console.error('Error creating offer', error);
          this.isSubmitting = false;
          this.router.navigate([`/offres/${this.storeId}`]);

        }
      });
    } else {
      Object.keys(this.offerForm.controls).forEach(key => {
        this.offerForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/storlist']);
  }
}
