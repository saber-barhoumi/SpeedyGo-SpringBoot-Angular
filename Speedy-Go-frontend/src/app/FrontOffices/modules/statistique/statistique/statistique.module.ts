import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatDashboardComponent } from './components/stat-dashboard/stat-dashboard.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { OffersByStoreChartComponent } from './components/offers-by-store-chart/offers-by-store-chart.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StatistiqueService } from './services/statistique.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

const routes: Routes = [
  { path: '', component: StatDashboardComponent }
];

@NgModule({
  declarations: [
    StatDashboardComponent,
    StatCardComponent,
    OffersByStoreChartComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    NgxChartsModule
  ],
  providers: [StatistiqueService]
})
export class StatistiqueModule { }
