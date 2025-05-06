import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Report } from 'src/app/models/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = 'http://localhost:8084/report';

  constructor(private http: HttpClient) { }

  // Ajouter un nouveau rapport
  addReport(report: Report): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report);
  }

  // Récupérer tous les rapports
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  // Récupérer un rapport par ID
  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/getReport/${id}`);
  }

  // Supprimer un rapport
  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
