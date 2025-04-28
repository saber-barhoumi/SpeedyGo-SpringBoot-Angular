import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RouteRequest {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  fromLabel: string;
  toLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class SmartRouteService {

  private readonly API_URL = 'http://localhost:8080/route'; // adapte si backend est ailleurs

  constructor(private http: HttpClient) {}

  getRoute(data: RouteRequest): Observable<any> {
    return this.http.post(this.API_URL, data);
  }
}
