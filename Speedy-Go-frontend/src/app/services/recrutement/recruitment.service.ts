import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = environment.apiUrl + '/api/recruitment';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Get all recruitments
  getAllRecruitments(): Observable<any[]> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to view all applications'));
    }
    
    // Additional check for admin role could be done here if needed
    
    return this.http.get<any[]>(`${this.apiUrl}`)
      .pipe(
        tap(applications => console.log(`Retrieved ${applications.length} recruitment applications`)),
        catchError(this.handleError)
      );
  }

  // Get recruitment by ID
  getRecruitmentById(id: number): Observable<any> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to view an application'));
    }
    
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create recruitment with improved error handling
  createRecruitment(userId: number, recruitmentData: any): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to create an application'));
    }
    
    console.log(`Sending POST request to ${this.apiUrl}/${userId} with data:`, recruitmentData);
    return this.http.post<any>(`${this.apiUrl}/${userId}`, recruitmentData)
      .pipe(catchError(this.handleError));
  }

  // Update recruitment
  updateRecruitment(id: number, recruitmentData: any): Observable<any> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to update an application'));
    }
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, recruitmentData)
      .pipe(
        tap(response => console.log('Updated recruitment application:', response)),
        catchError(this.handleError)
      );
  }

  // Get recruitment statistics
  getRecruitmentStatistics(): Observable<any> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to get statistics'));
    }
    
    // Note: This endpoint doesn't exist in your controller, you'll need to add it
    return this.http.get<any>(`${this.apiUrl}/statistics`)
      .pipe(
        tap(stats => console.log('Retrieved recruitment statistics:', stats)),
        catchError(this.handleError)
      );
  }

  // Delete recruitment
  deleteRecruitment(id: number): Observable<void> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to delete an application'));
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get recruitment by status
  getRecruitmentsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Get recruitment by user ID
  getRecruitmentsByUser(userId: number): Observable<any[]> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to view applications'));
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Update recruitment status (admin function)
  // Updated to use PATCH and request parameters according to the backend implementation
  updateRecruitmentStatus(id: number, statusData: any): Observable<any> {
    // Verify the user is authenticated
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to update application status'));
    }
    
    // Log the action with timestamp
    const currentDate = new Date('2025-03-03 18:14:50');
    console.log(`Admin action: Updating status of application ${id} at ${currentDate.toISOString()}`);
    console.log(`Action performed by: YoussefHarrabi`);
    
    // Create params object from statusData
    let params = new HttpParams()
      .set('status', statusData.status);
    
    // Add feedback parameter if provided in statusData
    if (statusData.reason) {
      params = params.set('feedback', statusData.reason);
    }
    
    // Use PATCH with query parameters instead of body
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/status`, 
      null,  // No body needed
      { params: params } // Pass parameters as query params
    ).pipe(
      tap(response => console.log('Updated recruitment status:', response)),
      catchError(this.handleError)
    );
  }

  // Log timestamp
  logTimestamp() {
    const now = new Date('2025-03-03 18:14:50');
    console.log(`Current operation performed at: ${now.toISOString()}`);
    console.log(`By user: YoussefHarrabi`);
  }

  // Enhanced error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    // Log timestamp for error tracking
    const timestamp = new Date('2025-03-03 18:14:50').toISOString();
    console.error(`Error occurred at ${timestamp}`);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object' && error.error.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      
      // If unauthorized, handle token expiration
      if (error.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}