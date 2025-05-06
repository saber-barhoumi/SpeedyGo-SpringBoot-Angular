import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-peak-hours-chart',
  templateUrl: './peak-hours-chart.component.html',
  styleUrls: ['./peak-hours-chart.component.scss']
})
export class PeakHoursChartComponent implements OnChanges {
  @Input() trips: SpecificTrip[] = [];
  @Input() timeType: 'departure' | 'arrival' = 'departure';

  // Chart data
  chartData: { name: string, series: { name: string, value: number }[] }[] = [];
  
  // Chart configuration
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Hour of Day';
  showYAxisLabel = true;
  yAxisLabel = 'Number of Trips';
  legendPosition: LegendPosition = LegendPosition.Below;
  
  colorScheme: Color = {
    name: 'tripColorScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['rgba(67, 97, 238, 1)']
  };

  // Peak hour statistics
  peakHour: number = 0;
  peakHourCount: number = 0;
  quietHour: number = 0;
  quietHourCount: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trips'] || changes['timeType']) {
      this.processChartData();
    }
  }

  processChartData(): void {
    if (!this.trips || this.trips.length === 0) {
      this.resetChart();
      return;
    }

    // Initialize hourly counters (0-23 hours)
    const hours = Array.from(Array(24).keys());
    const hourlyCounts = Array(24).fill(0);
    
    // Count trips by hour
    this.trips.forEach(trip => {
      const timeString = this.timeType === 'departure' ? trip.departureTime : trip.arrivalTime;
      if (timeString) {
        const hour = this.extractHourFromTimeString(timeString);
        if (hour >= 0 && hour < 24) {
          hourlyCounts[hour]++;
        }
      }
    });
    
    // Find peak and quiet hours
    this.peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
    this.peakHourCount = hourlyCounts[this.peakHour];
    
    // Find the quietest hour that isn't zero (if all are zero, default to 0)
    const nonZeroHours = hourlyCounts.map((count, idx) => ({ count, idx }))
                                    .filter(item => item.count > 0);
    
    if (nonZeroHours.length > 0) {
      const quietest = nonZeroHours.reduce((prev, curr) => 
        prev.count <= curr.count ? prev : curr
      );
      this.quietHour = quietest.idx;
      this.quietHourCount = quietest.count;
    } else {
      this.quietHour = 0;
      this.quietHourCount = 0;
    }
    
    // Format hour labels for display and create series data for the chart
    const seriesData = hours.map(hour => ({
      name: this.formatHourLabel(hour),
      value: hourlyCounts[hour]
    }));
    
    // Update chart data
    this.chartData = [{
      name: `${this.timeType === 'departure' ? 'Departure' : 'Arrival'} Trips`,
      series: seriesData
    }];
  }

  private extractHourFromTimeString(timeString: string): number {
    try {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 1) {
        return parseInt(timeParts[0], 10);
      }
    } catch (error) {
      console.error('Error parsing time string:', error);
    }
    return -1; // Invalid hour
  }

  private formatHourLabel(hour: number): string {
    if (hour === 0) {
      return '12 AM';
    } else if (hour < 12) {
      return `${hour} AM`;
    } else if (hour === 12) {
      return '12 PM';
    } else {
      return `${hour - 12} PM`;
    }
  }

  private resetChart(): void {
    this.chartData = [];
    this.peakHour = 0;
    this.peakHourCount = 0;
    this.quietHour = 0;
    this.quietHourCount = 0;
  }

  formatHourRange(hour: number): string {
    return `${this.formatHourLabel(hour)} - ${this.formatHourLabel((hour + 1) % 24)}`;
  }
}