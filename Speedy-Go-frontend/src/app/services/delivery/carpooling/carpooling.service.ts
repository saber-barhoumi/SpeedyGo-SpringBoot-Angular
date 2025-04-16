import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carpooling } from 'src/app/models/carpooling.model';
import { environment } from '../../../environments/environment';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model';

@Injectable({
  providedIn: 'root'
})
export class CarpoolingService {
  private apiUrl = `${environment.apiUrl}/carpoolings`;

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

  // Calculate price
  calculatePrice(carpooling: Carpooling): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/calculate-price`, carpooling);
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