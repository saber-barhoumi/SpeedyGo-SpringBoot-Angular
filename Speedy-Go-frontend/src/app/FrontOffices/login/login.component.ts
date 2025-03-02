import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginclientComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('ngOnInit du login lancé');
    if (this.authService.isLoggedIn()) {
      try {
        const user = this.authService.getUser();
        console.log('Utilisateur récupéré du localStorage :', user);
        const userRole = (user.role || '').toUpperCase();
        console.log('User role :', userRole);
        if (userRole === 'DELEVERY') {
          this.router.navigate(['/delivery']);
        } else if (userRole === 'PARTNER') {
          this.router.navigate(['/partner']);
        } else if (userRole === 'CUSTOMER') {
          this.router.navigate(['/customer']);
        } else {
          this.router.navigate(['/home']);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur :', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }

  onSubmit(): void {
    console.log('onSubmit déclenché avec :', this.email, this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login Response:', response);
        if (response.token) {
          this.authService.saveUserData(response.token, response.user);
          alert('Login successful!');
  
          const userRole = response.user.role.toUpperCase();
          console.log('User Role:', userRole);
          if (userRole === 'DELEVERY') {
            this.router.navigate(['/delivery']);
          } else if (userRole === 'PARTNER') {
            this.router.navigate(['/partner']);
          } else if (userRole === 'CUSTOMER') {
            this.router.navigate(['/customer']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          alert('Token not received.');
        }
      },
      error: (error) => {
        console.error('Login Error:', error);
        alert('Login failed: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }
}
