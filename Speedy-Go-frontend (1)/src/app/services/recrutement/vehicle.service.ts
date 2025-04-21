import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryVehicle } from '../../models/vehicle.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/api/deliveryvehicles`;

  constructor(private http: HttpClient) { }

  // Get all vehicles
  getAllVehicles(): Observable<DeliveryVehicle[]> {
    return this.http.get<DeliveryVehicle[]>(this.apiUrl);
  }

  // Get a vehicle by ID
  getVehicleById(id: number): Observable<DeliveryVehicle> {
    return this.http.get<DeliveryVehicle>(`${this.apiUrl}/${id}`);
  }

  // Create a new vehicle (without photo)
  createVehicle(vehicle: DeliveryVehicle): Observable<DeliveryVehicle> {
    return this.http.post<DeliveryVehicle>(this.apiUrl, vehicle);
  }

  // Create a new vehicle with photo
  createVehicleWithPhoto(vehicle: DeliveryVehicle, photo: File): Observable<DeliveryVehicle> {
    const formData = new FormData();
    formData.append('vehicle', new Blob([JSON.stringify(vehicle)], {type: 'application/json'}));
    
    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<DeliveryVehicle>(`${this.apiUrl}/with-photo`, formData);
  }

  // Update a vehicle (without photo)
  updateVehicle(id: number, vehicle: DeliveryVehicle): Observable<DeliveryVehicle> {
    return this.http.put<DeliveryVehicle>(`${this.apiUrl}/${id}`, vehicle);
  }

  // Update a vehicle with photo
  updateVehicleWithPhoto(id: number, vehicle: DeliveryVehicle, photo: File | null): Observable<DeliveryVehicle> {
    const formData = new FormData();
    formData.append('vehicle', new Blob([JSON.stringify(vehicle)], {type: 'application/json'}));
    
    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.put<DeliveryVehicle>(`${this.apiUrl}/${id}/with-photo`, formData);
  }

  // Delete a vehicle
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Upload just a photo and get back the path
  uploadVehiclePhoto(photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', photo);

    return this.http.post<any>(`${this.apiUrl}/upload-photo`, formData);
  }

  // Check if a license plate is already registered
  checkLicensePlate(licensePlate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-license-plate?licensePlate=${licensePlate}`);
  }
}