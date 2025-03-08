import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private baseUrl = 'http://localhost:8084/api/delivery'; // Replace with your backend API URL

  constructor(private http: HttpClient) { }

  isRecruitmentCompleted(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/recruitment/completed/${userId}`);
  }

  // Add other methods related to delivery data here
}
