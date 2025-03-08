import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carpooling } from 'src/app/models/carpooling.model';

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
    return this.http.post<Carpooling>(`${this.apiUrl}/add`, carpooling);
  }

  // Update an existing carpooling
  updateCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    return this.http.put<Carpooling>(`${this.apiUrl}/update/${carpooling.carpoolingId}`, carpooling);
  }

  // Delete a carpooling by ID
  deleteCarpooling(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}