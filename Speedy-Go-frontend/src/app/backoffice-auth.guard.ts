import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './FrontOffices/services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BackofficeAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getUser(); // Get user from localStorage

    if (this.authService.isLoggedIn() && user.role === 'ADMIN') {
      return true; // Allow access to back office
    }

    // Redirect to login or unauthorized page
    this.router.navigate(['/loginAdmin']);
    return false;
  }
}
