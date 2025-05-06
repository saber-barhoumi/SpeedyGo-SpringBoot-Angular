import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';

@Component({
  selector: 'app-trips-per-period',
  templateUrl: './trips-per-period.component.html',
  styleUrls: ['./trips-per-period.component.scss']
})
export class TripsPerPeriodComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  @Input() timeFrame: 'day' | 'week' | 'month' = 'month';

  // Chart data
  chartData: { name: string, value: number }[] = [];
  
  // Chart configuration
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = 'Number of Trips';
  legendPosition: LegendPosition = LegendPosition.Below;
  
  colorScheme: Color = {
    name: 'tripColorScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['rgba(67, 97, 238, 0.7)']
  };

  // Summary data
  totalTrips = 0;
  averageTripsPerPeriod = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips'] || changes['timeFrame']) {
      this.processChartData();
    }
  }

  processChartData(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetChart();
      return;
    }

    // Process data based on time frame
    switch (this.timeFrame) {
      case 'day':
        this.processDailyData();
        this.xAxisLabel = 'Day';
        break;
      case 'week':
        this.processWeeklyData();
        this.xAxisLabel = 'Week';
        break;
      case 'month':
        this.processMonthlyData();
        this.xAxisLabel = 'Month';
        break;
    }

    // Calculate summary stats
    this.totalTrips = this.trips.length;
    this.averageTripsPerPeriod = this.chartData.length > 0 
      ? Math.round(this.totalTrips / this.chartData.length * 10) / 10
      : 0;
  }

  private processDailyData(): void {
    // Group trips by day (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dateLabels: string[] = [];
    const tripCounts: number[] = [];
    
    // Generate labels for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - 29 + i);
      const formattedDate = this.formatDate(date);
      dateLabels.push(formattedDate);
      tripCounts.push(0);
    }
    
    // Count trips for each day
    this.trips.forEach(trip => {
      const tripDate = new Date(trip.departureDate);
      if (tripDate >= thirtyDaysAgo && tripDate <= today) {
        const formattedTripDate = this.formatDate(tripDate);
        const index = dateLabels.indexOf(formattedTripDate);
        if (index !== -1) {
          tripCounts[index]++;
        }
      }
    });
    
    // Update chart data
    this.chartData = dateLabels.map((label, index) => ({
      name: label,
      value: tripCounts[index]
    }));
  }

  private processWeeklyData(): void {
    // Group trips by week (last 12 weeks)
    const now = new Date();
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(now.getDate() - 84); // 12 weeks * 7 days
    
    const weekLabels: string[] = [];
    const tripCounts: number[] = [];
    
    // Generate labels for last 12 weeks
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - 84 + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const label = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
      weekLabels.push(label);
      tripCounts.push(0);
    }
    
    // Count trips for each week
    this.trips.forEach(trip => {
      const tripDate = new Date(trip.departureDate);
      if (tripDate >= twelveWeeksAgo && tripDate <= now) {
        // Find which week this trip belongs to
        for (let i = 0; i < 12; i++) {
          const weekStart = new Date();
          weekStart.setDate(now.getDate() - 84 + (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          if (tripDate >= weekStart && tripDate <= weekEnd) {
            tripCounts[i]++;
            break;
          }
        }
      }
    });
    
    // Update chart data
    this.chartData = weekLabels.map((label, index) => ({
      name: label,
      value: tripCounts[index]
    }));
  }

  private processMonthlyData(): void {
    // Group trips by month (last 12 months)
    const monthLabels = [];
    const tripCounts: number[] = [];
    
    const today = new Date();
    
    // Generate labels for last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date();
      month.setMonth(today.getMonth() - i);
      const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthLabels.push(monthName);
      tripCounts.push(0);
    }
    
    // Count trips for each month
    this.trips.forEach(trip => {
      const tripDate = new Date(trip.departureDate);
      const monthsAgo = (today.getFullYear() - tripDate.getFullYear()) * 12 + 
                        (today.getMonth() - tripDate.getMonth());
      
      if (monthsAgo >= 0 && monthsAgo < 12) {
        const index = 11 - monthsAgo;
        tripCounts[index]++;
      }
    });
    
    // Update chart data
    this.chartData = monthLabels.map((label, index) => ({
      name: label,
      value: tripCounts[index]
    }));
  }

  private resetChart(): void {
    this.chartData = [];
    this.totalTrips = 0;
    this.averageTripsPerPeriod = 0;
  }

  private formatDate(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}