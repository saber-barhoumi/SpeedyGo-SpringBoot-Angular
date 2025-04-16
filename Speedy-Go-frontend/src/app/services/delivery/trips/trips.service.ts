import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from 'src/app/models/trip.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private apiUrl = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  findTripByLocations(departure: string, destination: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find`, {
      params: { departure, destination }
    });
  }
}