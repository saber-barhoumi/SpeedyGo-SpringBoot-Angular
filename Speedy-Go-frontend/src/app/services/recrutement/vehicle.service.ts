import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DeliveryVehicle, VehicleType } from 'src/app/models/vehicle.model';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = environment.apiUrl + '/api/deliveryvehicles';

  constructor(private http: HttpClient,    private authService: AuthService
  ) { }

   // Check authentication status before each operation
   private checkAuthStatus(): Observable<never> | null {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to perform this operation'));
    }
    return null;
  }

 // Get all vehicles
 getAllVehicles(): Observable<DeliveryVehicle[]> {
  const authCheck = this.checkAuthStatus();
  if (authCheck) return authCheck;
  
  return this.http.get<DeliveryVehicle[]>(this.apiUrl)
    .pipe(
      tap(vehicles => {
        console.log('Fetched vehicles', vehicles);
        // Log current user and timestamp
        console.log(`Operation performed at: ${new Date('2025-03-03 14:57:18').toISOString()}`);
        console.log(`By user: YoussefHarrabi`);
      }),
      catchError(this.handleError)
    );
}

  // Get vehicle by ID
  getVehicleById(id: number): Observable<DeliveryVehicle> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<DeliveryVehicle>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new vehicle
  createVehicle(vehicle: DeliveryVehicle): Observable<DeliveryVehicle> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.post<DeliveryVehicle>(this.apiUrl, vehicle)
      .pipe(
        tap(newVehicle => console.log('Created vehicle', newVehicle)),
        catchError(this.handleError)
      );
  }

  // Update existing vehicle
  updateVehicle(id: number, vehicle: DeliveryVehicle): Observable<DeliveryVehicle> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.put<DeliveryVehicle>(`${this.apiUrl}/${id}`, vehicle)
      .pipe(
        tap(updatedVehicle => console.log('Updated vehicle', updatedVehicle)),
        catchError(this.handleError)
      );
  }

  // Delete vehicle
  deleteVehicle(id: number): Observable<void> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get vehicles by type
  getVehiclesByType(vehicleType: VehicleType): Observable<DeliveryVehicle[]> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    return this.http.get<DeliveryVehicle[]>(`${this.apiUrl}/type/${vehicleType}`)
      .pipe(catchError(this.handleError));
  }


  // Check if license plate is already registered
  // Check if license plate is already registered
  checkLicensePlate(licensePlate: string): Observable<{exists: boolean}> {
    const authCheck = this.checkAuthStatus();
    if (authCheck) return authCheck;
    
    const params = new HttpParams().set('licensePlate', licensePlate);
    return this.http.get<{exists: boolean}>(`${this.apiUrl}/check-license-plate`, { params })
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    // Log timestamp for error tracking
    const timestamp = new Date('2025-03-03 14:57:18').toISOString();
    console.error(`Error occurred at ${timestamp}`);
    console.error(`User: YoussefHarrabi`);
    
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