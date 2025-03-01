import { Component } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginclientComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); // Redirect if already logged in
    }
  }


 onSubmit() {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      console.log('Login Response:', response); // Debugging
      if (response.token) {
        this.authService.saveUserData(response.token, response.user);
        alert('Login successful!');
        this.router.navigate(['/home']); // Redirect after login
      } else {
        alert('Token not received.');
      }
    },
    error: (error) => {
      console.error('Login Error:', error);
      alert('Login failed: ' + (error.error.error || 'Unknown error'));
    }
  });
}
}