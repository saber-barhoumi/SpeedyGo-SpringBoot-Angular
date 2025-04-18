import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/user/auth.service';

@Component({
  selector: 'app-all-template-front',
  templateUrl: './all-template-front.component.html',
  styleUrls: ['./all-template-front.component.css']
})
export class AllTemplateFrontComponent implements OnInit {
  title = 'SpeedyGo';
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    // Listen for authentication changes
    
    ;
    
    // Monitor route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // When route changes, check if we need to update anything
      console.log('Navigation to:', this.router.url);
    });
  }
  
  /**
   * Checks if current user has CUSTOMER role
   */
  isCustomerRole(): boolean {
    const role = this.authService.getUserRole();
    return role === 'CUSTOMER' || !role; // Show for customers and guests
  }
  
  /**
   * Checks if current user is in admin section
   */
  isAdminSection(): boolean {
    return this.router.url.startsWith('/admin');
  }
}