import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts'; 
@Component({
  selector: 'app-offers-by-store-chart',
  templateUrl: './offers-by-store-chart.component.html',
  styleUrls: ['./offers-by-store-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersByStoreChartComponent implements OnChanges {
    LegendPosition = LegendPosition; // Add this line to define LegendPosition

  @Input() data: { name: string, value: number }[] = [];
  @Input() chartType: 'bar' | 'pie' = 'bar';
  
  // Color scheme for the chart
  colorScheme: string = 'cool';
  
  view: [number, number] = [700, 400];
  
  ngOnChanges(): void {
    // Adjust view dimensions based on chart type
    if (this.chartType === 'pie') {
      this.view = [700, 400];
    } else {
      this.view = [700, 400];
    }
  }
}