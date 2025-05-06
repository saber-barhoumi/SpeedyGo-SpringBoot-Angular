import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  rememberMe = false;
  savedEmails: string[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/home']);
    }

    const storedEmails = localStorage.getItem('savedEmails');
    if (storedEmails) {
      this.savedEmails = JSON.parse(storedEmails);
    }

    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  login(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.saveUserData(response.token, response.user);

        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        if (!this.savedEmails.includes(this.email)) {
          this.savedEmails.unshift(this.email);
          localStorage.setItem('savedEmails', JSON.stringify(this.savedEmails));
        }

        if (response.user.role === 'ADMIN' || response.user.role === 'DELIVERY') {
          this.router.navigate(['/admin/home']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.errorMessage = 'Invalid email or password';
      },
    });
  }

  navigateToPasswordReset(): void {
    this.router.navigate(['/forgot-password']);
  }
}