import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DeliveryVehicle } from '../../../../../models/vehicle.model';
import { RecruitmentService } from '../../../../../services/recrutement/recruitment.service';
import { VehicleService } from '../../../../../services/recrutement/vehicle.service';
import { AuthService } from '../../../../services/user/auth.service';


@Component({
  selector: 'app-recruitment-form',
  templateUrl: './recruitment-form.component.html',
  styleUrls: ['./recruitment-form.component.css']
})
export class RecruitmentFormComponent implements OnInit {
  recruitmentForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  recruitmentId: number | null = null;
  currentUser: any;
  vehicles: DeliveryVehicle[] = [];
  isLoadingVehicles = false;

  constructor(
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Get the authenticated user
    this.currentUser = this.authService.getUser();
    
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('You must be logged in to access this page');
      this.router.navigate(['/login']);
      return;
    }
    
    // Check for edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.recruitmentId = +id;
        this.loadRecruitmentDetails(+id);
      }
    });
    
    // Load vehicles for the current user
    this.loadVehicles();
  }

  createForm(): void {
    this.recruitmentForm = this.fb.group({
      yearsOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      previousEmployer: ['', Validators.required],
      drivingLicenseNumber: ['', [Validators.required, Validators.minLength(5)]],
      drivingLicenseIssueDate: [''],
      drivingLicenseCategory: ['', Validators.required],
      coverLetter: ['', [Validators.required, Validators.minLength(100)]],
      vehicleId: [''] // Store vehicle ID directly
    });
  }

  loadRecruitmentDetails(id: number): void {
    this.recruitmentService.getRecruitmentById(id).subscribe({
      next: (recruitment) => {
        // Get applicant user ID, handling both naming conventions (snake_case and camelCase)
        const applicantUserId = recruitment.applicant?.user_id || recruitment.applicant?.userId;
        const currentUserId = this.currentUser.userId || this.currentUser.user_id;
        
        console.log('Edit - Applicant user ID:', applicantUserId);
        console.log('Edit - Current user ID:', currentUserId);
        
        // Verify this belongs to the current user
        if (recruitment.applicant && applicantUserId != currentUserId) {
          this.toastr.error('You do not have permission to edit this application');
          this.router.navigate(['/recruitment/my-applications']);
          return;
        }
        
        // Set form values
        this.recruitmentForm.patchValue({
          yearsOfExperience: recruitment.yearsOfExperience,
          previousEmployer: recruitment.previousEmployer,
          drivingLicenseNumber: recruitment.drivingLicenseNumber,
          drivingLicenseCategory: recruitment.drivingLicenseCategory,
          coverLetter: recruitment.coverLetter,
          // Format the date to YYYY-MM-DD for the date input
          drivingLicenseIssueDate: recruitment.drivingLicenseIssueDate ? 
            recruitment.drivingLicenseIssueDate.substring(0, 10) : ''
        });
        
        // Handle vehicle ID if present
        if (recruitment.deliveryVehicle && recruitment.deliveryVehicle.vehicleId) {
          this.recruitmentForm.patchValue({
            vehicleId: recruitment.deliveryVehicle.vehicleId
          });
        }
      },
      error: (err) => {
        console.error('Error loading recruitment details:', err);
        this.toastr.error('Failed to load application details');
        this.router.navigate(['/recruitment/my-applications']);
      }
    });
  }

  loadVehicles(): void {
    this.isLoadingVehicles = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.isLoadingVehicles = false;
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.isLoadingVehicles = false;
        this.toastr.error('Failed to load vehicles');
      }
    });
  }

  onSubmit(): void {
    if (this.recruitmentForm.invalid) {
      // Mark all fields as touched to trigger validation visuals
      Object.keys(this.recruitmentForm.controls).forEach(key => {
        const control = this.recruitmentForm.get(key);
        control?.markAsTouched();
      });
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const formData = { ...this.recruitmentForm.value };
    
    // Format date for backend (LocalDateTime format)
    if (formData.drivingLicenseIssueDate) {
      formData.drivingLicenseIssueDate = `${formData.drivingLicenseIssueDate}T00:00:00`;
    }

    // Handle vehicle reference
    const vehicleId = formData.vehicleId;
    delete formData.vehicleId; // Remove vehicleId from the main object
    
    // Create deliveryVehicle object if a vehicle is selected
    if (vehicleId) {
      formData.deliveryVehicle = { vehicleId };
    } else {
      formData.deliveryVehicle = null;
    }

    console.log('Submitting recruitment data:', formData);
    
    if (this.isEditMode && this.recruitmentId) {
      // Update existing application
      this.recruitmentService.updateRecruitment(this.recruitmentId, formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toastr.success('Application updated successfully');
          this.router.navigate(['/recruitment/my-applications']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating application:', err);
          this.toastr.error(err.message || 'Failed to update application');
        }
      });
    } else {
      // Create new application
      const userId = this.currentUser.userId;
      this.recruitmentService.createRecruitment(userId, formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toastr.success('Application submitted successfully');
          this.router.navigate(['/recruitment/my-applications']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error submitting application:', err);
          this.toastr.error(err.message || 'Failed to submit application');
        }
      });
    }
  }
}