import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/user/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr'; // Optional: for better notifications

interface LoginResponse {
  token: string;
  user: {
    role: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginClientComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Optional: for elegant notifications
  ) {}

  ngOnInit(): void {
    this.checkExistingLogin();
  }

  private checkExistingLogin(): void {
    if (this.authService.isLoggedIn()) {
      this.navigateBasedOnRole();
    }
  }

  private navigateBasedOnRole(role?: string): void {
    const userRole = (role || this.authService.getUser()?.role || '').toUpperCase();

    const roleRoutes: { [key: string]: string } = {
      'DELIVERY': '/delivery',
      'DELEVERY': '/delivery',
      'PARTNER': '/partner',
      'CUSTOMER': '/customer',
      'ADMIN': '/admin/home'
    };

    const route = roleRoutes[userRole] || '/home';
    this.router.navigate([route]);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleLoginError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response: LoginResponse) => {
          this.handleSuccessfulLogin(response);
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  private handleLoginError(error: HttpErrorResponse): void {
    this.isLoading = false;
    
    const errorMessages: { [key: number]: string } = {
      0: 'Unable to connect to the server. Please check your internet connection.',
      400: 'Invalid request. Please check your credentials.',
      401: 'Incorrect email or password. Please try again.',
      403: 'Access denied. You may not have the required permissions.',
      404: 'Login service not found. Please contact support.',
      500: 'Server error. Please try again later.'
    };

    this.errorMessage = errorMessages[error.status] || 
      error.error?.message || 
      'An unexpected error occurred. Please try again.';

    // Optional: Use Toastr for error notification
    this.toastr.error(this.errorMessage, 'Login Failed');
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    if (!response?.token) {
      this.errorMessage = 'Authentication token not received.';
      this.toastr.warning(this.errorMessage);
      return;
    }

    // Save user data
    this.authService.saveUserData(response.token, response.user);

    // Optional: Success notification

    // Navigate based on user role
    this.navigateBasedOnRole(response.user.role);
  }

  // Optional: Password reset navigation
  navigateToPasswordReset(): void {
    this.router.navigate(['/forgot-password']);
  }
}