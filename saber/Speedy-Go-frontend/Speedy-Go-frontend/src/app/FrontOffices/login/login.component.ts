import { Component } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginclientComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Check if already logged in and redirect based on role
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole(this.authService.getUser());
    }
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.toastr.error('Please enter both email and password');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login Response:', response);
        if (response.token) {
          // Save user data
          this.authService.saveUserData(response.token, response.user);
          
          // Log login time
          console.log(`User logged in at: ${new Date('2025-03-03 18:44:09').toISOString()}`);
          console.log(`Logged in as: ${response.user.email} with role: ${response.user.role}`);
          
          // Show success message
          this.toastr.success('Login successful!');
          
          // Redirect based on role
          this.redirectBasedOnRole(response.user);
        } else {
          this.toastr.error('Token not received.');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login Error:', error);
        this.toastr.error(error.error?.error || 'Login failed. Please check your credentials.');
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Redirects user to different pages based on their role
   */
  redirectBasedOnRole(user: any): void {
    if (!user || !user.role) {
      this.router.navigate(['/home']);
      return;
    }
    
    // Handle redirection based on role
    switch (user.role) {
      case 'ADMIN':
        this.router.navigate(['/admin/home']);
        break;
      case 'DELEVERY':
      case 'DELIVERY': // Handle both spellings just in case
        this.router.navigate(['/recruitment/my-applications']);
        break;
      case 'PARTNER':
        this.router.navigate(['/partner/dashboard']);
        break;
      case 'CUSTOMER':
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}