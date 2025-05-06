import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Returns } from 'src/app/models/return';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private apiUrl = 'http://localhost:8084/returns'; // URL de l'API backend
  private returnsSubject = new BehaviorSubject<Returns[]>([]);  // Variable pour stocker les retours
  returns$ = this.returnsSubject.asObservable();  // Observable pour les composants

  

  constructor(private http: HttpClient) {}

  // Méthode pour obtenir tous les retours
  getAllReturns(): Observable<Returns[]> {
    return this.http.get<Returns[]>(this.apiUrl);  // Renvoie un Observable directement
  }

  // Méthode pour mettre à jour le statut d'un retour
  updateReturnStatus(id: number, newStatus: string): Observable<any> {
    const payload = { retourstatus: newStatus }; // Corps de la requête
    return this.http.patch(`${this.apiUrl}/${id}/status`, payload);  // Utilisation de 'id' pour correspondre au backend
  }
  createReturn(returnData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, returnData);
  }
}

