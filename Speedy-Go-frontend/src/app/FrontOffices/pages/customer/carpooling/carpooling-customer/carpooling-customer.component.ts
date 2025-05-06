import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { AuthService } from '../../../../services/user/auth.service';
import { ReservationCarpoo } from 'src/app/models/reservation-carpoo.model';
import { Carpooling } from 'src/app/models/carpooling.model';
import { CarpoolingReview } from 'src/app/models/carpooling-review.model';
import { Subscription, interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-carpooling-customer',
  templateUrl: './carpooling-customer.component.html',
  styleUrls: ['./carpooling-customer.component.scss']
})
export class CarpoolingCustomerComponent implements OnInit, OnDestroy {
  // Carpooling Lists
  carpoolings: Carpooling[] = [];
  upcomingCarpoolings: Carpooling[] = [];
  filteredCarpoolings: Carpooling[] = [];
  paginatedCarpoolings: Carpooling[] = [];
  
  // Reservation and User Data
  errorMessage: string = '';
  userId: number | null = null;
  myReservations: ReservationCarpoo[] = [];
  
  // Component State
  isLoggedIn: boolean = false;
  isLoading: boolean = false;
  viewMode: 'all' | 'upcoming' = 'upcoming';
  
  // Time Tracking
  now: Date = new Date();
  private timeUpdateSubscription: Subscription | null = null;

  // Seat and Price Tracking
  selectedSeats: { [carpoolingId: number]: number } = {};
  totalPrices: { [carpoolingId: number]: number } = {};

  // Ratings and Reviews
  carpoolingReviews: { [carpoolingId: number]: CarpoolingReview[] } = {};
  userReviews: CarpoolingReview[] = [];
  reviewText: { [reservationId: number]: string } = {};
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  Math = Math; // For template usage
  
  // Filtering and Sorting
  filterForm: FormGroup;
  sortOptions = [
    { value: 'date_asc', label: 'Departure Time (Earliest First)' },
    { value: 'date_desc', label: 'Departure Time (Latest First)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'rating_desc', label: 'Rating (Highest First)' }
  ];
  
  // Dropdown options
  cities: string[] = ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Hammamet', 'Nabeul', 'Bizerte', 'Gabes', 'Ariana', 'Kairouan'];
  vehicleTypes: string[] = ['Sedan', 'SUV', 'Hatchback', 'Van', 'Luxury'];

  constructor(
    private carpoolingService: CarpoolingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      departureLocation: [''],
      destination: [''],
      startDateFrom: [null],
      startDateTo: [null],
      minPrice: [null],
      maxPrice: [null],
      vehicleType: [''],
      wifi: [false],
      airConditioning: [false]
    });
  }

  ngOnInit(): void {
    // Initialize component
    this.initializeComponent();
    
    // Setup time update interval
    this.setupTimeUpdate();
    
    // Listen for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe();
    }
  }

  private initializeComponent(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const userData = this.authService.getUser();

    if (userData && userData.userId) {
      this.userId = userData.userId;
      this.loadCarpoolings();
      this.getMyReservations();
      this.getUserReviews();
    } else {
      this.errorMessage = 'Failed to retrieve user data. Please log in.';
    }
  }

  private setupTimeUpdate(): void {
    // Update current time every minute
    this.timeUpdateSubscription = interval(60000).subscribe(() => {
      this.now = new Date();
    });
  }

  loadCarpoolings(): void {
    this.isLoading = true;

    // Load all carpoolings
    this.carpoolingService.getAllCarpoolings().subscribe({
      next: (carpoolings: Carpooling[]) => {
        this.carpoolings = carpoolings;
        this.initializeCarpoolingDetails(this.carpoolings);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching carpoolings:', error);
        this.errorMessage = 'Failed to load carpoolings. Please try again.';
      },
      complete: () => this.isLoading = false
    });

    // Load upcoming carpoolings
    this.carpoolingService.getUpcomingCarpoolings().subscribe({
      next: (carpoolings: Carpooling[]) => {
        this.upcomingCarpoolings = carpoolings;
        this.initializeCarpoolingDetails(this.upcomingCarpoolings);
        if (this.viewMode === 'upcoming') {
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error fetching upcoming carpoolings:', error);
      }
    });
  }

  private initializeCarpoolingDetails(carpoolings: Carpooling[]): void {
    carpoolings.forEach(carpooling => {
      // Initialize default seat selection
      this.selectedSeats[carpooling.carpoolingId || 0] = 1;
      // Calculate initial total price
      this.updateTotalPrice(carpooling);
      // Load reviews for each carpooling
      this.loadCarpoolingReviews(carpooling.carpoolingId || 0);
    });
  }

  reserveCarpooling(carpoolingId: number): void {
    if (!this.userId) {
      this.errorMessage = 'Please log in to reserve a carpooling.';
      this.toastr.error('Please log in to reserve a carpooling.');
      return;
    }

    const seatsToReserve = this.selectedSeats[carpoolingId] || 1;
    
    this.isLoading = true;
    this.carpoolingService.reserveCarpooling(carpoolingId, this.userId, seatsToReserve)
      .subscribe({
        next: () => {
          this.loadCarpoolings();
          this.getMyReservations();
          this.isLoading = false;
          this.toastr.success('Carpooling reserved successfully!');
        },
        error: (error) => {
          console.error('Error reserving carpooling:', error);
          this.errorMessage = 'Failed to reserve carpooling. Please try again.';
          this.toastr.error('Failed to reserve carpooling.');
          this.isLoading = false;
        }
      });
  }

  getMyReservations(): void {
    this.carpoolingService.getMyReservations().subscribe({
      next: (reservations: ReservationCarpoo[]) => {
        this.myReservations = reservations;
        // Initialize review text fields for each reservation
        this.myReservations.forEach(reservation => {
          this.reviewText[reservation.reservation_id] = '';
        });
      },
      error: (error) => {
        console.error('Error fetching reservations:', error);
        this.errorMessage = 'Failed to load your reservations.';
        this.toastr.error('Failed to load your reservations.');
      }
    });
  }

  deleteMyReservation(reservationId: number): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.isLoading = true;
      // Correct the method name to match the service
      this.carpoolingService.cancelReservation(reservationId)
        .subscribe({
          next: () => {
            this.getMyReservations();
            this.loadCarpoolings();
            this.isLoading = false;
            this.toastr.success('Reservation cancelled successfully.');
          },
          error: (error: Error) => {
            console.error('Error deleting reservation:', error);
            this.errorMessage = 'Failed to delete reservation.';
            this.toastr.error('Failed to cancel reservation.');
            this.isLoading = false;
          }
        });
    }
  }


  // Ratings and Reviews Methods
  rateCarpooling(reservationId: number, rating: number): void {
    this.carpoolingService.rateCarpooling(reservationId, rating).subscribe({
      next: (response) => {
        this.toastr.success('Rating submitted successfully!');
        // Update local data
        const reservation = this.myReservations.find(r => r.reservation_id === reservationId);
        if (reservation) {
          reservation.rating = rating;
        }
        // Refresh carpoolings to update average ratings
        this.loadCarpoolings();
      },
      error: (error) => {
        console.error('Error submitting rating:', error);
        this.toastr.error('Failed to submit rating.');
      }
    });
  }

  submitReview(reservationId: number): void {
    const reviewTextValue = this.reviewText[reservationId];
    
    if (!reviewTextValue || reviewTextValue.trim() === '') {
      this.toastr.warning('Please enter a review text.');
      return;
    }
    
    this.carpoolingService.addReview(reservationId, reviewTextValue).subscribe({
      next: (response) => {
        this.toastr.success('Review submitted successfully!');
        // Clear the review text
        this.reviewText[reservationId] = '';
        // Close the modal
        document.getElementById('closeReviewModal' + reservationId)?.click();
        // Refresh the reviews
        this.getMyReservations();
        this.getUserReviews();
        // Get the carpooling ID from the reservation to refresh its reviews
        const reservation = this.myReservations.find(r => r.reservation_id === reservationId);
        if (reservation && reservation.carpooling && reservation.carpooling.carpoolingId) {
          this.loadCarpoolingReviews(reservation.carpooling.carpoolingId);
        }
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.toastr.error('Failed to submit review.');
      }
    });
  }

  loadCarpoolingReviews(carpoolingId: number): void {
    this.carpoolingService.getCarpoolingReviews(carpoolingId).subscribe({
      next: (response) => {
        if (response && response.reviews) {
          this.carpoolingReviews[carpoolingId] = response.reviews;
        }
      },
      error: (error) => {
        console.error(`Error loading reviews for carpooling ${carpoolingId}:`, error);
      }
    });
  }

  getUserReviews(): void {
    this.carpoolingService.getUserReviews().subscribe({
      next: (response) => {
        if (response && response.reviews) {
          this.userReviews = response.reviews;
        }
      },
      error: (error) => {
        console.error('Error fetching user reviews:', error);
      }
    });
  }

  // Filtering, Sorting and Pagination Methods
  applyFilters(): void {
    const filters = this.filterForm.value;
    let baseList = this.viewMode === 'all' ? this.carpoolings : this.upcomingCarpoolings;
    
    this.filteredCarpoolings = baseList.filter(carpooling => {
      // Location filters
      if (filters.departureLocation && carpooling.departureLocation !== filters.departureLocation) {
        return false;
      }
      if (filters.destination && carpooling.destination !== filters.destination) {
        return false;
      }
      
      // Date filters
      if (filters.startDateFrom) {
        const startDateFrom = new Date(filters.startDateFrom);
        const carpoolingDate = new Date(carpooling.startTime);
        if (carpoolingDate < startDateFrom) return false;
      }
      
      if (filters.startDateTo) {
        const startDateTo = new Date(filters.startDateTo);
        const carpoolingDate = new Date(carpooling.startTime);
        if (carpoolingDate > startDateTo) return false;
      }
      
      // Price filters
      if (filters.minPrice !== null && carpooling.pricePerSeat < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && carpooling.pricePerSeat > filters.maxPrice) {
        return false;
      }
      
      // Vehicle type filter
      if (filters.vehicleType && carpooling.vehicleType !== filters.vehicleType) {
        return false;
      }
      
      // Amenities filters
      if (filters.wifi && carpooling.wifi !== 1) {
        return false;
      }
      if (filters.airConditioning && carpooling.airConditioning !== 1) {
        return false;
      }
      
      return true;
    });
    
    this.updatePagination();
  }

  resetFilters(): void {
    this.filterForm.reset({
      departureLocation: '',
      destination: '',
      startDateFrom: null,
      startDateTo: null,
      minPrice: null,
      maxPrice: null,
      vehicleType: '',
      wifi: false,
      airConditioning: false
    });
    // No need to call applyFilters as it will be triggered by valueChanges
  }

  sortCarpoolings(event: any): void {
    const target = event?.target as HTMLSelectElement;
    const sortByValue = target?.value || 'date_desc';
    
    this.filteredCarpoolings = this.carpoolingService.sortCarpoolings(
      this.filteredCarpoolings, 
      sortByValue as 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'rating_desc'
    );
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCarpoolings = this.filteredCarpoolings.slice(startIndex, endIndex);
  }

  toggleViewMode(mode: 'all' | 'upcoming'): void {
    this.viewMode = mode;
    this.applyFilters();
  }

  updateSelectedSeats(carpoolingId: number, seats: number): void {
    this.selectedSeats[carpoolingId] = seats;
    
    const carpooling = this.findCarpooling(carpoolingId);
    if (carpooling) {
      this.updateTotalPrice(carpooling);
    }
  }

  updateTotalPrice(carpooling: Carpooling): void {
    const seats = this.selectedSeats[carpooling.carpoolingId || 0] || 1;
    this.totalPrices[carpooling.carpoolingId || 0] = seats * (carpooling.pricePerSeat || 0);
  }

  private findCarpooling(carpoolingId: number): Carpooling | undefined {
    return this.carpoolings.find(c => c.carpoolingId === carpoolingId) || 
           this.upcomingCarpoolings.find(c => c.carpoolingId === carpoolingId);
  }

  // Time-related Helper Methods
  isInFuture(dateTime: string | Date): boolean {
    return new Date(dateTime).getTime() > this.now.getTime();
  }

  isStartingSoon(startTime: string | Date): boolean {
    if (!startTime) return false;
    
    const tripStartTime = new Date(startTime);
    const oneHourFromNow = new Date(this.now.getTime() + 60 * 60 * 1000);

    return tripStartTime > this.now && tripStartTime <= oneHourFromNow;
  }

  getTimeUntilStart(startTime: string | Date): string {
    if (!startTime) return '';
    
    const tripStartTime = new Date(startTime);
    const diffMs = tripStartTime.getTime() - this.now.getTime();

    if (diffMs <= 0) return '';

    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  }

  getAvailableSeatsArray(availableSeats: number): number[] {
    const maxSeats = Math.min(availableSeats || 0, 4);
    return Array(maxSeats).fill(0).map((_, i) => i + 1);
  }

  // Review Helper Methods
  getAverageRating(carpoolingId: number): number {
    const reviews = this.carpoolingReviews[carpoolingId];
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
    return sum / reviews.length;
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}