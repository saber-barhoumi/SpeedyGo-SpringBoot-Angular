import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockLoyaltyCardService {
  private loyaltyCards = [
    {
      id: '1',
      storeName: 'Store A',
      storeLogo: 'assets/store-a-logo.png',
      points: 120,
      status: 'Active',
      lastUsed: '2025-04-10',
      progress: 60
    },
    {
      id: '2',
      storeName: 'Store B',
      storeLogo: 'assets/store-b-logo.png',
      points: 80,
      status: 'Expired',
      lastUsed: '2025-03-15',
      progress: 40
    }
  ];

  getLoyaltyCards() {
    return this.loyaltyCards;
  }

  getLoyaltyCardById(id: string) {
    return this.loyaltyCards.find(card => card.id === id);
  }
}