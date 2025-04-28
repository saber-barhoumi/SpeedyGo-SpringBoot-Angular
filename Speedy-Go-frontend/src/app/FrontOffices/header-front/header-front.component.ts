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
  defaultProfilePicture: string = 'assets/default-profile.png'; // Default profile picture

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.authService.getUser();
      console.log('Retrieved User Data:', this.user); // Debugging

      // Convert profile picture from Base64 to data URL
      if (this.user?.profilePicture && this.user?.profilePictureType) {
        this.user.profilePicture = `data:${this.user.profilePictureType};base64,${this.user.profilePicture}`;
      }
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



  ToTrips() {
    this.router.navigate(['/trips']);
  }

  ToStore(): void {
    this.router.navigate(['/storlist']);
  }


  






}