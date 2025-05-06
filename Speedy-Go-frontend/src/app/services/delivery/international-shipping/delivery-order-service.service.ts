import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryOrder, OrderStatus } from '../../../models/delivery-order.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryOrderServiceService {

  private baseUrl = 'http://localhost:8084/api'; // Replace with your actual backend URL

  constructor(private http: HttpClient) { }

  getOrdersByDeliveryPersonId(personId: number): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.baseUrl}/orders/deliveryPerson/${personId}`);
  }
}