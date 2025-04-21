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
  userId: number | null = null;

  constructor(private fideliteService: FideliteService) {}

  ngOnInit(): void {
    this.getUserIdFromLocalStorage();
    this.loadFidelityCards();
  }

  getUserIdFromLocalStorage(): void {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.userId = userData.userId;
        console.log('User ID successfully retrieved:', this.userId);
      } else {
        console.log('No user data found in localStorage');
        this.error = true;
      }
    } catch (error) {
      console.error('Error retrieving user data from localStorage:', error);
      this.error = true;
    }
  }

  loadFidelityCards(): void {
    this.loading = true;
    
    if (this.userId !== null) {
      this.fideliteService.getAllFidelityCards(this.userId)
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
    } else {
      console.error('User ID is null. Cannot fetch fidelity cards.');
      this.error = true;
      this.loading = false;
    }
  }
}