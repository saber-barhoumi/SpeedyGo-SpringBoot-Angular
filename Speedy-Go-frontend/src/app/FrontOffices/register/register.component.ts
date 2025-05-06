import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: [localStorage.getItem('firstName') || '', Validators.required],
      lastName: [localStorage.getItem('lastName') || '', Validators.required],
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birthDate: [localStorage.getItem('birthDate') || '', [Validators.required, this.ageValidator]],
      phoneNumber: [localStorage.getItem('phoneNumber') || '', [Validators.pattern('^\\d{8}$')]],
      address: [localStorage.getItem('address') || '', Validators.required],
      profile_picture: [null, Validators.required],
      sexe: [localStorage.getItem('sexe') || 'MEN', Validators.required],
      role: [localStorage.getItem('role') || 'CUSTOMER', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ageValidator(control: any) {
    if (!control.value) {
      return { required: true };
    }
    const birthDate = new Date(control.value);
    const today = new Date();
    
    // Birth date should not be in the future
    if (birthDate >= today) {
      return { invalidDate: true };
    }
    
    // User must be at least 18 years old
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 18);
    if (birthDate > minAgeDate) {
      return { underage: true };
    }
    return null; // Valid date
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.registerForm.patchValue({
      profile_picture: this.selectedFile
    });
    this.registerForm.get('profile_picture')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }
    
    this.isLoading = true;
    const formData = new FormData();
    
    // Make sure to use "birthDate" instead of "birth_date"
    formData.append('firstName', this.registerForm.get('firstName')?.value);
    formData.append('lastName', this.registerForm.get('lastName')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('birthDate', this.registerForm.get('birthDate')?.value); // Use "birthDate"
    formData.append('phoneNumber', this.registerForm.get('phoneNumber')?.value);
    formData.append('address', this.registerForm.get('address')?.value);
    formData.append('sexe', this.registerForm.get('sexe')?.value);
    formData.append('role', this.registerForm.get('role')?.value);
    
    if (this.selectedFile) {
      formData.append('profile_picture', this.selectedFile, this.selectedFile.name);
    }
    
    this.authService.register(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration successful:', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration error:', err);
        this.errorMessage = err.message || 'Registration failed';
      }
    });
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}