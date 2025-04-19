import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { StatistiqueService } from '../../services/statistique.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-stat-dashboard',
  templateUrl: './stat-dashboard.component.html',
  styleUrls: ['./stat-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatDashboardComponent implements OnInit, OnDestroy {
  totalStores: number = 0;
  totalOffers: number = 0;
  offersByStore: { store: string, offers: number }[] = [];
  currentChartType: 'bar' | 'pie' = 'bar';
  isLoading: boolean = true;
  hasError: boolean = false;
  private subscription: Subscription | null = null;

  get offersByStoreChartData() {
    return this.offersByStore.map(item => ({
      name: item.store,
      value: item.offers
    }));
  }

  constructor(
    private statistiqueService: StatistiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.subscription = this.statistiqueService.getStatistics()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.totalStores = data.totalStores;
          this.totalOffers = data.totalOffers;
          this.offersByStore = data.offersByStore;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load statistics data', err);
          this.hasError = true;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setChartType(type: 'bar' | 'pie'): void {
    this.currentChartType = type;
    this.cdr.markForCheck();
  }

  isActive(type: 'bar' | 'pie'): boolean {
    return this.currentChartType === type;
  }

  // Fonction trackBy pour optimiser le rendu des listes
  trackByStoreName(index: number, item: any): string {
    return item.name;
  }
  
  // Rafraîchir les données
  refreshData(): void {
    this.statistiqueService.refreshData();
    this.loadData();
  }
}