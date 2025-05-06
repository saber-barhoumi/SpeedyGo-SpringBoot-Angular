import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

interface LocationCount {
  name: string;
  count: number;
}

@Component({
  selector: 'app-pass-through-locations',
  templateUrl: './pass-through-locations.component.html',
  styleUrls: ['./pass-through-locations.component.scss']
})
export class PassThroughLocationsComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  
  // Pass-through locations with counts
  passThroughLocations: LocationCount[] = [];
  
  // Statistics
  totalTripsWithPassThrough = 0;
  percentageTripsWithPassThrough = 0;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips']) {
      this.processPassThroughData();
    }
  }
  
  processPassThroughData(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetData();
      return;
    }
    
    // Count pass-through locations
    const locationMap = new Map<string, number>();
    let tripsWithPassThrough = 0;
    
    this.trips.forEach(trip => {
      if (trip.passThroughLocation) {
        const location = trip.passThroughLocation.trim();
        if (location) {
          locationMap.set(location, (locationMap.get(location) || 0) + 1);
          tripsWithPassThrough++;
        }
      }
    });
    
    // Sort locations by frequency
    this.passThroughLocations = Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    
    // Calculate statistics
    this.totalTripsWithPassThrough = tripsWithPassThrough;
    this.percentageTripsWithPassThrough = this.trips.length > 0 
      ? (tripsWithPassThrough / this.trips.length) * 100
      : 0;
  }
  
  private resetData(): void {
    this.passThroughLocations = [];
    this.totalTripsWithPassThrough = 0;
    this.percentageTripsWithPassThrough = 0;
  }
}