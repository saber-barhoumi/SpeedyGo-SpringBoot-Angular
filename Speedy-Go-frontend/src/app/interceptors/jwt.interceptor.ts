// src/app/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpContextToken
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../FrontOffices/services/user/auth.service';

// Define token for skipping auth
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check if request should skip authentication
    if (request.context.get(SKIP_AUTH_INTERCEPTOR)) {
      console.log('Skipping JWT interceptor for:', request.url);
      return next.handle(request);
    }
    
    // Get the token from the auth service
    const token = this.authService.getToken();
    
    // Skip adding token for authentication endpoints or external API calls
    if (request.url.includes('/auth/login') || 
        request.url.includes('/auth/register') ||
        !request.url.includes('localhost:8084')) { // Skip any external API calls
      console.log('Skipping JWT for external or auth URL:', request.url);
      return next.handle(request);
    }
    
    // Clone the request and add the token if it exists
    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Adding JWT token to request:', request.url);
      console.log('Request with headers:', cloned.headers.keys());
      
      // Handle the cloned request with token
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized error (expired token)
          if (error.status === 401) {
            console.log('Token expired or invalid');
            this.authService.logout();
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
    // If no token exists, proceed with original request
    return next.handle(request);
  }
}