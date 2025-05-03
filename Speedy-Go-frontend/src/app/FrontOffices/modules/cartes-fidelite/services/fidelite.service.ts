import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PointFidelite } from '../models/fidelite.model';

@Injectable({
  providedIn: 'root'
})
export class FideliteService {
  private apiUrl = 'http://localhost:8084/api/offres';


  private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
  

  constructor(private http: HttpClient) { }

  getAllFidelityCards( userId: number): Observable<PointFidelite[]> {
    return this.http.get<PointFidelite[]>(`${this.apiUrl}/all-fidelite/${userId}`, { headers: this.getHeaders() });
  }

  getFidelityCardById(id: number): Observable<PointFidelite> {
    return this.http.get<PointFidelite>(`${this.apiUrl}/fidelite/${id}`);
  }
  
  addFidelityPoints(storeId: number, userId: number): Observable<number> {
    console.log('Adding fidelity points for storeId:', storeId, 'and userId:', userId);
    return this.http.post<number>(`${this.apiUrl}/Add-fidelite/${storeId}/${userId}`, {}, { headers: this.getHeaders() });
  }
}