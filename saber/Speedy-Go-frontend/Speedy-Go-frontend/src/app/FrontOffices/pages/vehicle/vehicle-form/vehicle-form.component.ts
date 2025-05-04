import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DeliveryVehicle, VehicleType } from '../../../../models/vehicle.model';
import { VehicleService } from '../../../../../app/services/vehicle/vehicle.service';
import { AuthService } from '../../../services/user/auth.service';

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
  
  // Added for photo upload functionality
  previewImageUrl: string = '';
  selectedFileName: string = '';
  uploadedFile: File | null = null;
  isUploading: boolean = false;
  
  // Sample vehicle images for selection
  sampleImages = [
    { value: '/uploads/vehicles/truck-1.jpg', label: 'Delivery Truck' },
    { value: '/uploads/vehicles/van-1.jpg', label: 'Delivery Van' },
    { value: '/uploads/vehicles/toyota-hiace.jpg', label: 'Toyota Hiace' },
    { value: '/uploads/vehicles/mercedes-sprinter.jpg', label: 'Mercedes Sprinter' },
    { value: '/uploads/vehicles/refrigerated-truck.jpg', label: 'Refrigerated Truck' }
  ];

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
    this.route.paramMap.subscribe((params: ParamMap) => {
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
      .subscribe((value: string) => {
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
    this.vehicleForm.get('isInsured')?.valueChanges.subscribe((isInsured: boolean) => {
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

        // Set the preview image if there is one
        if (vehicle.vehiclePhotoPath) {
          this.previewImageUrl = vehicle.vehiclePhotoPath;
        }

        // When editing, don't check the existing license plate
        const licensePlateControl = this.vehicleForm.get('licensePlate');
        const originalLicensePlate = vehicle.licensePlate;
        
        licensePlateControl?.valueChanges.subscribe((value: string) => {
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size exceeds 5MB limit');
        return;
      }
      
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.toastr.error('Only image files (JPEG, PNG, GIF) are allowed');
        return;
      }
      
      this.uploadedFile = file;
      this.selectedFileName = file.name;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
        
        // For now, we'll use this URL directly for development
        // In production, we would upload to server first
        this.vehicleForm.patchValue({ 
          vehiclePhotoPath: this.previewImageUrl
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSampleImageSelected(event: any): void {
    const path = event.target.value;
    
    if (path) {
      // Clear any previously uploaded file
      this.uploadedFile = null;
      this.selectedFileName = '';
      
      // Use the selected sample image
      this.previewImageUrl = path;
      this.vehicleForm.patchValue({
        vehiclePhotoPath: path
      });
    } else {
      this.previewImageUrl = '';
    }
  }

  uploadFile(): Promise<string> {
    // This would typically be an API call to upload the file
    this.isUploading = true;
    
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // In a real app, you'd call your backend API to upload the file
        // and get back the stored file path
        
        // Return a dummy file path for now
        const timestamp = new Date().getTime();
        const path = `/uploads/vehicles/custom-${timestamp}.jpg`;
        this.isUploading = false;
        resolve(path);
      }, 1500);
    });
  }

// Update the onSubmit method to use the file upload functionality
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

  // If no actual file but just a URL path, use the regular endpoints
  if (this.isEditMode && this.vehicleId) {
    if (this.uploadedFile) {
      // Update with photo upload
      this.vehicleService.updateVehicleWithPhoto(this.vehicleId, formData, this.uploadedFile).subscribe({
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
      // Regular update without photo
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
    }
  } else {
    if (this.uploadedFile) {
      // Create with photo upload
      this.vehicleService.createVehicleWithPhoto(formData, this.uploadedFile).subscribe({
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
    } else {
      // Regular create without photo
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

  saveVehicle(): void {
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
  
  // Helper method to clear file selection
  clearFileSelection(): void {
    this.uploadedFile = null;
    this.selectedFileName = '';
    this.previewImageUrl = '';
    this.vehicleForm.patchValue({
      vehiclePhotoPath: ''
    });
  }
}