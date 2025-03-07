import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-front',
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.css']
})
export class HeaderFrontComponent implements OnInit {

  isLoggedIn: boolean = false;
  user: any; // To store user data
  showProfile: boolean = false; // Flag to show/hide profile

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.authService.getUser(); // Retrieve user data
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false; // Update isLoggedIn flag
    this.showProfile = false; // Hide profile
    this.user = null; // Clear user data
    this.router.navigate(['/home']);
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile; // Toggle profile visibility
  }
}
