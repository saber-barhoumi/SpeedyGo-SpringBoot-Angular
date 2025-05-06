// services/delivery/carpooling/carpooling.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Carpooling } from 'src/app/models/carpooling.model';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model';
import { CarpoolingReview } from 'src/app/models/carpooling-review.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../FrontOffices/services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CarpoolingService {
  private apiUrl = `${environment.apiUrl}/carpoolings`;
  private priceUrl = `${environment.apiUrl}/price`;
  private reservationUrl = `${environment.apiUrl}/carpoolings/reservations`;
  private reviewUrl = `${environment.apiUrl}/reviews`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Carpooling Methods
  getAllCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(this.apiUrl);
  }

  getCarpoolingById(id: number): Observable<Carpooling> {
    return this.http.get<Carpooling>(`${this.apiUrl}/${id}`);
  }

  // Remove/Delete carpooling method
  removeCarpooling(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  getUpcomingCarpoolings(): Observable<Carpooling[]> {
    return this.http.get<Carpooling[]>(`${this.apiUrl}/upcoming`);
  }

  // Admin Methods for Managing Carpoolings - FIX THE ENDPOINT HERE
  createCarpooling(carpooling: Carpooling): Observable<Carpooling> {
    // Validate required fields
    if (!carpooling.departureLocation || !carpooling.destination || !carpooling.startTime) {
      return throwError(() => new Error('Missing required fields for carpooling'));
    }
    
    // Add auth headers to the request
    const headers = this.authService.getAuthHeaders();
    
    // Log for debugging
    console.log('Creating carpooling with data:', carpooling);
    console.log('Authorization headers:', headers);
    
    return this.http.post<Carpooling>(`${this.apiUrl}/create`, carpooling, { headers })
      .pipe(
        catchError(error => {
          console.error('Error creating carpooling:', error);
          // Check for specific error cases
          if (error.status === 403) {
            return throwError(() => new Error('You do not have permission to create carpoolings'));
          } else if (error.status === 400) {
            return throwError(() => new Error('Invalid carpooling data'));
          }
          return throwError(() => new Error('Failed to create carpooling'));
        })
      );
  }

  updateCarpooling(carpoolingId: number, carpooling: Carpooling): Observable<Carpooling> {
    // Change from ${this.apiUrl}/${carpoolingId} to ${this.apiUrl}/update/${carpoolingId}
    return this.http.put<Carpooling>(`${this.apiUrl}/update/${carpoolingId}`, carpooling);
  }

  // Calculate price method that handles different response formats
  calculatePrice(carpooling: any): Observable<any> {
    // Ensure all required fields have default values to prevent null issues
    const requestData = {
      departureLocation: carpooling.departureLocation || '',
      destination: carpooling.destination || '',
      startTime: carpooling.startTime || new Date(),
      distanceKm: carpooling.distanceKm || 0,
      durationMinutes: carpooling.durationMinutes || 0,
      vehicleType: carpooling.vehicleType || 'sedan',
      fuelType: carpooling.fuelType || 'gasoline',
      availableSeats: carpooling.availableSeats || 1,
      description: carpooling.description || '',
      wifi: carpooling.wifi || 0,
      airConditioning: carpooling.airConditioning || 0,
      weatherType: carpooling.weatherType || 'Clear'
    };

    // Try the new endpoint first
    return this.http.post<any>(`${this.priceUrl}/calculate`, requestData)
      .pipe(
        catchError(error => {
          console.error('Error calling new price endpoint, trying fallback', error);
          // If the new endpoint fails, try the original endpoint as fallback
          return this.http.post<any>(`${this.apiUrl}/calculate-price`, requestData);
        })
      );
  }

  // Reservation Methods
  reserveCarpooling(carpoolingId: number, userId: number, seatsToReserve: number): Observable<any> {
    return this.http.post(`${this.reservationUrl}/reserve`, {
      carpoolingId,
      userId,
      seatsToReserve
    });
  }

  getMyReservations(): Observable<ReservationCarpoo[]> {
    return this.http.get<ReservationCarpoo[]>(`${this.apiUrl}/reservations/me`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching reservations', error);
        return throwError(() => new Error('Failed to load reservations'));
      })
    );
  }

  // Method for upcoming reservations
  getMyUpcomingReservations(): Observable<ReservationCarpoo[]> {
    return this.http.get<ReservationCarpoo[]>(`${this.apiUrl}/reservations/me/upcoming`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching upcoming reservations', error);
        return throwError(() => new Error('Failed to load upcoming reservations'));
      })
    );
  }

  // Delete reservation method
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservations/${reservationId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error deleting reservation', error);
        return throwError(() => new Error('Failed to delete reservation'));
      })
    );
  }

  // Enhanced filtering method
  filterCarpoolings(filters: {
    departureLocation?: string,
    destination?: string,
    startDateFrom?: Date,
    startDateTo?: Date,
    minPrice?: number,
    maxPrice?: number,
    vehicleType?: string,
    wifi?: boolean,
    airConditioning?: boolean
  }): Observable<Carpooling[]> {
    let params = new HttpParams();

    if (filters.departureLocation) {
      params = params.append('departureLocation', filters.departureLocation);
    }
    if (filters.destination) {
      params = params.append('destination', filters.destination);
    }
    if (filters.startDateFrom) {
      params = params.append('startDateFrom', filters.startDateFrom.toISOString());
    }
    if (filters.startDateTo) {
      params = params.append('startDateTo', filters.startDateTo.toISOString());
    }
    if (filters.minPrice !== undefined) {
      params = params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      params = params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.vehicleType) {
      params = params.append('vehicleType', filters.vehicleType);
    }
    if (filters.wifi !== undefined) {
      params = params.append('wifi', filters.wifi.toString());
    }
    if (filters.airConditioning !== undefined) {
      params = params.append('airConditioning', filters.airConditioning.toString());
    }

    return this.http.get<Carpooling[]>(`${this.apiUrl}/filter`, { params });
  }

  // Review & Rating Methods
  rateCarpooling(reservationId: number, rating: number): Observable<any> {
    return this.http.post(`${this.reviewUrl}/rate`, {
      reservationId,
      rating
    });
  }

  addReview(reservationId: number, reviewText: string): Observable<any> {
    return this.http.post(`${this.reviewUrl}/add`, {
      reservationId,
      reviewText
    });
  }

  getCarpoolingReviews(carpoolingId: number): Observable<any> {
    return this.http.get(`${this.reviewUrl}/carpooling/${carpoolingId}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching carpooling reviews', error);
        return throwError(() => new Error('Failed to load reviews'));
      })
    );
  }

  getUserReviews(): Observable<any> {
    return this.http.get(`${this.reviewUrl}/user`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching user reviews', error);
        return throwError(() => new Error('Failed to load user reviews'));
      })
    );
  }

  getReviewStatistics(): Observable<any> {
    return this.http.get(`${this.reviewUrl}/statistics`);
  }

  // Advanced sorting method
  sortCarpoolings(
    carpoolings: Carpooling[], 
    sortBy: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'rating_desc'
  ): Carpooling[] {
    switch(sortBy) {
      case 'price_asc':
        return [...carpoolings].sort((a, b) => a.pricePerSeat - b.pricePerSeat);
      case 'price_desc':
        return [...carpoolings].sort((a, b) => b.pricePerSeat - a.pricePerSeat);
      case 'date_asc':
        return [...carpoolings].sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      case 'date_desc':
        return [...carpoolings].sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      case 'rating_desc':
        return [...carpoolings].sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
      default:
        return carpoolings;
    }
  }
  
  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.reservationUrl}/${reservationId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteCarpooling(carpoolingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${carpoolingId}`);
  }
}