import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/user/auth.service';


@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (token) {
      return true;  // If token exists, allow access to route
    } else {
      this.router.navigate(['/login']);  // Redirect to login if no token
      return false;
    }
  }
  
}