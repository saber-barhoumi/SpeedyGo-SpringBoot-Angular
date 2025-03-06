import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
 
 
  constructor(private authService: AuthService, private router: Router,private fb: FormBuilder) {
    
   }
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); // Redirect if already logged in
    }
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birth_date: ['', [Validators.required, this.ageValidator]], // Use ageValidator
      phone_number: ['', [Validators.pattern('^\\d{8}$')]],
      address: ['', Validators.required],
      profile_picture: [''],
      sexe: ['MALE'],
      role: ['CUSTOMER']
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
  
    // Ensure the date is not in the future
    if (birthDate >= today) {
      return { invalidDate: true };
    }
  
    // Check if the user is at least 18 years old
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 18); // 18 years ago
  
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

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const userData = { ...this.registerForm.value };
    delete userData.confirmPassword; // Remove confirmPassword before sending

    this.authService.register(userData).subscribe({
      next: (response) => {
        alert('Registration successful!');
        this.router.navigate(['/login']); // Redirect to login
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Registration failed';
      }
    });
  }
   // Helper method to mark all form controls as touched
   private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
}}