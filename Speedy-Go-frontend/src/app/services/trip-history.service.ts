// trip-history.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripHistoryService {

  private apiUrl = 'http://localhost:8080/api/trips'; // adapte si différent

  constructor(private http: HttpClient) {}

  saveTrip(trip: any) {
    return this.http.post(this.apiUrl, trip);
  }
}
