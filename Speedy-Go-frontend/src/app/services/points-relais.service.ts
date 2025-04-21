import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PointRelais } from 'src/app/models/points-relais.model';

@Injectable({
  providedIn: 'root'
})
export class PointsRelaisService {
  private apiUrl = 'http://localhost:8086/pointsrelais';

  constructor(private http: HttpClient) {}

  // Récupérer tous les points relais
  getAll(): Observable<PointRelais[]> {
    return this.http.get<PointRelais[]>(this.apiUrl);
  }

  // Ajouter un nouveau point relais
  add(point: PointRelais): Observable<PointRelais> {
    return this.http.post<PointRelais>(this.apiUrl, point);
  }

  // Supprimer un point relais (optionnel)
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Modifier un point relais (optionnel)
  update(point: PointRelais): Observable<PointRelais> {
    return this.http.put<PointRelais>(`${this.apiUrl}/${point.id}`, point);
  }
}
