// FrontOffices/pages/customer/customer.component.ts
import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model';
import { Carpooling } from 'src/app/models/carpooling.model';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  showCarpoolingList = false;
  carpoolings: Carpooling[] = [];
  upcomingCarpoolings: Carpooling[] = [];
  errorMessage: string = '';
  userId: number | null = null;
  myReservations: ReservationCarpoo[] = [];
  myUpcomingReservations: ReservationCarpoo[] = [];
  isLoggedIn: boolean = false;
  viewMode: 'all' | 'upcoming' = 'upcoming'; // Default to upcoming view
  now: Date = new Date(); // Current date/time for comparisons

  // Add these properties
  selectedSeats: { [carpoolingId: number]: number } = {};
  totalPrices: { [carpoolingId: number]: number } = {};

  constructor(
    private carpoolingService: CarpoolingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    // Get the user ID from the AuthService
    const userData = this.authService.getUser();
    if (userData && userData.userId) {
      this.userId = userData.userId;
      this.loadCarpoolings();
      this.getMyReservations();
    } else {
      this.errorMessage = 'Failed to retrieve user data. Please try again later.';
    }

    // Update the current time every minute
    setInterval(() => {
      this.now = new Date();
    }, 60000); // 60000 ms = 1 minute
  }

  loadCarpoolings(): void {
    // Load all carpoolings
    this.carpoolingService.getAllCarpoolings().subscribe({
      next: (carpoolings: Carpooling[]) => {
        this.carpoolings = carpoolings;
        // Initialize selected seats and prices
        this.carpoolings.forEach(carpooling => {
          this.selectedSeats[carpooling.carpoolingId || 0] = 1;
          this.updateTotalPrice(carpooling);
        });
        console.log('All carpoolings for customer:', this.carpoolings);
      },
      error: (error) => {
        console.error('Error fetching carpoolings:', error);
        this.errorMessage = 'Failed to load carpoolings. Please try again later.';
      }
    });

    // Load upcoming carpoolings
    this.carpoolingService.getUpcomingCarpoolings().subscribe({
      next: (carpoolings: Carpooling[]) => {
        this.upcomingCarpoolings = carpoolings;
        // Initialize selected seats and prices
        this.upcomingCarpoolings.forEach(carpooling => {
          this.selectedSeats[carpooling.carpoolingId || 0] = 1;
          this.updateTotalPrice(carpooling);
        });
        console.log('Upcoming carpoolings:', this.upcomingCarpoolings);
      },
      error: (error) => {
        console.error('Error fetching upcoming carpoolings:', error);
      }
    });
  }

  reserveCarpooling(carpoolingId: number): void {
    console.log('Carpooling ID:', carpoolingId);
    if (this.userId !== null) {
      const seatsToReserve = this.selectedSeats[carpoolingId] || 1;

      this.carpoolingService.reserveCarpooling(carpoolingId, this.userId, seatsToReserve)
        .subscribe({
          next: (response: any) => {
            console.log('Carpooling reserved successfully:', response);
            this.loadCarpoolings();
            this.getMyReservations();
          },
          error: (error) => {
            console.error('Error reserving carpooling:', error);
            this.errorMessage = 'Failed to reserve carpooling. Please try again later.';
          }
        });
    } else {
      this.errorMessage = 'User ID not available. Please try again later.';
    }
  }

  getMyReservations(): void {
    // Get all reservations
    this.carpoolingService.getMyReservations()
      .subscribe({
        next: (reservations: ReservationCarpoo[]) => {
          this.myReservations = reservations;
          console.log("My Reservations:", this.myReservations);
        },
        error: (error) => {
          console.error("Error fetching my reservations:", error);
          this.errorMessage = 'Failed to load my reservations. Please try again later.';
        }
      });

    // Get upcoming reservations
    this.carpoolingService.getMyUpcomingReservations()
      .subscribe({
        next: (reservations: ReservationCarpoo[]) => {
          this.myUpcomingReservations = reservations;
          console.log("My Upcoming Reservations:", this.myUpcomingReservations);
        },
        error: (error) => {
          console.error("Error fetching my upcoming reservations:", error);
        }
      });
  }

  deleteMyReservation(reservationId: number): void {
    this.carpoolingService.deleteReservation(reservationId)
      .subscribe({
        next: (response: any) => {
          console.log("Reservation deleted successfully:", response);
          this.getMyReservations(); // Refresh the list of reservations
        },
        error: (error) => {
          console.error("Error deleting reservation:", error);
          this.errorMessage = 'Failed to delete reservation. Please try again later.';
        }
      });
  }

  toggleCarpoolingList() {
    this.showCarpoolingList = !this.showCarpoolingList;
  }

  toggleViewMode(mode: 'all' | 'upcoming') {
    this.viewMode = mode;
  }

  // Helper method to check if a date is in the future
  isInFuture(dateTime: string | Date): boolean {
    const futureDate = new Date(dateTime);
    return futureDate.getTime() > this.now.getTime();
  }

  // Helper method to check if a carpooling trip is starting soon (within 1 hour)
  isStartingSoon(startTime: string | Date): boolean {
    if (!startTime) return false;

    const tripStartTime = new Date(startTime);
    const oneHourFromNow = new Date(this.now.getTime() + 60 * 60 * 1000);

    return tripStartTime > this.now && tripStartTime <= oneHourFromNow;
  }

  // Helper method to get time remaining until trip starts
  getTimeUntilStart(startTime: string | Date): string {
    if (!startTime) return '';

    const tripStartTime = new Date(startTime);
    const diffMs = tripStartTime.getTime() - this.now.getTime();

    // If past date or invalid date, return empty string
    if (diffMs <= 0) return '';

    // Convert to minutes
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  }

  // Method to get an array for the select dropdown (max 4 seats)
  getAvailableSeatsArray(availableSeats: number): number[] {
    // Limit to max 4 seats per reservation or available seats (whichever is smaller)
    const maxSeats = Math.min(availableSeats || 0, 4);
    return Array(maxSeats).fill(0);
  }

  // Method to update selected seats
  updateSelectedSeats(carpoolingId: number, seats: number): void {
    this.selectedSeats[carpoolingId] = seats;

    // Find the carpooling and update total price
    const carpooling = this.carpoolings.find(c => c.carpoolingId === carpoolingId) ||
                      this.upcomingCarpoolings.find(c => c.carpoolingId === carpoolingId);

    if (carpooling) {
      this.updateTotalPrice(carpooling);
    }
  }

  // Calculate total price
  updateTotalPrice(carpooling: Carpooling): void {
    const seats = this.selectedSeats[carpooling.carpoolingId || 0] || 1;
    this.totalPrices[carpooling.carpoolingId || 0] = seats * (carpooling.pricePerSeat || 0);
  }

}
