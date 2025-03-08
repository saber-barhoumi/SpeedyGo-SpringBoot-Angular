import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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

        if (user && user.role) {
          const userRole = user.role.toUpperCase();
          console.log('User role :', userRole);
          
          switch (userRole) {
            case 'DELEVERY':
              this.router.navigate(['/delivery']);
              break;
            case 'PARTNER':
              this.router.navigate(['/partner']);
              break;
            case 'CUSTOMER':
              this.router.navigate(['/customer']);
              break;
            default:
              this.router.navigate(['/home']);
              break;
          }
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

    this.authService.login(this.email, this.password).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Login Error:', error);
        if (error.status === 401) {
          alert('Identifiants incorrects. Veuillez réessayer.');
        } else if (error.status === 0) {
          alert('Impossible de contacter le serveur.');
        } else {
          alert('Erreur : ' + (error.error?.message || 'Problème inconnu.'));
        }
        return throwError(() => new Error(error.message));
      })
    ).subscribe({
      next: (response) => {
        console.log('Login Response:', response);

        if (response?.token) {
          this.authService.saveUserData(response.token, response.user);
          alert('Connexion réussie !');

          const userRole = response.user.role.toUpperCase();
          console.log('User Role:', userRole);

          switch (userRole) {
            case 'DELEVERY':
              this.router.navigate(['/delivery']);
              break;
            case 'PARTNER':
              this.router.navigate(['/partner']);
              break;
            case 'CUSTOMER':
              this.router.navigate(['/customer']);
              break;
            default:
              this.router.navigate(['/home']);
              break;
          }
        } else {
          alert('Erreur : Token non reçu.');
        }
      },
      error: (error) => {
        console.error('Erreur lors du login:', error);
      }
    });
  }
}
