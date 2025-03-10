import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Observable } from 'rxjs';
import { Carpooling } from 'src/app/models/carpooling.model';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model'; // Import ReservationCarpoo

@Injectable({
  providedIn: 'root',
})
export class CarpoolingService {
  private apiUrl = 'http://localhost:8084/api/carpoolings';

  constructor(private http: HttpClient) {}

  // Fetch all carpoolings
  getAllCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(this.apiUrl);
  }
  
  // Add a new carpooling
  addCarpooling(carpooling: Carpooling): Observable<Carpooling> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post<Carpooling>(`${this.apiUrl}/add`, carpooling, { headers: headers });
}

  // Update an existing carpooling
  updateCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Carpooling>(`${this.apiUrl}/update/${carpooling.carpoolingId}`, carpooling, { headers: headers });
  }
  // Delete a carpooling by ID
  deleteCarpooling(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  reserveCarpooling(carpoolingId: number, userId: number): Observable<any> {
    const url = `${this.apiUrl}/${carpoolingId}/reserve`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, userId, { headers: headers });
  }
  getMyReservations(): Observable<ReservationCarpoo[]> {
    return this.http.get<ReservationCarpoo[]>(`${this.apiUrl}/reservations/me`); // Corrected URL
  }
  
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reservations/${reservationId}/delete`);
  }

}