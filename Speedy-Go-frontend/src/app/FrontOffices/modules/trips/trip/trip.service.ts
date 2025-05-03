import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../model/trip';



@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'http://localhost:8084/api/trips'; // Update this with your actual API URL
private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTrip(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/getTrip/${id}`, { headers: this.getHeaders() });
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/add`, trip, { headers: this.getHeaders() });
  }

  updateTrip(trip: Trip, value: any): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/updateTrip/${trip.id}`, trip, { headers: this.getHeaders() });
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteTrip/${id}`, { headers: this.getHeaders() });
  }
}