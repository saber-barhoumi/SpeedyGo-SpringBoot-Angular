import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Import NgxChartsModule for charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Dashboard Components
import { DashboardMainComponent } from './components/dashboard-main/dashboard-main.component';
import { TripsPerPeriodComponent } from './components/time-based-reports/trips-per-period/trips-per-period.component';
import { AverageTripDurationComponent } from './components/time-based-reports/average-trip-duration/average-trip-duration.component';
import { PeakHoursChartComponent } from './components/time-based-reports/peak-hours-chart/peak-hours-chart.component';
import { TopLocationsComponent } from './components/location-based-reports/top-locations/top-locations.component';
import { CommonRoutesComponent } from './components/location-based-reports/common-routes/common-routes.component';
import { PassThroughLocationsComponent } from './components/location-based-reports/pass-through-locations/pass-through-locations.component';

// Dashboard Routes
const routes: Routes = [
  { path: '', component: DashboardMainComponent },
];
@NgModule({
  declarations: [
    DashboardMainComponent,
    TripsPerPeriodComponent,
    AverageTripDurationComponent,
    PeakHoursChartComponent,
    TopLocationsComponent,
    CommonRoutesComponent,
    PassThroughLocationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgxChartsModule
  ],
  exports: [
    DashboardMainComponent
  ]
})
export class DashboardModule { }
