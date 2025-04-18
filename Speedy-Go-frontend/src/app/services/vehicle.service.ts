import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:8075/api/vehicles'; // Remplace par ton URL backend

  constructor(private http: HttpClient) {}

  // Récupérer tous les véhicules
  getVehicles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ajouter un véhicule
  addVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehicle);
  }

  // Mettre à jour un véhicule
  updateVehicle(id: number, vehicle: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, vehicle);
  }

  // Supprimer un véhicule
  deleteVehicle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
