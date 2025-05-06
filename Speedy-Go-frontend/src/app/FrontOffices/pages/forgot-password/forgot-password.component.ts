import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordResetService } from '../../../services/user/password-reset.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-box">
        <h2>Forgot Password</h2>
        <form (ngSubmit)="onSubmit(forgotForm)" #forgotForm="ngForm">
          <div class="input-box">
            <span class="icon"><ion-icon name="mail"></ion-icon></span>
            <input 
              type="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              email
              placeholder="Enter your email"
            >
            <label>Email</label>
          </div>
          
          <button type="submit" [disabled]="forgotForm.invalid">
            Send Reset Link
          </button>
          
          <div class="login-link">
            <p>Remember your password? 
              <a routerLink="/login">Back to Login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.passwordResetService.forgotPassword(this.email)
        .subscribe({
          next: (response) => {
            this.toastr.success('Password reset link sent to your email');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            const errorMsg = error.error || 'Failed to send reset link';
            this.toastr.error(errorMsg);
          }
        });
    }
  }
}