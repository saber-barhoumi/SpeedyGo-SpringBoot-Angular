import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient) {}

  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password });
  }

  // Register method
 register(user: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/register`, user, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  // Validate token method
  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) return new Observable(observer => observer.error('No token found'));

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/validate`, { headers });
  }
  saveUserData(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // Store user details
  }

  // Store token
  saveToken(token: string): void {
    console.log('Saving token:', token); 
    localStorage.setItem('token', token);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
   // Check if user is authenticated
   isAuthenticated(): boolean {
    console.log("Token: " + this.getToken());
    return !!this.getToken(); // Returns true if a token exists
  }


  // Logout method
  logout(): void {
    localStorage.removeItem('token');
  }
}
