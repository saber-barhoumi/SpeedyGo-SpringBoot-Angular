import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DeliveryService as DeliveryServiceModel, DeliveryType } from '../../../models/delivery-service.model';
import { DeliveryOrder, OrderStatus } from '../../../models/delivery-order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // DELIVERY SERVICES METHODS
  
  // Get all active international shipping services
  getInternationalShippingServices(): Observable<DeliveryServiceModel[]> {
    return this.http.get<DeliveryServiceModel[]>(`${this.apiUrl}/delivery-services/international`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get specific service by ID
  getServiceById(serviceId: number): Observable<DeliveryServiceModel> {
    return this.http.get<DeliveryServiceModel>(`${this.apiUrl}/delivery-services/${serviceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Register a new delivery service
  registerDeliveryService(
    userId: number,
    service: {
      deliveryType: DeliveryType,
      countriesServed: string[],
      acceptedGoodTypes: string[],
      maxWeightPerOrder: number,
      maxOrdersPerDay: number,
      basePrice: number,
      pricePerKg: number,
      estimatedDeliveryDays: number
    }
  ): Observable<DeliveryServiceModel> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('type', service.deliveryType.toString())
      .set('maxWeight', service.maxWeightPerOrder.toString())
      .set('maxOrders', service.maxOrdersPerDay.toString())
      .set('basePrice', service.basePrice.toString())
      .set('pricePerKg', service.pricePerKg.toString())
      .set('estimatedDeliveryDays', service.estimatedDeliveryDays.toString());

    // Convert arrays to query params
    let updatedParams = params;
    service.countriesServed.forEach(country => {
      updatedParams = updatedParams.append('countries', country);
    });
    
    service.acceptedGoodTypes.forEach(goodType => {
      updatedParams = updatedParams.append('goodTypes', goodType);
    });
    
    return this.http.post<DeliveryServiceModel>(`${this.apiUrl}/delivery-services/register`, {}, { params: updatedParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update service availability
  updateServiceAvailability(serviceId: number, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/delivery-services/${serviceId}/availability`, {
      isActive: isActive
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get all services of a delivery person
  getDeliveryPersonServices(userId: number): Observable<DeliveryServiceModel[]> {
    return this.http.get<DeliveryServiceModel[]>(`${this.apiUrl}/delivery-services/provider/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // RATING METHODS
  
  // Rate a delivery service
  rateService(serviceId: number, rating: number): Observable<DeliveryServiceModel> {
    return this.http.post<DeliveryServiceModel>(
      `${this.apiUrl}/delivery-services/${serviceId}/rate`,
      { rating: rating }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  // Get user's ratings for services
  getUserServiceRatings(userId: number): Observable<{serviceId: number, rating: number}[]> {
    return this.http.get<{serviceId: number, rating: number}[]>(
      `${this.apiUrl}/delivery-services/ratings/user/${userId}`
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  // DELIVERY ORDERS METHODS

  // Get orders for the current user (customer)
  getMyOrders(): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/delivery-orders/my-orders`)
      .pipe(
        map(orders => this.convertOrderDates(orders)),
        catchError(this.handleError)
      );
  }

  // Get orders managed by a delivery person
  getDeliveryPersonOrders(userId: number): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/delivery-orders/delivery-person/${userId}`)
      .pipe(
        map(orders => this.convertOrderDates(orders)),
        catchError(this.handleError)
      );
  }

  // Get a specific order
  getOrderById(orderId: number): Observable<DeliveryOrder> {
    return this.http.get<DeliveryOrder>(`${this.apiUrl}/delivery-orders/${orderId}`)
      .pipe(
        map(order => this.convertOrderDates([order])[0]),
        catchError(this.handleError)
      );
  }

  // Create a new order
  createOrder(formData: FormData): Observable<any> {
    console.log("DeliveryService: Creating order", formData);
    
    const url = `${this.apiUrl}/delivery-orders`;
    
    return this.http.post<any>(url, formData).pipe(
      tap((response: any) => console.log('Order created successfully:', response)),
      catchError(error => {
        console.error('Error creating order:', error);
        return throwError(() => new Error('Failed to create order: ' + (error.message || error)));
      })
    );
  }

  // Update order status
  updateOrderStatus(orderId: number, status: OrderStatus, statusReason?: string): Observable<DeliveryOrder> {
    let params = new HttpParams().set('status', status);
      
    if (statusReason) {
      params = params.set('statusReason', statusReason);
    }
    
    return this.http.patch<DeliveryOrder>(`${this.apiUrl}/delivery-orders/${orderId}/status`, {}, { params })
      .pipe(
        map(order => this.convertOrderDates([order])[0]),
        catchError(this.handleError)
      );
  }

  // Cancel an order (customer action)
  cancelOrder(orderId: number, reason: string): Observable<DeliveryOrder> {
    return this.updateOrderStatus(orderId, OrderStatus.CANCELED, reason);
  }

  // Rate an order
  rateOrder(orderId: number, rating: number): Observable<DeliveryOrder> {
    const params = new HttpParams().set('rating', rating.toString());
    
    return this.http.patch<DeliveryOrder>(`${this.apiUrl}/delivery-orders/${orderId}/rating`, {}, { params })
      .pipe(
        map(order => this.convertOrderDates([order])[0]),
        catchError(this.handleError)
      );
  }
  
  // Get customer recent orders
  getCustomerRecentOrders(customerId: number): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/delivery-orders/user/${customerId}?limit=5`)
      .pipe(
        map(orders => this.convertOrderDates(orders)),
        catchError(this.handleError)
      );
  }

  // UTILITY METHODS

  // Calculate shipping price
  calculateShippingPrice(basePrice: number, pricePerKg: number, weight: number): number {
    return basePrice + (weight * pricePerKg);
  }

  // Helper function to convert date strings to Date objects
  private convertOrderDates(orders: DeliveryOrder[]): DeliveryOrder[] {
    return orders.map(order => ({
      ...order,
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      pickedUpAt: order.pickedUpAt ? new Date(order.pickedUpAt) : undefined,
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate) : undefined
    }));
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  deleteDeliveryService(serviceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delivery-services/${serviceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // In delivery.service.ts
getServiceRatings(serviceId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/delivery-services/${serviceId}/ratings`)
    .pipe(
      catchError(this.handleError)
    );
}

getServiceRatingStats(serviceId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/delivery-services/${serviceId}/rating-stats`)
    .pipe(
      catchError(this.handleError)
    );
}
}