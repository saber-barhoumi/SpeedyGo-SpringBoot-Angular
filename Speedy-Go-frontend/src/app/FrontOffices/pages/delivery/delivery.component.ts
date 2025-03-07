import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/user/auth.service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  providers: [AuthService]
})
export class DeliveryComponent implements OnInit {

  constructor(private authService: AuthService) { } // Declare and initialize the authService property

  ngOnInit(): void {
    console.log("Delivery Component is working!");
  }

  isCustomerRole(): boolean {
    // Replace this logic with your actual role-checking logic
    return this.authService.getUserRole() === 'customer';
  }
}