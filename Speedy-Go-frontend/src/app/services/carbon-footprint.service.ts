import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarbonFootprintService {

  private apiUrl = 'http://localhost:8084/carbon/predict';  // URL de ton API Spring

  constructor(private http: HttpClient) { }

  // Fonction pour envoyer les données et récupérer les prédictions
  getPrediction(): Observable<any> {
    return this.http.post<any>(this.apiUrl, {});  // Envoie une requête POST sans corps pour récupérer les prédictions
  }
}
