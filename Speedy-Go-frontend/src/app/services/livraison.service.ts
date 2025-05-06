import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Livraison, LivraisonStatus, AiVehicleSuggestion } from '../models/livraison.model';
import { AuthService } from '../FrontOffices/services/user/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private apiUrl = environment.apiUrl + '/api/livraisons';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Check authentication status before each operation
  private checkAuthStatus(): Observable<never> | null {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to perform this operation'));
    }
    return null;
  }

  // Get all livraisons
  getAllLivraisons(): Observable<Livraison[]> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<Livraison[]>(this.apiUrl)
      .pipe(
        tap(livraisons => console.log('Fetched livraisons', livraisons)),
        catchError(this.handleError)
      );
  }

  // Get livraison by ID
  getLivraisonById(id: number): Observable<Livraison> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<Livraison>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new livraison
  createLivraison(livraison: Livraison): Observable<Livraison> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.post<Livraison>(this.apiUrl, livraison)
      .pipe(
        tap(newLivraison => console.log('Created livraison', newLivraison)),
        catchError(this.handleError)
      );
  }

  // Create new livraison with AI suggestion
  createLivraisonWithAiSuggestion(livraison: Livraison): Observable<AiVehicleSuggestion> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.post<AiVehicleSuggestion>(`${this.apiUrl}/ai-suggestion`, livraison)
      .pipe(
        tap(result => console.log('Created livraison with AI suggestion', result)),
        catchError(this.handleError)
      );
  }

  // Update existing livraison
  updateLivraison(id: number, livraison: Livraison): Observable<Livraison> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.put<Livraison>(`${this.apiUrl}/${id}`, livraison)
      .pipe(
        tap(updatedLivraison => console.log('Updated livraison', updatedLivraison)),
        catchError(this.handleError)
      );
  }

  // Delete livraison
  deleteLivraison(id: number): Observable<void> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get livraisons by status
  getLivraisonsByStatus(status: LivraisonStatus): Observable<Livraison[]> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<Livraison[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Assign vehicle to livraison
  assignVehicle(livraisonId: number, vehicleId: number): Observable<Livraison> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.post<Livraison>(`${this.apiUrl}/${livraisonId}/assign-vehicle/${vehicleId}`, {})
      .pipe(
        tap(livraison => console.log('Assigned vehicle to livraison', livraison)),
        catchError(this.handleError)
      );
  }

  // Get AI suggestion for best vehicle
  suggestBestVehicle(livraisonId: number): Observable<AiVehicleSuggestion> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<AiVehicleSuggestion>(`${this.apiUrl}/${livraisonId}/suggest-vehicle`)
      .pipe(
        tap(suggestion => console.log('AI vehicle suggestion', suggestion)),
        catchError(this.handleError)
      );
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object' && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}