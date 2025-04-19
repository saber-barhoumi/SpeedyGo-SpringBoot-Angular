import { Component, OnInit } from '@angular/core';
import { OffersService, Offer } from 'src/app/FrontOffices/services/offres/offre.service';
import { ActivatedRoute } from '@angular/router';
import { FideliteService } from 'src/app/FrontOffices/modules/cartes-fidelite/services/fidelite.service';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.css']
})
export class OffresComponent implements OnInit {
  offers: Offer[] = [];
  loading = true;
  error = false;
  
  // Payment process variables
  selectedOffer: Offer | null = null;
  showPaymentModal = false;
  paymentStep = 1; // 1: Initial, 2: After form fill, 3: Success
  paymentProcessing = false;
  paymentSuccess = false;
  paymentError = false;

  constructor(
    private offersService: OffersService, 
    private route: ActivatedRoute,
    private fideliteService: FideliteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      this.offersService.getOffersByStoreId(+storeId).subscribe({
        next: (data) => {
          this.offers = data;
          this.loading = false;
          console.log('Offers loaded', data);
        },
        error: (err) => {
          console.error('Error loading offers', err);
          this.error = true;
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.error = true;
      console.error('No store ID found in the path');
    }
  }

  calculateFinalPrice(offer: Offer): number {
    return offer.price - (offer.price * offer.discount / 100);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  // Payment process methods
  openPaymentModal(offer: Offer): void {
    this.selectedOffer = offer;
    this.showPaymentModal = true;
    this.paymentStep = 1;
    this.paymentSuccess = false;
    this.paymentError = false;
  }
  
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedOffer = null;
    this.paymentStep = 1;
  }
  
  fillDummyPaymentForm(): void {
    // Simulate filling out the payment form
    this.paymentStep = 2;
  }
  
  processPayment(): void {
    if (!this.selectedOffer) return;
    
    this.paymentProcessing = true;
    
    // Simulate API call delay
    setTimeout(() => {
      this.paymentProcessing = false;
      this.paymentSuccess = true;
      this.paymentStep = 3;
      
      // Add loyalty points after successful payment
      this.addLoyaltyPoints();
    }, 1500);
  }
  
  addLoyaltyPoints(): void {
    if (!this.selectedOffer) return;
    
    const userId = localStorage.getItem('userId');
    const storeId = this.route.snapshot.paramMap.get('id');
    
    if (userId && storeId) {
      this.fideliteService.addFidelityPoints(+storeId, +userId).subscribe({
        next: (points) => {
          console.log(`Added ${points} loyalty points successfully`);
        },
        error: (err) => {
          console.error('Error adding loyalty points', err);
        }
      });
    } else {
      console.error('Missing user ID or store ID for loyalty points');
    }
  }
}
