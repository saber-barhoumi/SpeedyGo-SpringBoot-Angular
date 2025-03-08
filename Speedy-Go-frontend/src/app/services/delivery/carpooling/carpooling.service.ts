import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Carpooling } from 'src/app/models/carpooling.model'; // Update the import pathimport { Router } from '@angular/router';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class CarpoolingService {
  private apiUrl = 'http://localhost:8084/api/carpoolings';
  private isAuthenticated = new BehaviorSubject<boolean>(false); // Gère l'état de connexion

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Vérifie si un token est disponible et retourne les headers pour l'authentification
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found, redirecting to login...');
      this.isAuthenticated.next(false);
      this.router.navigate(['/login']); // Redirection automatique
      return new HttpHeaders(); // Retourne des headers vides pour éviter une erreur
    }

    this.isAuthenticated.next(true);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Récupère tous les trajets
   */
  getAllCarpoolings(): Observable<Carpooling[]> {
    return this.http
      .get<Carpooling[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère un trajet spécifique par ID
   */
  getCarpooling(id: number): Observable<Carpooling> {
    return this.http
      .get<Carpooling>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Ajoute un nouveau trajet
   */
  addCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http
      .post<Carpooling>(`${this.apiUrl}/add`, carpooling, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour un trajet existant
   */
  updateCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http
      .put<Carpooling>(`${this.apiUrl}/update/${carpooling.carpoolingId}`, carpooling, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Supprime un trajet par ID
   */
  deleteCarpooling(carpoolingId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/delete/${carpoolingId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gère les erreurs HTTP et les affiche dans la console
   */
  private handleError(error: any) {
    console.error('HTTP Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
