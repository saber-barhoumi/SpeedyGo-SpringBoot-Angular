import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeCongeService {

  private baseUrl = 'http://localhost:8084/api/demandes-conge';

  constructor(private http: HttpClient) { }

  // Créer une demande de congé
  createDemande(deliveryVehicleId: number, dateDebut: string, dateFin: string): Observable<any> {
    const formData = new FormData();
    formData.append('deliveryVehicleId', deliveryVehicleId.toString());
    formData.append('dateDebut', dateDebut);
    formData.append('dateFin', dateFin);
    return this.http.post(`${this.baseUrl}/create`, formData);
}

  // Récupérer les demandes de congé par véhicule de livraison
  getDemandesByVehicle(deliveryVehicleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/delivery-vehicle/${deliveryVehicleId}`);
}

  // Mettre à jour le statut d'une demande
  updateStatus(demandeId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${demandeId}`, { status });
  }
}
