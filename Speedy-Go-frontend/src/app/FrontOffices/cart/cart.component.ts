import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CartService } from 'src/app/services/cart/cart.service';
import { Offer } from 'src/app/FrontOffices/services/offres/offre.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [CurrencyPipe]
})
export class CartComponent implements OnInit, AfterViewChecked {
  cartItems: { offer: Offer; quantity: number }[] = [];
  totalPrice: number = 0;
  userId: number | null = null;
  userName: string = '';
  loading = true;
  error = false;
  isDarkMode: boolean = false;
  availableCurrencies: string[] = [];
  selectedCurrency: string = 'USD';
  currencySymbol: string = '$';
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  paymentError: string | null = null;
  paymentLoading = false;
  showPaymentForm = false;
  private shouldMountCard = false;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private currencyPipe: CurrencyPipe
  ) {}

  async ngOnInit(): Promise<void> {
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
    // Initialize Stripe
    this.stripe = await loadStripe('pk_test_51RKl0bRM6425ZGFPxxjxrSqkccmWcPVUgFAqWIUcQY4aghl07Gg6ZmtpYJ8iavzKFwHo0ASG5B2CKqR3PSng12OR00lA8EB9X3');
  }

  ngAfterViewChecked(): void {
    if (this.shouldMountCard && this.stripe && this.elements && !this.card) {
      const cardElement = document.getElementById('card-element');
      if (cardElement) {
        console.log('Mounting card element');
        this.card = this.elements.create('card', {
          style: {
            base: {
              color: this.isDarkMode ? '#f5f6fa' : '#2c3e50',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '16px',
              '::placeholder': {
                color: this.isDarkMode ? '#bdc3c7' : '#7f8c8d'
              }
            }
          }
        });
        this.card.mount('#card-element');
        this.shouldMountCard = false;
        this.cdr.detectChanges();
      } else {
        console.error('Card element not found in DOM');
      }
    }
  }

  loadUserData(): void {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.userId = userData.userId;
        this.userName = `${userData.firstName} ${userData.lastName}`;
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
          this.cartItems = items.map(item => ({
            offer: { ...item.offer, offre_id: item.offer.offre_id || item.offer.offre_id },
            quantity: item.quantity
          }));
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
        this.currencySymbol = '$';
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

  async initializePaymentForm(): Promise<void> {
    if (!this.stripe) {
      this.snackBar.open('Stripe not initialized', 'Close', { duration: 3000 });
      return;
    }
    this.showPaymentForm = true;
    this.elements = this.stripe.elements();
    this.shouldMountCard = true;
    this.cdr.detectChanges();
  }

  async payCart(): Promise<void> {
    if (this.userId === null || this.cartItems.length === 0) {
      this.snackBar.open('Cart is empty or user not logged in', 'Close', { duration: 3000 });
      return;
    }
    if (!this.stripe || !this.elements || !this.card) {
      this.snackBar.open('Payment system not initialized', 'Close', { duration: 3000 });
      return;
    }

    this.paymentLoading = true;
    this.paymentError = null;

    try {
      // Create Payment Intent
      const response = await firstValueFrom(
        this.http.post<{ clientSecret: string }>(
          'http://localhost:8084/payment/create-payment-intent',
          {
            items: this.cartItems,
            userId: this.userId,
            currency: this.selectedCurrency
          }
        )
      );

      if (!response || !response.clientSecret) {
        throw new Error('Failed to retrieve payment intent');
      }

      const { clientSecret } = response;

      // Confirm payment
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.userName || 'Customer Name'
          }
        }
      });

      if (result.error) {
        this.paymentError = result.error.message || 'Payment failed';
        this.snackBar.open(this.paymentError || 'Payment failed', 'Close', { duration: 5000 });
      } else if (result.paymentIntent.status === 'succeeded') {
        // Clear cart
        this.cartService.clearCart(this.userId).subscribe({
          next: () => {
            this.snackBar.open('Payment successful! Cart cleared.', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.showPaymentForm = false;
            this.loadCart();
          },
          error: (err) => {
            console.error('Error clearing cart', err);
            this.snackBar.open('Payment succeeded but failed to clear cart', 'Close', {
              duration: 3000
            });
          }
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.paymentError = error.message || 'An error occurred during payment';
      this.snackBar.open(this.paymentError || 'An error occurred during payment', 'Close', { duration: 5000 });
    } finally {
      this.paymentLoading = false;
    }
  }

  calculateFinalPrice(offer: Offer): number {
    const exchangeRate = this.cartService['exchangeRates'][this.selectedCurrency] || 1;
    const baseFinalPrice = offer.price - (offer.price * offer.discount / 100);
    return baseFinalPrice * exchangeRate;
  }

  formatCurrency(amount: number): string {
    return this.currencyPipe.transform(amount, this.selectedCurrency, 'symbol', '1.2-2') || `${this.currencySymbol}${amount.toFixed(2)}`;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    if (this.card) {
      this.card.update({
        style: {
          base: {
            color: this.isDarkMode ? '#f5f6fa' : '#2c3e50',
            '::placeholder': {
              color: this.isDarkMode ? '#bdc3c7' : '#7f8c8d'
            }
          }
        }
      });
    }
  }
}