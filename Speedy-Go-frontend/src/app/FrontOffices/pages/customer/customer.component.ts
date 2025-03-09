import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model'; // Import ReservationCarpoo

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  carpoolings: any[] = [];
  errorMessage: string = '';
  userId: number | null = null; // Store the delivery user ID
  myReservations: ReservationCarpoo[] = []; // Add this line

  constructor(
    private carpoolingService: CarpoolingService,
    private authService: AuthService // Inject the AuthService
  ) { }

  ngOnInit(): void {
    // Get the delivery user ID from the AuthService
    const userData = this.authService.getUser();
    if (userData && userData.userId) {
      this.userId = userData.userId;
      this.getCarpoolings(); // Fetch carpoolings after getting the user ID
      this.getMyReservations(); // Fetch my reservations after getting the user ID
    } else {
      this.errorMessage = 'Failed to retrieve user data. Please try again later.';
    }
  }

  getCarpoolings(): void {
    this.carpoolingService.getAllCarpoolings()
      .subscribe(
        (carpoolings: any[]) => {
          console.log('All carpoolings:', carpoolings);
          this.carpoolings = carpoolings;
          console.log('All carpoolings for customer:', this.carpoolings);
          this.carpoolings.forEach(carpooling => {
            console.log('Carpooling ID:', carpooling.carpoolingId); // Add this line
          });
        },
        (error) => {
          console.error('Error fetching carpoolings:', error);
          this.errorMessage = 'Failed to load carpoolings. Please try again later.';
        }
      );
  }

  reserveCarpooling(carpoolingId: number): void {
    console.log('Carpooling ID:', carpoolingId); // Log the carpooling ID
    if (this.userId !== null) { // Changed deliveryUserId to userId
      this.carpoolingService.reserveCarpooling(carpoolingId, this.userId) // Changed deliveryUserId to userId
        .subscribe(
          (response: any[]) => {
            console.log('Carpooling reserved successfully:', response);
            this.getCarpoolings();
          },
          (error) => {
            console.error('Error reserving carpooling:', error);
            this.errorMessage = 'Failed to reserve carpooling. Please try again later.';
          }
        );
    } else {
      this.errorMessage = 'User ID not available. Please try again later.';
    }
  }

  getMyReservations(): void {
    this.carpoolingService.getMyReservations()
      .subscribe(
        (reservations: ReservationCarpoo[]) => {
          this.myReservations = reservations;
          console.log("My Reservations:", this.myReservations); // Add this line for debugging
        },
        (error: any) => {
          console.error("Error fetching my reservations:", error);
          this.errorMessage = 'Failed to load my reservations. Please try again later.';
        }
      );
  }
  deleteMyReservation(reservationId: number): void {
    this.carpoolingService.deleteReservation(reservationId)
      .subscribe(
        (response: any) => {
          console.log("Reservation deleted successfully:", response);
          this.getMyReservations(); // Refresh the list of reservations
        },
        (error: any) => {
          console.error("Error deleting reservation:", error);
          this.errorMessage = 'Failed to delete reservation. Please try again later.';
        }
      );
  }
}