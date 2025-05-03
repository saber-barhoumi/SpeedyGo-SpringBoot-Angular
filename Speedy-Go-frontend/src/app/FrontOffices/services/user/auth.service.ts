import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8084/api/auth'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.saveUserData(response.token, response.user);
      }),
      catchError(this.handleError)
    );
  }

  // Register method
  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Validate token method
  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/validate`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  

  // Save token in localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  } 





  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Get user data from localStorage
  getUser(): any {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      console.error('Error parsing user from localStorage', error);
      return {}; // Safe empty object
    }
  }

  // Save user data in localStorage
  saveUserData(token: string, user: any): void {
    const userData = {
      userId: user?.id || user?.userId || user?.user_id || '',
      email: user?.email || '',
      firstName: user?.firstName || user?.firstname || '',
      lastName: user?.lastName || user?.lastname || '',
      role: user?.role || 'CUSTOMER',
      profilePicture: user?.profilePicture || '',
      address: user?.address || '',
      phoneNumber: user?.phoneNumber || user?.phone_number || '',
    };

    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  // Check if user has a specific role
  hasRole(role: string | string[]): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    return Array.isArray(role) ? role.includes(userRole) : userRole === role;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Handle errors
  private handleError(error: any): Observable<any> {
    console.error('Request error:', error);
    let message = 'Something went wrong';
    if (error.error) {
      message = error.error.error || error.error.message || message;
    }
    return throwError(() => new Error(message));
  }
}
