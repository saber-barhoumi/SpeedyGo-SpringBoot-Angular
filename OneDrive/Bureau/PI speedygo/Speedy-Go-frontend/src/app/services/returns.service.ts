import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Returns } from "../models/returns/returns.module";

@Injectable({
  providedIn: 'root'
})
export class ReturnsService {
  private apiUrl = 'http://localhost:8084/returns';  // Your backend API URL

  constructor(private http: HttpClient) {}

  // Get all returns
  getAllReturns(): Observable<Returns[]> {
    return this.http.get<Returns[]>(this.apiUrl);
  }

  // Get return by ID
  getReturnById(id: number): Observable<Returns> {
    return this.http.get<Returns>(`${this.apiUrl}/${id}`);
  }

  // Create a new return
  createReturn(returnData: Returns): Observable<Returns> {
    return this.http.post<Returns>(this.apiUrl, returnData);
  }

  // Update an existing return
  updateReturn(id: number, returnData: Returns): Observable<Returns> {
    return this.http.put<Returns>(`${this.apiUrl}/${id}`, returnData);
  }
  updateReturnStatus(id: number, updatedReturn: Returns): Observable<Returns> {
    return this.http.put<Returns>(`${this.apiUrl}/${id}`, updatedReturn);
  }
  // Delete a return
  deleteReturn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Assign parcel to return
  assignParcelToReturn(returnId: number, parcelId: number): Observable<Returns> {
    return this.http.put<Returns>(`${this.apiUrl}/${returnId}/parcel/${parcelId}`, {});
  }
}
