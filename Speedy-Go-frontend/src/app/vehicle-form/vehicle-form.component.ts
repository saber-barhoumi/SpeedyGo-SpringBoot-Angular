import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DeliveryVehicle, VehicleType } from '../models/vehicle.model';
import { VehicleService } from '../services/recrutement/vehicle.service';
import { AuthService } from '../FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  vehicleTypes = Object.values(VehicleType);
  isSubmitting = false;
  isEditMode = false;
  vehicleId: number | null = null;
  licensePlateExists = false;
  checkingLicensePlate = false;
  currentYear = new Date().getFullYear();
  currentUser: any;
  
  // User ID for when we need to associate the vehicle with a user

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('You must be logged in to access this page');
      this.router.navigate(['/login']);
      return;
    }
    
    // Get current user
    this.currentUser = this.authService.getUser();
    
    // Check for edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.vehicleId = +id;
        this.loadVehicle(+id);
      }
    });

    // License plate validation
    this.vehicleForm.get('licensePlate')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value && value.length > 3) {
          this.checkLicensePlate(value);
        } else {
          this.licensePlateExists = false;
        }
      });
  }


  createForm(): void {
    this.vehicleForm = this.fb.group({
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      yearOfManufacture: [this.currentYear, [
        Validators.required,
        Validators.min(1950),
        Validators.max(this.currentYear + 1)
      ]],
      licensePlate: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9\s-]+$/)
      ]],
      registrationNumber: ['', [Validators.required]],
      vehicleType: ['', [Validators.required]],
      maxLoadCapacity: [0, [Validators.required, Validators.min(0)]],
      hasRefrigeration: [false],
      isInsured: [false],
      insuranceProvider: [''],
      insurancePolicyNumber: [''],
      vehiclePhotoPath: ['']
    });

    // Add conditional validators for insurance details
    this.vehicleForm.get('isInsured')?.valueChanges.subscribe(isInsured => {
      const insuranceProvider = this.vehicleForm.get('insuranceProvider');
      const insurancePolicyNumber = this.vehicleForm.get('insurancePolicyNumber');
      
      if (isInsured) {
        insuranceProvider?.setValidators([Validators.required]);
        insurancePolicyNumber?.setValidators([Validators.required]);
      } else {
        insuranceProvider?.clearValidators();
        insurancePolicyNumber?.clearValidators();
      }
      
      insuranceProvider?.updateValueAndValidity();
      insurancePolicyNumber?.updateValueAndValidity();
    });
  }

  loadVehicle(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        console.log('Loaded vehicle:', vehicle);
        this.vehicleForm.patchValue({
          brand: vehicle.brand,
          model: vehicle.model,
          yearOfManufacture: vehicle.yearOfManufacture,
          licensePlate: vehicle.licensePlate,
          registrationNumber: vehicle.registrationNumber,
          vehicleType: vehicle.vehicleType,
          maxLoadCapacity: vehicle.maxLoadCapacity,
          hasRefrigeration: vehicle.hasRefrigeration,
          isInsured: vehicle.isInsured,
          insuranceProvider: vehicle.insuranceProvider || '',
          insurancePolicyNumber: vehicle.insurancePolicyNumber || '',
          vehiclePhotoPath: vehicle.vehiclePhotoPath || ''
        });

        // When editing, don't check the existing license plate
        const licensePlateControl = this.vehicleForm.get('licensePlate');
        const originalLicensePlate = vehicle.licensePlate;
        
        licensePlateControl?.valueChanges.subscribe(value => {
          if (value !== originalLicensePlate) {
            this.checkLicensePlate(value);
          } else {
            this.licensePlateExists = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading vehicle:', err);
        this.toastr.error('Failed to load vehicle details.');
        this.router.navigate(['/vehicles']);
      }
    });
  }

  checkLicensePlate(licensePlate: string): void {
    if (!licensePlate || licensePlate.length < 4) return;
    
    this.checkingLicensePlate = true;
    this.vehicleService.checkLicensePlate(licensePlate).subscribe({
      next: (response) => {
        this.checkingLicensePlate = false;
        this.licensePlateExists = response.exists;
        if (response.exists) {
          this.vehicleForm.get('licensePlate')?.setErrors({ alreadyRegistered: true });
        }
      },
      error: (err) => {
        console.error('Error checking license plate:', err);
        this.checkingLicensePlate = false;
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid || this.licensePlateExists) {
      // Mark all fields as touched to trigger validation visuals
      Object.keys(this.vehicleForm.controls).forEach(key => {
        const control = this.vehicleForm.get(key);
        control?.markAsTouched();
      });
      this.toastr.error('Please correct the errors in the form.');
      return;
    }

    this.isSubmitting = true;
    const formData = this.vehicleForm.value as DeliveryVehicle;
    
    // If insurance is not selected, set these to null or empty
    if (!formData.isInsured) {
      formData.insuranceProvider = '';
      formData.insurancePolicyNumber = '';
    }
    
    console.log('Submitting vehicle data:', formData);

    if (this.isEditMode && this.vehicleId) {
      this.vehicleService.updateVehicle(this.vehicleId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastr.success('Vehicle updated successfully!');
          this.router.navigate(['/vehicles']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating vehicle:', err);
          this.toastr.error(err.message || 'Failed to update vehicle. Please try again.');
        }
      });
    } else {
      this.vehicleService.createVehicle(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastr.success('Vehicle added successfully!');
          this.router.navigate(['/vehicles']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error adding vehicle:', err);
          this.toastr.error(err.message || 'Failed to add vehicle. Please try again.');
        }
      });
    }
  }
}