import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

@Component({
  selector: 'app-average-trip-duration',
  templateUrl: './average-trip-duration.component.html',
  styleUrls: ['./average-trip-duration.component.scss']
})
export class AverageTripDurationComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  
  // Duration statistics
  averageDurationHours: number = 0;
  averageDurationMinutes: number = 0;
  minDurationHours: number = 0;
  maxDurationHours: number = 0;
  
  // Format durations for display
  formattedAvgDuration: string = '0h 0m';
  formattedMinDuration: string = '0h 0m';
  formattedMaxDuration: string = '0h 0m';
  
  // Progress values for circular progress bars (0-100)
  durationProgress: number = 0;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips']) {
      this.calculateDurationStatistics();
    }
  }
  
  calculateDurationStatistics(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetStatistics();
      return;
    }
    
    // Filter trips that have both departure and arrival information
    const validTrips = this.trips.filter(trip => 
      trip.departureDate && trip.departureTime && 
      trip.arrivalDate && trip.arrivalTime
    );
    
    if (validTrips.length === 0) {
      this.resetStatistics();
      return;
    }
    
    // Calculate trip durations in hours
    const durations: number[] = validTrips.map(trip => {
      const departureDateTime = this.combineDateAndTime(trip.departureDate, trip.departureTime);
      const arrivalDateTime = this.combineDateAndTime(trip.arrivalDate, trip.arrivalTime);
      
      if (!departureDateTime || !arrivalDateTime) {
        return 0;
      }
      
      // Get duration in milliseconds and convert to hours
      const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
      return durationMs / (1000 * 60 * 60); // Convert to hours
    }).filter(duration => duration > 0); // Filter out invalid durations
    
    if (durations.length === 0) {
      this.resetStatistics();
      return;
    }
    
    // Calculate statistics
    this.averageDurationHours = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    this.minDurationHours = Math.min(...durations);
    this.maxDurationHours = Math.max(...durations);
    
    // Format for display
    this.formattedAvgDuration = this.formatDuration(this.averageDurationHours);
    this.formattedMinDuration = this.formatDuration(this.minDurationHours);
    this.formattedMaxDuration = this.formatDuration(this.maxDurationHours);
    
    // Calculate progress (as percentage of 24 hours)
    this.durationProgress = Math.min(100, (this.averageDurationHours / 24) * 100);
  }
  
  private combineDateAndTime(dateStr: string, timeStr: string): Date | null {
    if (!dateStr || !timeStr) {
      return null;
    }
    
    try {
      // Parse date and time
      const dateParts = dateStr.split('-').map(part => parseInt(part, 10));
      const timeParts = timeStr.split(':').map(part => parseInt(part, 10));
      
      if (dateParts.length < 3 || timeParts.length < 2) {
        return null;
      }
      
      // Create Date object (year, month-1, day, hours, minutes)
      return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
    } catch (error) {
      console.error('Error parsing date or time:', error);
      return null;
    }
  }
  
  private formatDuration(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }
  
  private resetStatistics(): void {
    this.averageDurationHours = 0;
    this.averageDurationMinutes = 0;
    this.minDurationHours = 0;
    this.maxDurationHours = 0;
    this.formattedAvgDuration = '0h 0m';
    this.formattedMinDuration = '0h 0m';
    this.formattedMaxDuration = '0h 0m';
    this.durationProgress = 0;
  }
}