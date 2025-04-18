import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

 
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/home']); // Redirect if already logged in
    }
  }
  
  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.saveUserData(response.token, response.user); // Save both token & user
  
        if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin/home']); // Redirect to admin page
        } else {
          this.router.navigate(['/home']); // Redirect to front office
        }
      },
      error: () => {
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
  
}