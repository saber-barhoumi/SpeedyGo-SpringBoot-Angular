import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/user/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  providers: [AuthService]
})
export class DeliveryComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router // Inject Router and define as private property
  ) { }

  ngOnInit(): void {
    console.log("Delivery Component is working!");

    // Check if the user has the "delivery" role
    if (!this.hasDeliveryRole()) {
      // If not, redirect to another page (e.g., home or login)
      this.router.navigate(['/home']); // Or '/login'
    }
  }

  hasDeliveryRole(): boolean {
    // Check if the user has the "delivery" role
    return this.authService.getUserRole() === 'DELEVERY';
  }

  goToCarpooling() {
    this.router.navigate(['/carpooling']); // Navigate to /carpooling
  }
}