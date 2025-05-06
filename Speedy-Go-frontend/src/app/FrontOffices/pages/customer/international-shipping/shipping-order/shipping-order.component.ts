import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpClient } from '@angular/common/http'; // زدنا HttpClient
import { ToastrService } from 'ngx-toastr';

import { DeliveryService } from '../../../../../services/delivery/international-shipping/delivery.service';
import { DeliveryService as DeliveryServiceModel } from '../../../../../models/delivery-service.model';
import { AuthService } from '../../../../../FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-shipping-order',
  templateUrl: './shipping-order.component.html',
  styleUrls: ['./shipping-order.component.css']
})
export class ShippingOrderComponent implements OnInit {
  orderForm: FormGroup;
  service: DeliveryServiceModel | null = null;
  serviceId = 0;
  loading = false;
  submitting = false;
  error = '';
  userId = 0;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  estimatedPrice = 0;
  estimatedCost: number | null = null;

  // Add to the ShippingOrderComponent class:
  countriesList: string[] = [
    'United States', 'Canada', 'United Kingdom', 'France', 'Germany',
    'Italy', 'Spain', 'Australia', 'Japan', 'China', 'Brazil', 'India',
    'Russia', 'Mexico', 'South Africa', 'Egypt', 'Saudi Arabia', 'UAE',
    'South Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
    'Morocco', 'Turkey', 'Nigeria', 'Kenya', 'Ghana', 'Argentina', 'Chile'
  ];

  goodTypesList: string[] = [
    'Electronics', 'Clothing', 'Books', 'Documents', 'Food (non-perishable)',
    'Cosmetics', 'Toys', 'Medical Supplies', 'Office Supplies', 'Jewelry',
    'Automotive Parts', 'Sports Equipment', 'Art Supplies', 'Crafts',
    'Home Decor', 'Pet Supplies', 'Musical Instruments', 'Tools', 'Kitchenware'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      destinationCountry: ['', Validators.required],
      destinationAddress: ['', [Validators.required, Validators.minLength(10)]],
      packageWeight: ['', [Validators.required, Validators.min(0.1)]],
      itemType: ['', Validators.required], // Add this new field
      itemDescription: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      itemPhoto: ['']
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser || !currentUser.userId) {
      this.error = 'You must be logged in to place an order';
      this.router.navigate(['/login']);
      return;
    }
    this.userId = currentUser.userId;
  
    // Use paramMap instead of params for better typing
    this.route.paramMap.subscribe(params => {
      const serviceIdParam = params.get('id');
      console.log("Route param 'id':", serviceIdParam);
      
      if (serviceIdParam) {
        this.serviceId = +serviceIdParam;
        console.log("Parsed serviceId:", this.serviceId);
        
        if (isNaN(this.serviceId) || this.serviceId <= 0) {
          this.error = 'Invalid service ID. Please go back and select a valid service.';
          return;
        }
        
        // Load service details with a slight delay to ensure route is fully processed
        setTimeout(() => this.loadServiceDetails(), 100);
      } else {
        this.error = 'No service selected. Please go back and select a service.';
      }
    });
  
    // Listen to weight changes
    this.orderForm.get('packageWeight')?.valueChanges.subscribe(weight => {
      const numericWeight = weight ? Number(weight) : null;
      if (numericWeight && !isNaN(numericWeight)) {
        this.calculateEstimatedCost(numericWeight);
      }
    });
  }
  loadServiceDetails(): void {
    this.loading = true;
    this.error = '';
    console.log(`Loading service details for ID: ${this.serviceId}`);
    
    this.deliveryService.getServiceById(this.serviceId).subscribe({
      next: (service: DeliveryServiceModel) => {
        console.log("Service loaded successfully:", service);
        
        if (!service) {
          this.error = 'Could not find the selected service. Please select another service.';
          this.loading = false;
          return;
        }
        
        this.service = service;
  
        if (service.maxWeightPerOrder) {
          this.orderForm.get('packageWeight')?.setValidators([
            Validators.required,
            Validators.min(0.1),
            Validators.max(service.maxWeightPerOrder)
          ]);
          this.orderForm.get('packageWeight')?.updateValueAndValidity();
        }
  
        if (service.countriesServed?.length === 1) {
          this.orderForm.patchValue({ destinationCountry: service.countriesServed[0] });
        }
  
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading service details', err);
        this.error = err.error?.message || 'Failed to load service details. Please try again later.';
        this.loading = false;
      }
    });
  }

  calculateEstimatedCost(weight: number): void {
    if (this.service && weight && !isNaN(weight)) {
      if (this.service.basePrice !== undefined && this.service.pricePerKg !== undefined) {
        this.estimatedCost = this.deliveryService.calculateShippingPrice(
          this.service.basePrice,
          this.service.pricePerKg,
          weight
        );
      } else {
        console.error('Service base price or price per kg is undefined');
      }
    } else {
      this.estimatedCost = null;
    }
  }

  // Update your onSubmit method to be more resilient
onSubmit(): void {
  console.log("Submit button clicked");
  console.log("Form status:", this.orderForm.status);
  console.log("Form valid:", this.orderForm.valid);
  console.log("Form values:", this.orderForm.value);
  
  if (!this.authService.isAuthenticated()) {
    console.log("Authentication failed");
    this.toastr.error('You must be logged in to place an order');
    this.router.navigate(['/login']);
    return;
  }

  if (this.orderForm.invalid) {
    console.log("Form invalid - validation errors:", this.getFormValidationErrors());
    this.toastr.error('Please correct the errors in the form before submitting.');
    this.markFormGroupTouched(this.orderForm);
    return;
  }

  // This is where your current error happens
  if (!this.service || !this.serviceId) {
    console.log("Service information missing, attempting to reload");
    
    // If we have a serviceId but no service object, try to load it
    if (this.serviceId && !this.service) {
      this.loading = true;
      this.error = "Loading service details...";
      
      this.deliveryService.getServiceById(this.serviceId).subscribe({
        next: (service: DeliveryServiceModel) => {
          console.log("Service loaded successfully:", service);
          this.service = service;
          this.loading = false;
          this.error = '';
          // Try submitting again after service is loaded
          this.processSubmission();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading service details', err);
          this.error = err.error?.message || 'Failed to load service details. Please try again later.';
          this.loading = false;
          this.toastr.error(this.error);
        }
      });
      return;
    } else {
      // If we don't even have a serviceId, something is seriously wrong
      this.error = 'Service information is missing. Please go back and select a service.';
      this.toastr.error(this.error);
      return;
    }
  }

  // If we reach here, we have a valid service object
  this.processSubmission();
}

// Separate the actual submission process into its own method
processSubmission(): void {
  console.log("Processing submission with service:", this.service);
  this.submitting = true;

  const formData = new FormData();
  formData.append('customerId', this.userId.toString());
  formData.append('serviceId', this.serviceId.toString());
  formData.append('destinationCountry', this.orderForm.get('destinationCountry')?.value);
  formData.append('destinationAddress', this.orderForm.get('destinationAddress')?.value);
  formData.append('weight', this.orderForm.get('packageWeight')?.value ? String(this.orderForm.get('packageWeight')?.value) : '0');
  
  // Adding item type
  formData.append('itemType', this.orderForm.get('itemType')?.value);
  formData.append('itemDescription', this.orderForm.get('itemDescription')?.value);
  formData.append('totalPrice', this.estimatedCost ? String(this.estimatedCost) : '0');

  if (this.selectedFile) {
    formData.append('itemPhoto', this.selectedFile);
  }

  console.log("FormData prepared for submission");
  
  // Use the service's createOrder method instead of accessing apiUrl directly
  this.deliveryService.createOrder(formData).subscribe({
    next: (response) => {
      console.log("Order created successfully:", response);
      this.toastr.success('Order placed successfully!');
      this.submitting = false;
      this.router.navigate(['/customer/international-shipping/my-orders']);
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error creating order:', err);
      
      // Provide a more detailed error message
      if (err.status === 0) {
        this.error = 'Network error. Please check your connection.';
      } else if (err.status === 404) {
        this.error = 'API endpoint not found. Please contact support.';
      } else if (err.status === 500) {
        this.error = 'Server error. Please try again later.';
      } else {
        this.error = err.error?.message || 'Failed to place order. Please try again later.';
      }
      
      this.submitting = false;
      this.toastr.error(this.error);
    }
  });
}
  
// Helper method to get detailed form validation errors
getFormValidationErrors(): any {
  const errors: any = {};
  Object.keys(this.orderForm.controls).forEach(key => {
    const control = this.orderForm.get(key);
    if (control?.errors) {
      errors[key] = control.errors;
    }
  });
  return errors;
}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const maxSize = 5 * 1024 * 1024;
      if (this.selectedFile.size > maxSize) {
        this.toastr.error('File is too large. Maximum size is 5MB.');
        this.selectedFile = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);

      this.checkImageContent(this.selectedFile);
    }
  }

  checkImageContent(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence', '0.5');

    this.http.post<any>('http://localhost:8000/detect', formData).subscribe({
      next: (response) => {
        if (response.detections && response.detections.length > 0) {
          const items = response.detections.map((d: any) => d.class).join(', ');
          this.toastr.error(`Prohibited items detected: ${items}. Please upload a different image.`);
          this.selectedFile = null;
          this.imagePreview = null;
        } else {
          this.toastr.success('Image verified successfully.');
        }
      },
      error: (err) => {
        console.error('Error checking image', err);
        this.toastr.warning('Could not verify image content. Proceeding anyway.');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Add this to your component
debugServiceStatus(): void {
  console.log("Debug - Current service status:");
  console.log("serviceId:", this.serviceId);
  console.log("service object:", this.service);
  
  // Try reloading the service
  if (this.serviceId) {
    console.log("Attempting to reload service data...");
    this.deliveryService.getServiceById(this.serviceId).subscribe({
      next: (service) => {
        console.log("Debug - Service loaded successfully:", service);
      },
      error: (err) => {
        console.error("Debug - Error loading service:", err);
      }
    });
  }
}

// Call this from ngOnInit after loading service details
}