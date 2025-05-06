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
  invoicePdfUrl: string | null = null;
  parcelIds: number[] = [];
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
        if (!this.userId) {
          console.error('userId not found or invalid in user data');
          this.handleUserNotLoggedIn();
          return;
        }
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
    this.snackBar.open('Veuillez vous connecter pour voir votre panier', 'Fermer', {
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
        console.error('Erreur lors du chargement des devises', err);
        this.snackBar.open('Échec du chargement des devises', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadCart(): void {
    if (this.userId !== null) {
      this.loading = true;
      this.cartService.getCartItems(this.userId).subscribe({
        next: (items) => {
          this.cartItems = items
            .filter(item => item.offer && item.offer.offre_id)
            .map(item => ({
              offer: { ...item.offer, offre_id: item.offer.offre_id },
              quantity: item.quantity
            }));
          console.log('Loaded cart items:', JSON.stringify(this.cartItems, null, 2));
          this.updateTotalPrice();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des articles du panier', err);
          this.error = true;
          this.loading = false;
          this.snackBar.open('Échec du chargement du panier', 'Fermer', { duration: 3000 });
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
          console.error('Erreur lors du calcul du prix total', err);
          this.error = true;
          this.loading = false;
          this.snackBar.open('Échec du calcul du prix total', 'Fermer', { duration: 3000 });
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
        console.error('Erreur lors du chargement du symbole de devise', err);
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
    if (this.userId !== null && offerId) {
      this.cartService.removeFromCart(offerId, this.userId).subscribe({
        next: () => {
          this.snackBar.open('Article retiré du panier', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadCart();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'article', err);
          this.snackBar.open('Échec de la suppression de l\'article', 'Fermer', {
            duration: 3000
          });
        }
      });
    } else {
      this.snackBar.open('Erreur : ID de l\'offre invalide', 'Fermer', { duration: 3000 });
    }
  }

  async initializePaymentForm(): Promise<void> {
    if (!this.stripe) {
      this.snackBar.open('Stripe non initialisé', 'Fermer', { duration: 3000 });
      return;
    }
    this.showPaymentForm = true;
    this.elements = this.stripe.elements();
    this.shouldMountCard = true;
    this.cdr.detectChanges();
  }

  async payCart(): Promise<void> {
    if (this.userId == null || this.cartItems.length === 0) {
      this.snackBar.open('Le panier est vide ou l\'utilisateur n\'est pas connecté', 'Fermer', { duration: 3000 });
      return;
    }
    if (!this.stripe || !this.elements || !this.card) {
      this.snackBar.open('Système de paiement non initialisé', 'Fermer', { duration: 3000 });
      return;
    }

    this.paymentLoading = true;
    this.paymentError = null;

    try {
      const paymentRequest = {
        items: this.cartItems.map(item => ({
          offer: {
            offre_id: item.offer.offre_id,
            price: item.offer.price,
            discount: item.offer.discount || 0,
            title: item.offer.title,
            description: item.offer.description,
            image: item.offer.image,
            category: item.offer.category,
            date_start: item.offer.date_start,
            store_name: item.offer.store_name,
            available: item.offer.available
          },
          quantity: item.quantity
        })),
        userId: this.userId,
        currency: this.selectedCurrency
      };

      console.log('Sending payment request to create-payment-intent:', JSON.stringify(paymentRequest, null, 2));

      const response = await firstValueFrom(
        this.http.post<{ clientSecret: string, paymentIntentId: string }>(
          'http://localhost:8084/payment/create-payment-intent',
          paymentRequest
        )
      );

      console.log('Received create-payment-intent response:', JSON.stringify(response, null, 2));

      if (!response || !response.clientSecret || !response.paymentIntentId) {
        throw new Error('Réponse invalide de create-payment-intent : clientSecret ou paymentIntentId manquant');
      }

      const { clientSecret, paymentIntentId } = response;

      if (typeof paymentIntentId !== 'string' || paymentIntentId.trim() === '') {
        throw new Error(`paymentIntentId invalide : ${paymentIntentId}`);
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.userName || 'Client'
          }
        }
      });

      if (result.error) {
        this.paymentError = result.error.message || 'Échec du paiement';
        this.snackBar.open(this.paymentError ?? 'Échec du paiement', 'Fermer', { duration: 5000 });
      } else if (result.paymentIntent.status === 'succeeded') {
        const confirmPayload = {
          paymentIntentId,
          items: this.cartItems.map(item => ({
            offer: {
              offre_id: item.offer.offre_id,
              price: item.offer.price,
              discount: item.offer.discount || 0,
              title: item.offer.title,
              description: item.offer.description,
              image: item.offer.image,
              category: item.offer.category,
              date_start: item.offer.date_start,
              store_name: item.offer.store_name,
              available: item.offer.available
            },
            quantity: item.quantity
          })),
          userId: this.userId,
          currency: this.selectedCurrency
        };

        console.log('Sending confirm-payment request:', JSON.stringify(confirmPayload, null, 2));

        let confirmResponse;
        try {
          confirmResponse = await firstValueFrom(
            this.http.post<{ status: string, error?: string, invoicePdfUrl: string, parcelIds: number[] }>(
              'http://localhost:8084/payment/confirm-payment',
              confirmPayload,
              { headers: { 'Content-Type': 'application/json' } }
            )
          );
        } catch (error: any) {
          console.error('Confirm payment error response:', JSON.stringify(error.error, null, 2));
          throw error;
        }

        console.log('Received confirm-payment response:', JSON.stringify(confirmResponse, null, 2));

        if (confirmResponse.status !== 'success') {
          throw new Error(confirmResponse.error || 'Échec de l\'enregistrement du paiement');
        }

        this.invoicePdfUrl = confirmResponse.invoicePdfUrl;
        this.parcelIds = confirmResponse.parcelIds || [];
        this.showPaymentForm = false;
        this.snackBar.open('Paiement réussi ! Téléchargez votre facture ci-dessous.', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    } catch (error: any) {
      console.error('Payment error:', {
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });
      this.paymentError = error.message || 'Une erreur est survenue lors du paiement';
      this.snackBar.open(this.paymentError ?? 'Une erreur est survenue lors du paiement', 'Fermer', { duration: 5000 });
    } finally {
      this.paymentLoading = false;
      this.cdr.detectChanges();
    }
  }

  clearCartAfterInvoice(): void {
    if (this.userId !== null) {
      this.cartService.clearCart(this.userId).subscribe({
        next: () => {
          this.cartItems = [];
          this.totalPrice = 0;
          this.invoicePdfUrl = null;
          this.snackBar.open('Panier vidé', 'Fermer', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadCart();
          this.router.navigate(['/ajout_trip']);
        },
        error: (err) => {
          console.error('Erreur lors de la vidange du panier', err);
          this.snackBar.open('Échec de la vidange du panier', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  calculateFinalPrice(offer: Offer): number {
    const exchangeRate = this.cartService['exchangeRates'][this.selectedCurrency] || 1;
    const baseFinalPrice = offer.price - (offer.price * (offer.discount || 0) / 100);
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

  openInvoice(): void {
    if (this.invoicePdfUrl) {
      window.open(this.invoicePdfUrl, '_blank');
      this.clearCartAfterInvoice();
    }
  }
}