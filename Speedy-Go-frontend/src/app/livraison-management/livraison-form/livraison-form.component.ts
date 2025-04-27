import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AiVehicleSuggestionDialogComponent } from '../ai-vehicle-suggestion-dialog/ai-vehicle-suggestion-dialog.component';
import { LivraisonStatus, AiVehicleSuggestion, Livraison } from 'src/app/models/livraison.model';
import { DeliveryVehicle } from 'src/app/models/vehicle.model';
import { LivraisonService } from 'src/app/services/livraison.service';
import { VehicleService } from 'src/app/services/recrutement/vehicle.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-livraison-form',
  templateUrl: './livraison-form.component.html',
  styleUrls: ['./livraison-form.component.css']
})
export class LivraisonFormComponent implements OnInit {
  livraisonForm!: FormGroup;
  isEditMode = false;
  livraisonId?: number;
  loading = false;
  submitting = false;
  availableVehicles: DeliveryVehicle[] = [];
  statuses = Object.values(LivraisonStatus);
  aiSuggestionResult: AiVehicleSuggestion | null = null;

  constructor(
    private fb: FormBuilder,
    private livraisonService: LivraisonService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.livraisonForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      originAddress: ['', [Validators.required]],
      destinationAddress: ['', [Validators.required]],
      distanceInKm: [null, [Validators.min(0.1)]],
      packageWeightKg: [null, [Validators.min(0.1)]],
      requiresRefrigeration: [false],
      packageDimensions: [''],
      scheduledPickupTime: ['', [Validators.required]],
      scheduledDeliveryTime: ['', [Validators.required]],
      actualDeliveryTime: [''],
      status: [{value: LivraisonStatus.PENDING, disabled: true}],
      assignedVehicleId: [{value: null, disabled: true}]
    });
  }

  loadData(): void {
    this.loading = true;

    // Check if in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    
    // Load available vehicles
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.availableVehicles = vehicles;
        
        // If in edit mode, load livraison data
        if (idParam) {
          this.isEditMode = true;
          this.livraisonId = +idParam;
          
          this.livraisonService.getLivraisonById(this.livraisonId).subscribe({
            next: (livraison) => {
              this.populateForm(livraison);
              this.loading = false;
            },
            error: (error) => {
              this.toastr.error('Error loading livraison: ' + error.message);
              this.loading = false;
              this.router.navigate(['/livraison-management']);
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.toastr.error('Error loading vehicles: ' + error.message);
        this.loading = false;
      }
    });
  }

  populateForm(livraison: Livraison): void {
    // Enable status and vehicle fields for edit mode
    this.livraisonForm.get('status')?.enable();
    this.livraisonForm.get('assignedVehicleId')?.enable();
    
    // Format dates for HTML datetime-local input
    const scheduledPickup = this.formatDateForInput(livraison.scheduledPickupTime);
    const scheduledDelivery = this.formatDateForInput(livraison.scheduledDeliveryTime);
    const actualDelivery = livraison.actualDeliveryTime ? 
                          this.formatDateForInput(livraison.actualDeliveryTime) : '';
    
    this.livraisonForm.patchValue({
      title: livraison.title,
      description: livraison.description || '',
      originAddress: livraison.originAddress,
      destinationAddress: livraison.destinationAddress,
      distanceInKm: livraison.distanceInKm,
      packageWeightKg: livraison.packageWeightKg,
      requiresRefrigeration: livraison.requiresRefrigeration,
      packageDimensions: livraison.packageDimensions || '',
      scheduledPickupTime: scheduledPickup,
      scheduledDeliveryTime: scheduledDelivery,
      actualDeliveryTime: actualDelivery,
      status: livraison.status,
      assignedVehicleId: livraison.assignedVehicle?.vehicleId || null
    });
  }

  // Helper method to format dates for datetime-local input
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm') || '';
  }

  private formatDateTimeForBackend(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    // If it doesn't have seconds, add ':00' for seconds
    if (dateTimeString.length === 16) { // Format: 'YYYY-MM-DDTHH:MM'
      return `${dateTimeString}:00`;
    }
    
    return dateTimeString;
  }
  onSubmit(): void {
    if (this.livraisonForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.livraisonForm.controls).forEach(key => {
        const control = this.livraisonForm.get(key);
        control?.markAsTouched();
      });
      
      this.toastr.error('Please correct the errors in the form');
      return;
    }

    this.submitting = true;
    const formValue = this.livraisonForm.value;
    
    // Prepare livraison data with properly formatted dates
    const livraison: Livraison = {
      title: formValue.title,
      description: formValue.description,
      originAddress: formValue.originAddress,
      destinationAddress: formValue.destinationAddress,
      distanceInKm: formValue.distanceInKm,
      packageWeightKg: formValue.packageWeightKg,
      requiresRefrigeration: formValue.requiresRefrigeration,
      packageDimensions: formValue.packageDimensions,
      scheduledPickupTime: this.formatDateTimeForBackend(formValue.scheduledPickupTime),
      scheduledDeliveryTime: this.formatDateTimeForBackend(formValue.scheduledDeliveryTime),
      actualDeliveryTime: formValue.actualDeliveryTime ? this.formatDateTimeForBackend(formValue.actualDeliveryTime) : undefined,
      status: this.isEditMode ? formValue.status : LivraisonStatus.PENDING
    };

    if (this.isEditMode && this.livraisonId) {
      // Update existing livraison
      this.livraisonService.updateLivraison(this.livraisonId, livraison).subscribe({
        next: (result) => {
          this.submitting = false;
          this.toastr.success('Livraison updated successfully');
          
          // Handle vehicle assignment if changed
          const vehicleId = formValue.assignedVehicleId;
          
          // If there's a vehicle ID and it's different from the current one
          if (vehicleId && 
              (!result.assignedVehicle || result.assignedVehicle.vehicleId !== vehicleId)) {
            this.livraisonService.assignVehicle(this.livraisonId!, vehicleId).subscribe();
          }
          
          this.router.navigate(['/livraison-management']);
        },
        error: (error) => {
          this.submitting = false;
          this.toastr.error('Error: ' + error.message);
        }
      });
    } else {
      // Create new livraison
      this.livraisonService.createLivraison(livraison).subscribe({
        next: () => {
          this.submitting = false;
          this.toastr.success('Livraison created successfully');
          this.router.navigate(['/livraison-management']);
        },
        error: (error) => {
          this.submitting = false;
          this.toastr.error('Error: ' + error.message);
        }
      });
    }
  }

  useAiSuggestion(): void {
    if (this.livraisonForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.livraisonForm.controls).forEach(key => {
        const control = this.livraisonForm.get(key);
        control?.markAsTouched();
      });
      
      this.toastr.error('Please correct the errors in the form before using AI suggestion');
      return;
    }

    this.submitting = true;
  const formValue = this.livraisonForm.value;
  
  // Prepare livraison data with properly formatted dates
  const livraison: Livraison = {
    title: formValue.title,
    description: formValue.description,
    originAddress: formValue.originAddress,
    destinationAddress: formValue.destinationAddress,
    distanceInKm: formValue.distanceInKm,
    packageWeightKg: formValue.packageWeightKg,
    requiresRefrigeration: formValue.requiresRefrigeration,
    packageDimensions: formValue.packageDimensions,
    scheduledPickupTime: this.formatDateTimeForBackend(formValue.scheduledPickupTime),
    scheduledDeliveryTime: this.formatDateTimeForBackend(formValue.scheduledDeliveryTime)
  };
    // Create livraison with AI suggestion
    this.livraisonService.createLivraisonWithAiSuggestion(livraison).subscribe({
      next: (result) => {
        this.submitting = false;
        this.aiSuggestionResult = result;
        
        // Show AI suggestion result
        this.showAiSuggestionResult();
      },
      error: (error) => {
        this.submitting = false;
        this.toastr.error('Error with AI suggestion: ' + error.message);
      }
    });
  }

  showAiSuggestionResult(): void {
    if (!this.aiSuggestionResult) return;
    
    const suggestion = this.aiSuggestionResult;
    const vehicle = suggestion.suggestedVehicle; // Now directly accessible
    
    if (vehicle) {
      const message = `
        <strong>AI Suggestion Result</strong><br>
        <p>The AI has selected a vehicle for your delivery!</p>
        <p>Vehicle: ${vehicle.brand} ${vehicle.model}</p>
        <p>License Plate: ${vehicle.licensePlate}</p>
        <p>This vehicle has ${vehicle.hasRefrigeration ? '' : 'no '}refrigeration.</p>
      `;
      
      this.toastr.success(message, 'Success', {
        enableHtml: true,
        timeOut: 5000
      });
    } else {
      this.toastr.warning('No suitable vehicle was found for this delivery.', 'AI Suggestion');
    }
    
    this.router.navigate(['/livraison-management']);
  }

  cancel(): void {
    this.router.navigate(['/livraison-management']);
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.livraisonForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.livraisonForm.get(fieldName);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'This field is required';
    }
    
    if (control.hasError('min')) {
      return 'Value must be greater than 0.1';
    }
    
    if (control.hasError('maxlength')) {
      return 'Value is too long';
    }
    
    return 'Invalid field';
  }
}