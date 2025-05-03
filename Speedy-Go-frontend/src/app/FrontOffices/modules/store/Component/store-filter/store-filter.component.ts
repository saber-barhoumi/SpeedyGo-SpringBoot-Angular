// src/app/components/store-filter/store-filter.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { StoreType } from '../../store/model/store';

@Component({
  selector: 'app-store-filter',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule],
  template: `
    <div class="bg-white p-4 rounded shadow-sm mb-4">
      <h2 class="text-lg font-medium mb-2">Filter by Type</h2>
      <mat-button-toggle-group (change)="onFilterChange($event.value)" #group="matButtonToggleGroup">
        <mat-button-toggle value="">All</mat-button-toggle>
        <mat-button-toggle value="SHOP">Shop</mat-button-toggle>
        <mat-button-toggle value="RESORT">Resort</mat-button-toggle>
        <mat-button-toggle value="CAFE">Cafe</mat-button-toggle>
        <mat-button-toggle value="ELECTRONICS">Electronics</mat-button-toggle>
        <mat-button-toggle value="CLUB">Club</mat-button-toggle>
        <mat-button-toggle value="OTHERS">Others</mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [`
    mat-button-toggle-group {
      flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
      mat-button-toggle {
        flex: 1 0 30%;
      }
    }
  `]
})
export class StoreFilterComponent {
  @Output() filterChange = new EventEmitter<StoreType | null>();
  
  onFilterChange(value: string): void {
    if (!value) {
      this.filterChange.emit(null);
    } else {
      this.filterChange.emit(value as StoreType);
    }
  }
}