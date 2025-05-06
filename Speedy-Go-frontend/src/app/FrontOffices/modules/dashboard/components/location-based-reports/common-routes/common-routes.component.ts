import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

interface RouteCount {
  departureLocation: string;
  arrivalLocation: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-common-routes',
  templateUrl: './common-routes.component.html',
  styleUrls: ['./common-routes.component.scss']
})
export class CommonRoutesComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  
  // Common routes
  commonRoutes: RouteCount[] = [];
  
  // Maximum route count (for percentage calculations)
  maxRouteCount = 0;
  
  // Number of top routes to display
  readonly topRoutesCount = 5;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips']) {
      this.processRouteData();
    }
  }
  
  processRouteData(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetData();
      return;
    }
    
    // Count routes (departure -> arrival combinations)
    const routeMap = new Map<string, RouteCount>();
    
    this.trips.forEach(trip => {
      if (trip.departureLocation && trip.arrivalLocation) {
        const departureLocation = trip.departureLocation.trim();
        const arrivalLocation = trip.arrivalLocation.trim();
        
        // Skip if departure and arrival are the same
        if (departureLocation === arrivalLocation) {
          return;
        }
        
        const routeKey = `${departureLocation}|${arrivalLocation}`;
        
        if (routeMap.has(routeKey)) {
          const route = routeMap.get(routeKey)!;
          route.count++;
        } else {
          routeMap.set(routeKey, {
            departureLocation,
            arrivalLocation,
            count: 1,
            percentage: 0
          });
        }
      }
    });
    
    // Sort and get top routes
    this.commonRoutes = Array.from(routeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, this.topRoutesCount);
    
    // Find maximum count for calculating percentages
    this.maxRouteCount = this.commonRoutes.length > 0 
      ? this.commonRoutes[0].count 
      : 0;
    
    // Calculate percentages
    this.commonRoutes.forEach(route => {
      route.percentage = this.maxRouteCount > 0 
        ? (route.count / this.maxRouteCount) * 100 
        : 0;
    });
  }
  
  private resetData(): void {
    this.commonRoutes = [];
    this.maxRouteCount = 0;
  }
}