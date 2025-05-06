import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

interface LocationCount {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-top-locations',
  templateUrl: './top-locations.component.html',
  styleUrls: ['./top-locations.component.scss']
})
export class TopLocationsComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  
  // Top locations
  topDepartureLocations: LocationCount[] = [];
  topArrivalLocations: LocationCount[] = [];
  
  // Maximum location count (for percentage calculations)
  maxDepartureCount = 0;
  maxArrivalCount = 0;
  
  // Number of top locations to display
  readonly topLocationsCount = 5;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips']) {
      this.processLocationData();
    }
  }
  
  processLocationData(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetData();
      return;
    }
    
    // Count departure locations
    const departureLocationMap = new Map<string, number>();
    this.trips.forEach(trip => {
      if (trip.departureLocation) {
        const location = trip.departureLocation.trim();
        departureLocationMap.set(location, (departureLocationMap.get(location) || 0) + 1);
      }
    });
    
    // Count arrival locations
    const arrivalLocationMap = new Map<string, number>();
    this.trips.forEach(trip => {
      if (trip.arrivalLocation) {
        const location = trip.arrivalLocation.trim();
        arrivalLocationMap.set(location, (arrivalLocationMap.get(location) || 0) + 1);
      }
    });
    
    // Sort and get top departure locations
    this.topDepartureLocations = Array.from(departureLocationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.topLocationsCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: 0 // Will calculate after finding max
      }));
    
    // Sort and get top arrival locations
    this.topArrivalLocations = Array.from(arrivalLocationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.topLocationsCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: 0 // Will calculate after finding max
      }));
    
    // Find maximum counts for calculating percentages
    this.maxDepartureCount = this.topDepartureLocations.length > 0 
      ? this.topDepartureLocations[0].count 
      : 0;
      
    this.maxArrivalCount = this.topArrivalLocations.length > 0 
      ? this.topArrivalLocations[0].count 
      : 0;
    
    // Calculate percentages
    this.topDepartureLocations.forEach(location => {
      location.percentage = this.maxDepartureCount > 0 
        ? (location.count / this.maxDepartureCount) * 100 
        : 0;
    });
    
    this.topArrivalLocations.forEach(location => {
      location.percentage = this.maxArrivalCount > 0 
        ? (location.count / this.maxArrivalCount) * 100 
        : 0;
    });
  }
  
  private resetData(): void {
    this.topDepartureLocations = [];
    this.topArrivalLocations = [];
    this.maxDepartureCount = 0;
    this.maxArrivalCount = 0;
  }
}