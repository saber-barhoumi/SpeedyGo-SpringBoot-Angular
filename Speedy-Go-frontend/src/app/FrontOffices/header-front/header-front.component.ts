import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-front',
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.css']
})
export class HeaderFrontComponent implements OnInit {
  isLoggedIn = false;
  first_name = '';
  userRole = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.updateUserStatus();
  }
  
  updateUserStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      if (user) {
        this.first_name = user.firstName || '';
        this.userRole = user.role || '';
      }
    }
  }
  
  isDeliveryRole(): boolean {
    // Check for both spelling variants
    return this.userRole === 'DELEVERY' || this.userRole === 'DELIVERY';
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}