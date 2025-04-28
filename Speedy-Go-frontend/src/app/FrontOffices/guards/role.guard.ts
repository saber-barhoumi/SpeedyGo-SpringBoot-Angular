import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if route has allowedRoles data
    const allowedRoles = route.data['allowedRoles'] as Array<string>;
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // No role restrictions
    }
    
    // Check if user has one of the allowed roles
    const userRole = this.authService.getUserRole();
    
    if (!userRole || !allowedRoles.some(role => role === userRole)) {
      const rolesString = allowedRoles.map(role => role.toLowerCase()).join(' or ');
      this.toastr.error(`You need to be a ${rolesString} to access this page`);
      
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      } else {
        this.router.navigate(['/home']);
      }
      
      return false;
    }
    
    return true;
  }
}