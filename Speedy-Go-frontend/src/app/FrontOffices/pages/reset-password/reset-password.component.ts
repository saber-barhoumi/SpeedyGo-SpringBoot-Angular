// src/app/FrontOffices/pages/reset-password/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordResetService } from '../../../../app/services/user/password-reset.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  tokenValidated = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private passwordResetService: PasswordResetService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Initialize form
    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Get token from URL
    this.token = this.route.snapshot.queryParams['token'] || '';
    console.log('Validating token:', this.token);
    
    // Validate token if present
    if (this.token) {
      this.validateToken();
    } else {
      this.handleInvalidToken('Missing reset token');
    }
  }

// In your ResetPasswordComponent
// In your reset-password.component.ts, update the validateToken method:

validateToken(): void {
  this.loading = true;
  
  // Debug the exact URL being used
  const fullUrl = `${this.passwordResetService.apiUrl}/api/auth/password/validate-token?token=${this.token}`;
  console.log('Full URL being called:', fullUrl);
  
  this.passwordResetService.validateResetToken(this.token)
    .subscribe({
      next: (response) => {
        console.log('Token validation successful, received:', response);
        this.tokenValidated = true;
        this.loading = false;
        this.toastr.success('Please enter your new password');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Token validation failed with error:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('URL that failed:', error.url);
        
        // Special handling for 403 errors
        if (error.status === 403) {
          console.error('Forbidden error - check if you need authentication');
          // You might need to include credentials or headers
        }
        
        this.handleInvalidToken('The password reset link is invalid or has expired');
      }
    });
}
  handleInvalidToken(message: string): void {
    this.errorMessage = message;
    this.toastr.error(message);
    
    // Delay redirect to give user time to see the message
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.resetForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }

    const passwordValue = this.resetForm.get('password')?.value || '';
    
    this.loading = true;
    
    this.passwordResetService.resetPassword(this.token, passwordValue)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Password reset successful!';
          this.toastr.success('Password reset successful');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.loading = false;
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Failed to reset password';
          this.errorMessage = errorMsg;
          this.toastr.error(errorMsg);
          this.loading = false;
        }
      });
  }
}