// services/user/password-reset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  // Don't include '/api' in the base URL
  public apiUrl = 'http://localhost:8084';

  constructor(private http: HttpClient) { }

  // Use the exact path from the server logs
  validateResetToken(token: string): Observable<any> {
    // Note: responseType 'text' is included to handle non-JSON responses
    return this.http.get(
      `${this.apiUrl}/api/auth/password/validate-token?token=${token}`,
      { responseType: 'text' }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/auth/password/reset`,
      { token, newPassword },
      { responseType: 'text' }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/auth/password/forgot`,
      { email },
      { responseType: 'text' }
    );
  }
}