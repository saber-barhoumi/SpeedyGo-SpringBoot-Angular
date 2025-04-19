import { Component, OnInit } from '@angular/core';
import { Modal } from 'bootstrap';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';
import { Router } from '@angular/router';
import { Trip } from '../model/trip';
import { TripService } from '../trip/trip.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  specificTrips: SpecificTrip[] = [];
  loading = true;
  error: string | null = null;
  tripToDelete: Trip | null = null;
  isDeleting = false;
  deleteModal: Modal | null = null;

  constructor(private tripService: TripService, private specificTripService: SpecificTripService, private router: Router) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  ngAfterViewInit(): void {
    // Initialize the modal
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      this.deleteModal = new Modal(modalElement);
    }
  }

  loadTrips(): void {
    this.loading = true;
    this.error = null;

    this.tripService.getTrips().subscribe({
      next: (data: Trip[]) => {
        this.trips = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching trips', err);
        this.error = 'Failed to load trips. Please try again later.';
        this.loading = false;
      }
    });

    this.loadSpecificTrips();
  }

  loadSpecificTrips(): void {
    this.specificTripService.getAllTrips().subscribe({
      next: (data: SpecificTrip[]) => {
        console.log('Specific trips loaded', data);
        this.specificTrips = data;
      },
      error: (err: any) => {
        console.error('Error fetching specific trips', err);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PLANNED':
        return 'bg-info';
      case 'IN_PROGRESS':
        return 'bg-warning';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  }

  confirmDelete(trip: Trip | SpecificTrip): void {
    if ('start_location' in trip && 'end_location' in trip && 'trip_date' in trip) {
      this.tripToDelete = trip;
      this.deleteModal?.show();
    } else {
      console.error('Invalid trip type for deletion');
    }
  }

  deleteTrip(): void {
    if (!this.tripToDelete || !this.tripToDelete.id) return;

    this.isDeleting = true;
    this.tripService.deleteTrip(this.tripToDelete.id).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.id !== this.tripToDelete?.id);
        this.isDeleting = false;
        this.deleteModal?.hide();
        this.tripToDelete = null;
      },
      error: (err: any) => {
        console.error('Error deleting trip', err);
        this.isDeleting = false;
        this.deleteModal?.hide();
        this.error = 'Failed to delete trip. Please try again later.';}
    });
  }

  viewSpecificTripDetails(id: number): void {
    this.router.navigate(['/specific-trip-detail', id]);
  }
}