import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Report } from "../Models/returns/report.module";

@Injectable({
  providedIn: 'root'
})
export class ReportsServiceService {
  private Url = 'http://localhost:8084/report';  // Your backend API URL


    constructor(private http: HttpClient) {}



    getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.Url);
  }

  // Get return by ID
  getReportById(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.Url}/${id}`);
  }

  // Create a new return
  addReport(returnData: Report): Observable<Report> {
    return this.http.post<Report>(this.Url, returnData);
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.Url}/${id}`);
  }
 
}
