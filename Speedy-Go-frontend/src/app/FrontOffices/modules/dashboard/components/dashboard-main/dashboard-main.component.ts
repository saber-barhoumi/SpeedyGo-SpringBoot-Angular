import { Component, OnInit } from '@angular/core';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent implements OnInit {
  trips: SpecificTrip[] = [];
  loading = true;
  error: string | null = null;
  
  // Time frame filter for trips per period
  selectedTimeFrame: 'day' | 'week' | 'month' = 'month';

  // Filter for peak hours chart
  peakTimeType: 'departure' | 'arrival' = 'departure';

  constructor(private specificTripService: SpecificTripService) { }

  ngOnInit(): void {
    this.loadTripData();
  }

  loadTripData(): void {
    this.loading = true;
    this.specificTripService.getAllTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trip data:', err);
        this.error = 'Failed to load trip data. Please try again later.';
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadTripData();
  }

  onTimeFrameChange(timeFrame: 'day' | 'week' | 'month'): void {
    this.selectedTimeFrame = timeFrame;
  }

  onPeakTimeTypeChange(type: 'departure' | 'arrival'): void {
    this.peakTimeType = type;
  }
}