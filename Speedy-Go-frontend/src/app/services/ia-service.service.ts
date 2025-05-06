import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class IaService {

  constructor(private http: HttpClient) {}

  getSmartRoutes(requestBody: { start: [number, number], end: [number, number] }): Observable<any> {
    return this.http.post<any>('http://localhost:5000/api/smart-route', requestBody);
  }
  
  
}
