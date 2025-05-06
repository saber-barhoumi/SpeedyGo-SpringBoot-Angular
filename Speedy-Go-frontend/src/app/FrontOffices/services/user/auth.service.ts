import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8084/api/auth'; // Replace with your backend URL

  constructor(private http: HttpClient) {}


  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  
  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response) => {
        // Debug logging to see the structure of the user object
        console.group('🔍 User Data Received');
        console.log('Full user object:', response.user);
        console.log('User data fields:');
        for (const key in response.user) {
          console.log(`- ${key}: ${response.user[key]}`);
        }
        console.groupEnd();

        // Save the token and basic user data first
        this.saveToken(response.token);
        this.saveUserData(response.token, response.user);
        
        // Extract the user ID
        const userId = response.user?.userId || response.user?.id;
        
        // Log the userId we'll be using
        console.log('🔑 User logged in with ID:', userId);
        
        if (userId) {
          // Instead of trying to fetch the complete profile, we'll 
          // update the demographic data separately in the recommendation service
          console.log('✅ Basic auth data saved. Demographic data will be fetched when needed.');
        }
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
      tap(response => {
        // If validate returns updated user info, update localStorage
        if (response && response.user) {
          console.log('Token validation returned user data, updating localStorage');
          this.saveUserData(token, response.user);
        }
      }),
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
      sexe: user?.sexe || user?.sex || '',
      birthDate: user?.birthDate || user?.birth_date || user?.dateOfBirth || ''
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

  // Fetch detailed user information
  fetchUserDetails(userId: string | number): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    console.log(`Fetching detailed user information for ID: ${userId}`);
    
    // Use direct user API endpoint to get complete profile data
    return this.http.get<any>(`http://localhost:8084/api/users/${userId}`, { headers }).pipe(
      tap(detailedUser => {
        console.log('Full user details received from API:', detailedUser);
        
        // Get current user data to avoid overwriting existing fields
        const currentUser = this.getUser();
        
        // Update only if we have the user from API
        if (detailedUser) {
          const updatedUser = {
            ...currentUser,
            // Add or update demographic fields
            sexe: detailedUser.sexe || currentUser.sexe || '',
            birthDate: detailedUser.birth_date || detailedUser.birthDate || currentUser.birthDate || ''
          };
          
          console.log('Updating user data with demographic information:', updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }),
      catchError(error => {
        console.error('Error fetching detailed user profile:', error);
        return throwError(() => error);
      })
    );
  }

  // This is now a simple function to update demographic data when it becomes available
  updateUserDemographics(userId: number, demographics: any): void {
    const userData = this.getUser();
    if (userData && userData.userId) {
      const updatedUser = {
        ...userData,
        sexe: demographics.sexe || userData.sexe || '',
        birthDate: demographics.birthDate || demographics.birth_date || userData.birthDate || ''
      };
      
      console.log('📊 Updating user data with demographics:', updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  /**
   * Directly fetches user demographic data from the backend and updates localStorage
   * This uses the same approach as the admin panel
   */
  fetchAndUpdateUserDemographics(userId: number): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No auth token available'));
    }

    console.log('🔍 Fetching user demographics directly from the UserController...');
    
    // Use the same endpoint as the admin panel
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`http://localhost:8084/api/user/getUser/${userId}`, { headers }).pipe(
      tap(user => {
        console.log('📊 Raw user data received:', user);
        
        if (user) {
          // Get current user data from localStorage
          const currentUser = this.getUser();
          
          // Update with the values from API
          const updatedUser = {
            ...currentUser,
            sexe: user.sexe || '',
            birthDate: user.birth_date || ''
          };
          
          console.log('✅ Updating localStorage with demographics:', {
            sexe: updatedUser.sexe,
            birthDate: updatedUser.birthDate
          });
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          return updatedUser;
        }
        return null;
      }),
      catchError(error => {
        console.error('❌ Error fetching user demographics:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUserId(): number | null {
  const user = this.getUser(); // suppose que getUser() retourne un objet User ou null
  return user?.userId || null;
}
}