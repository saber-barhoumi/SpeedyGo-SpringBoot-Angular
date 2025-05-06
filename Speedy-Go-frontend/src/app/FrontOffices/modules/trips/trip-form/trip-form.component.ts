import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripService } from '../trip/trip.service';
@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})
export class TripFormComponent implements OnInit {
  tripForm!: FormGroup;
  isSubmitting = false;
  tripStatusOptions = ['PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED','INPROGRESS'];

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.tripForm = this.fb.group({
      start_location: ['', [Validators.required]],
      end_location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      trip_date: ['', [Validators.required]],
      trip_status: ['', [Validators.required]],
      phone_number: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tripForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  resetForm(): void {
    this.tripForm.reset();
    // Set default status selection prompt
    this.tripForm.patchValue({
      trip_status: ''
    });
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      this.isSubmitting = true;
      
      const tripData = this.tripForm.value;
      
      this.tripService.addTrip(tripData).subscribe({
        next: (response) => {
          console.log('Trip created successfully', response);
          this.isSubmitting = false;
          this.router.navigate(['/customer']);
        },
        error: (error) => {
          console.error('Error creating trip', error);
          this.isSubmitting = false;
          // Handle error - could add a toast notification here
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.tripForm.controls).forEach(key => {
        this.tripForm.get(key)?.markAsTouched();
      });
    }
  }
}