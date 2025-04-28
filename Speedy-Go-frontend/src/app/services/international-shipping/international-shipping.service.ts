import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InternationalShipping {
  id?: number;
  originCountry: string;
  destinationCountry: string;
  shippingCost: number;
  trackingNumber: string;
  weight: number;
  shippingDate: string;
  estimatedDeliveryDate: string;
  shippingStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternationalShippingService {
  private apiUrl = 'http://localhost:8084/Shipping';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InternationalShipping[]> {
    return this.http.get<InternationalShipping[]>(`${this.apiUrl}/getAll`);
  }

  getById(id: number): Observable<InternationalShipping> {
    return this.http.get<InternationalShipping>(`${this.apiUrl}/${id}`);
  }

  add(shipping: InternationalShipping): Observable<InternationalShipping> {
    return this.http.post<InternationalShipping>(`${this.apiUrl}/add`, shipping);
  }

  update(id: number, shipping: InternationalShipping): Observable<InternationalShipping> {
    return this.http.put<InternationalShipping>(`${this.apiUrl}/update/${id}`, shipping);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
