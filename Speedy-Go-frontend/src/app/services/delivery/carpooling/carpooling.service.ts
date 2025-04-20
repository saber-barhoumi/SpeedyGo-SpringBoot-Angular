import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Carpooling } from 'src/app/models/carpooling.model';
import { environment } from '../../../environments/environment';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model';

@Injectable({
  providedIn: 'root'
})
export class CarpoolingService {
  private apiUrl = `${environment.apiUrl}/carpoolings`;
  private priceUrl = `${environment.apiUrl}/price`;

  constructor(private http: HttpClient) {}

  // Get all carpoolings
  getAllCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(`${this.apiUrl}`);
  }

  // Get user's carpoolings
  getMyCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(`${this.apiUrl}/my-carpoolings`);
  }

  // Get carpooling by ID
  getCarpoolingById(id: number): Observable<Carpooling> {
    return this.http.get<Carpooling>(`${this.apiUrl}/${id}`);
  }

  // Create new carpooling
  createCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http.post<Carpooling>(`${this.apiUrl}/create`, carpooling);
  }

  // Update carpooling
  updateCarpooling(id: number, carpooling: Carpooling): Observable<Carpooling> {
    return this.http.put<Carpooling>(`${this.apiUrl}/update/${id}`, carpooling);
  }

  // Delete carpooling
  deleteCarpooling(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Calculate price - updated to handle object response
calculatePrice(carpooling: Carpooling): Observable<any> {
  // Ensure all required fields have default values to prevent null issues
  const requestData = {
    departureLocation: carpooling.departureLocation || '',
    destination: carpooling.destination || '',
    distanceKm: carpooling.distanceKm || 0,
    durationMinutes: carpooling.durationMinutes || 0,
    vehicleType: carpooling.vehicleType || 'sedan',
    fuelType: carpooling.fuelType || 'gasoline',
    availableSeats: carpooling.availableSeats || 1,
    description: carpooling.description || '',
    wifi: carpooling.wifi || 0,
    airConditioning: carpooling.airConditioning || 0,
    weatherType: carpooling.weatherType || 'Clear'
  };
  
  // Try the new endpoint first
  return this.http.post<any>(`${this.priceUrl}/calculate`, requestData)
    .pipe(
      catchError(error => {
        console.error('Error calling new price endpoint, trying fallback', error);
        // If the new endpoint fails, try the original endpoint as fallback
        return this.http.post<any>(`${this.apiUrl}/calculate-price`, requestData);
      })
    );
}
  // Accept carpooling
  acceptCarpooling(id: number): Observable<Carpooling> {
    return this.http.post<Carpooling>(`${this.apiUrl}/${id}/accept`, {});
  }

  // Reserve a carpooling
  reserveCarpooling(carpoolingId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${carpoolingId}/reserve`, userId);
  }

  // Get user's reservations
  getMyReservations(): Observable<ReservationCarpoo[]> {
    return this.http.get<ReservationCarpoo[]>(`${this.apiUrl}/reservations/me`);
  }

  // Delete a reservation
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservations/${reservationId}/delete`);
  }
}