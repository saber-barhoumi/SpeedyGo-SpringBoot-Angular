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
    console.log('Checking if user is logged in');
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    return !!token;
  }

  getUser() {
    console.log('Getting user from localStorage');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User:', user);
    return user;
  }
  saveUserData(token: string, user: any): void {
    localStorage.setItem('token', token);
    
    // Ensure user object has all required fields
    const userData = {
      userId: user.id || user.userId || user.user_id,
      email: user.email,
      firstName: user.firstName || user.firstname || '',
      lastName: user.lastName || user.lastname || '',
      role: user.role || 'CUSTOMER', // Default to CUSTOMER if no role provided
      // Add other user fields as needed
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Log the save
    console.log(`User data saved at: ${new Date('2025-03-03 18:44:09').toISOString()}`);
    console.log(`User role: ${userData.role}`);
  }
  
  /**
   * Get the current user's role
   */
  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
  /**
   * Check if user has a specific role
   */
  hasRole(role: string | string[]): boolean {
    const userRole = this.getUserRole();
    
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  }
   // Check if user is authenticated
   isAuthenticated(): boolean {
    console.log("Token: " + this.getToken());
    return !!this.getToken(); // Returns true if a token exists
  }


  // Logout method
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Add this line to remove user data
  }
  isRecruitmentCompleted(): boolean {
    return localStorage.getItem('recruitmentCompleted') === 'true';
  }
}