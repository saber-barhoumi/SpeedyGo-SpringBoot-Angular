import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {

  isLoggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    console.log("Delivery Component is working!");

    if (!this.hasDeliveryRole()) {
      this.router.navigate(['/home']);
    }
  }

  hasDeliveryRole(): boolean {
    return this.authService.getUserRole() === 'DELEVERY';
  }

  goToCarpooling(): void {
    this.router.navigate(['/carpooling']);
  }
}
