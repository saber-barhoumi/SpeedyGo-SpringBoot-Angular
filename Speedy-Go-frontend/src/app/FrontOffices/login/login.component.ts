import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importer MatSnackBar

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginclientComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar // Injecter MatSnackBar
  ) {}

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

  onSubmit(form: NgForm): void {
    console.log('onSubmit déclenché avec :', this.email, this.password);

    this.authService.login(this.email, this.password).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Login Error:', error);
        if (error.status === 401) {
          this.showSnackBar('Identifiants incorrects. Veuillez réessayer.', 'error');
        } else if (error.status === 0) {
          this.showSnackBar('Impossible de contacter le serveur.', 'error');
        } else {
          this.showSnackBar('Erreur : ' + (error.error?.message || 'Problème inconnu.'), 'error');
        }
        return throwError(() => new Error(error.message));
      })
    ).subscribe({
      next: (response) => {
        console.log('Login Response:', response);

        if (response?.token) {
          this.authService.saveUserData(response.token, response.user);
          this.showSnackBar('Connexion réussie !', 'success');

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
          this.showSnackBar('Erreur : Token non reçu.', 'error');
        }
      },
      error: (error) => {
        console.error('Erreur lors du login:', error);
      }
    });
  }

  // Fonction pour afficher le SnackBar
  showSnackBar(message: string, type: string): void {
    const panelClass = type === 'error' ? 'snack-bar-error' : 'snack-bar-success';
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: [panelClass] // Ajouter la classe CSS en fonction du type
    });
  }
}
