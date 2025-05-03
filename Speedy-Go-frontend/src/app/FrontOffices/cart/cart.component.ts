import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart/cart.service'; // Adjust path as needed
import { Offer } from 'src/app/FrontOffices/services/offres/offre.service'; // Adjust path as needed
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: { offer: Offer; quantity: number }[] = [];
  totalPrice: number = 0;
  userId: number | null = null;
  loading = true;
  error = false;
  isDarkMode: boolean = false;
  availableCurrencies: string[] = [];
  selectedCurrency: string = 'USD';
  currencySymbol: string = '$';

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadCurrencies();
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
    }
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      this.selectedCurrency = savedCurrency;
    }
  }

  loadUserData(): void {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.userId = userData.userId;
        this.loadCart();
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.handleUserNotLoggedIn();
      }
    } else {
      this.handleUserNotLoggedIn();
    }
  }

  private handleUserNotLoggedIn(): void {
    this.error = true;
    this.loading = false;
    this.snackBar.open('Please log in to view your cart', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/login']);
  }

  loadCurrencies(): void {
    this.cartService.getAvailableCurrencies().subscribe({
      next: (currencies) => {
        this.availableCurrencies = currencies;
        this.updateCurrencySymbol();
      },
      error: (err) => {
        console.error('Error fetching currencies', err);
        this.snackBar.open('Failed to load currencies', 'Close', { duration: 3000 });
      }
    });
  }

  loadCart(): void {
    if (this.userId !== null) {
      this.loading = true;
      this.cartService.getCartItems(this.userId).subscribe({
        next: (items) => {
          this.cartItems = items;
          this.updateTotalPrice();
        },
        error: (err) => {
          console.error('Error fetching cart items', err);
          this.error = true;
          this.loading = false;
        }
      });
    }
  }

  updateTotalPrice(): void {
    if (this.userId !== null) {
      this.cartService.getTotalPrice(this.userId, this.selectedCurrency).subscribe({
        next: (total) => {
          this.totalPrice = total;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching total price', err);
          this.error = true;
          this.loading = false;
        }
      });
    }
  }

  updateCurrencySymbol(): void {
    this.cartService.getCurrencySymbol(this.selectedCurrency).subscribe({
      next: (symbol) => {
        this.currencySymbol = symbol;
      },
      error: (err) => {
        console.error('Error fetching currency symbol', err);
        this.currencySymbol = '$'; // Fallback
      }
    });
  }

  changeCurrency(currency: string): void {
    this.selectedCurrency = currency;
    localStorage.setItem('selectedCurrency', currency);
    this.updateCurrencySymbol();
    this.updateTotalPrice();
  }

  removeFromCart(offerId: number): void {
    if (this.userId !== null) {
      this.cartService.removeFromCart(offerId, this.userId).subscribe({
        next: () => {
          this.snackBar.open('Item removed from cart', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadCart();
        },
        error: (err) => {
          console.error('Error removing item from cart', err);
          this.snackBar.open('Failed to remove item from cart', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  payCart(): void {
    if (this.userId !== null && this.cartItems.length > 0) {
      this.loading = true;
      setTimeout(() => {
        this.cartService.clearCart(this.userId!).subscribe({
          next: () => {
            this.snackBar.open('Payment successful! Cart cleared.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.loadCart();
          },
          error: (err) => {
            console.error('Error clearing cart', err);
            this.snackBar.open('Payment failed. Please try again.', 'Close', {
              duration: 3000
            });
            this.loading = false;
          }
        });
      }, 1500);
    } else {
      this.snackBar.open('Cart is empty or user not logged in', 'Close', {
        duration: 3000
      });
    }
  }

  calculateFinalPrice(offer: Offer): number {
    const exchangeRate = this.cartService['exchangeRates'][this.selectedCurrency] || 1;
    const baseFinalPrice = offer.price - (offer.price * offer.discount / 100);
    return baseFinalPrice * exchangeRate;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }
}