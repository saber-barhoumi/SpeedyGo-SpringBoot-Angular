import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeCongeService {

  private baseUrl = 'http://localhost:8080/api/demande-conge';  // L'URL de ton API Spring Boot

  constructor(private http: HttpClient) { }

  // Créer une demande de congé
  createDemande(deliveryVehicleId: number, dateDebut: string, dateFin: string): Observable<any> {
    const demande = {
      deliveryVehicleId: deliveryVehicleId,
      dateDebut: dateDebut,
      dateFin: dateFin
    };
    return this.http.post(`${this.baseUrl}/create`, demande);
  }

  // Récupérer les demandes de congé par véhicule de livraison
  getDemandesByVehicle(deliveryVehicleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vehicle/${deliveryVehicleId}`);
  }

  // Mettre à jour le statut d'une demande
  updateStatus(demandeId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${demandeId}`, { status });
  }
}
