import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.scss']
})
export class RegisterAdminComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage = '';
  selectedFile: File | null = null;
  isLoading = false; // Add this property

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      birth_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone_number: ['', Validators.required],
      address: ['', Validators.required],
      sexe: ['', Validators.required],
      newsletter: [false],
      role: ["ADMIN"]
    });
  }

  get f() { return this.registerForm.controls as { [key: string]: any }; }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  register(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true; // Set loading state when submitting

    // Create FormData for sending to the server
    const formData = new FormData();

    // Add all form fields to FormData
    // Map the form field names to match what the backend expects
    formData.append('firstName', this.registerForm.get('first_name')?.value);
    formData.append('lastName', this.registerForm.get('last_name')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('phoneNumber', this.registerForm.get('phone_number')?.value);
    formData.append('address', this.registerForm.get('address')?.value);
    formData.append('sexe', this.registerForm.get('sexe')?.value);
    formData.append('role', this.registerForm.get('role')?.value);
    
    // Format the date to what Java expects (YYYY-MM-DD)
    const birthDate = this.registerForm.get('birth_date')?.value;
    if (birthDate) {
      formData.append('birthDate', birthDate);
    }

    // Add profile picture if selected
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    // Call the register method with FormData
    this.authService.register(formData).subscribe({
      next: () => {
        this.isLoading = false; // Reset loading state
        alert('Registration successful!');
        this.router.navigate(['/loginadmin']);
      },
      error: err => {
        this.isLoading = false; // Reset loading state
        this.errorMessage = 'Registration failed. ' + (err.error?.message || 'Please try again.');
        console.error('Registration error:', err);
      }
    });
  }
}