import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Offer } from 'src/app/FrontOffices/services/offres/offre.service'; // Adjust path as per your project structure

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: { offer: Offer; quantity: number; userId: number }[] = [];
  private exchangeRates: { [key: string]: number } = {
    USD: 1, // Base currency
    EUR: 0.85,
    GBP: 0.73,
    TND: 3.30 // Tunisian Dinar (approximate rate)
  };
  private currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    TND: 'TND' // Tunisian Dinar symbol
  };

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
    }
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  addToCart(offer: Offer, userId: number): Observable<void> {
    const existingItem = this.cartItems.find(
      item => item.offer.offre_id === offer.offre_id && item.userId === userId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({ offer, quantity: 1, userId });
    }

    this.saveCart();
    return of(void 0);
  }

  removeFromCart(offerId: number, userId: number): Observable<void> {
    this.cartItems = this.cartItems.filter(
      item => !(item.offer.offre_id === offerId && item.userId === userId)
    );
    this.saveCart();
    return of(void 0);
  }

  getCartItems(userId: number): Observable<{ offer: Offer; quantity: number }[]> {
    const userItems = this.cartItems.filter(item => item.userId === userId);
    return of(userItems);
  }

  getTotalPrice(userId: number, currency: string = 'USD'): Observable<number> {
    const userItems = this.cartItems.filter(item => item.userId === userId);
    const exchangeRate = this.exchangeRates[currency] || 1;
    const total = userItems.reduce((sum, item) => {
      const finalPrice = item.offer.price - (item.offer.price * item.offer.discount / 100);
      return sum + finalPrice * item.quantity * exchangeRate;
    }, 0);
    return of(total);
  }

  clearCart(userId: number): Observable<void> {
    this.cartItems = this.cartItems.filter(item => item.userId !== userId);
    this.saveCart();
    return of(void 0);
  }

  getAvailableCurrencies(): Observable<string[]> {
    return of(Object.keys(this.exchangeRates));
  }

  getCurrencySymbol(currency: string): Observable<string> {
    return of(this.currencySymbols[currency] || '$');
  }

  getExchangeRates(): Observable<{ [key: string]: number }> {
    return of(this.exchangeRates);
  }
}