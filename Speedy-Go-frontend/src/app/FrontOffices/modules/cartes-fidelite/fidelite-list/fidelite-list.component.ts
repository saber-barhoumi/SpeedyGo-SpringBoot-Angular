import { Component, OnInit } from '@angular/core';
import { FideliteService } from '../services/fidelite.service';
import { PointFidelite } from '../models/fidelite.model';

@Component({
  selector: 'app-fidelite-list',
  templateUrl: './fidelite-list.component.html',
  styleUrls: ['./fidelite-list.component.scss']
})
export class FideliteListComponent implements OnInit {
  loyaltyCards: PointFidelite[] = [];
  loading = true;
  error = false;

  constructor(private fideliteService: FideliteService) {}

  ngOnInit(): void {
    this.loadFidelityCards();
  }

  loadFidelityCards(): void {
    // Get userId from localStorage
    const userId = Number(localStorage.getItem('userId')) || 0;
    
    this.loading = true;
    this.fideliteService.getAllFidelityCards(userId)
      .subscribe({
        next: (cards) => {
          this.loyaltyCards = cards;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching fidelity cards:', error);
          this.error = true;
          this.loading = false;
        }
      });
  }
}