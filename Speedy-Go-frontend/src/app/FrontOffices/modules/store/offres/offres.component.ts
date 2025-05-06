import { Component, OnInit } from '@angular/core';
import { OffersService, Offer, Comment, CommentRequest } from 'src/app/FrontOffices/services/offres/offre.service';
import { ActivatedRoute } from '@angular/router';
import { FideliteService } from 'src/app/FrontOffices/modules/cartes-fidelite/services/fidelite.service';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CartService } from 'src/app/services/cart/cart.service'; // New import
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.css'],
  animations: [
    trigger('commentAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('300ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ]),
    trigger('commentEntryAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OffresComponent implements OnInit {
  offers: Offer[] = [];
  loading = true;
  error = false;
  
  // Payment process variables
  selectedOffer: Offer | null = null;
  showPaymentModal = false;
  paymentStep = 1;
  paymentProcessing = false;
  paymentSuccess = false;
  paymentError = false;
  userId: number | null = null;
  isDarkMode: boolean = false;
  favoriteOffers: number[] = [];

  // Comments-related variables
  commentForm: FormGroup;
  offerComments: { [key: number]: Comment[] } = {};
  loadingComments: { [key: number]: boolean } = {};
  commentError: { [key: number]: boolean } = {};
  showComments: { [key: number]: boolean } = {};
  submittingComment = false;
  userName: string = '';

  // User details
  firstName: string = '';
  lastName: string = '';

  constructor(
    private snackBar: MatSnackBar,
    private offersService: OffersService, 
    private route: ActivatedRoute,
    private fideliteService: FideliteService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cartService: CartService // Inject CartService
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadOffers();
    this.loadUserData();
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
    }
    
    const savedFavorites = localStorage.getItem('favoriteOffers');
    if (savedFavorites) {
      this.favoriteOffers = JSON.parse(savedFavorites);
    }
  }

  loadUserData(): void {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.userId = userData.userId;
        this.firstName = userData.firstName || '';
        this.lastName = userData.lastName || '';
        if (!this.firstName) {
          this.firstName = userData.first_name || userData.firstname || '';
        }
        if (!this.lastName) {
          this.lastName = userData.last_name || userData.lastname || '';
        }
        this.userName = this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : userData.username || 'Anonymous User';
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }

  loadOffers(): void {
    this.loading = true;
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      this.offersService.getOffersByStoreId(+storeId).subscribe({
        next: (data) => {
          this.offers = data;
          this.loading = false;
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
    this.paymentStep = 2;
  }

  processPayment(): void {
    if (!this.selectedOffer) return;
    this.paymentProcessing = true;
    setTimeout(() => {
      this.paymentProcessing = false;
      this.paymentSuccess = true;
      this.paymentStep = 3;
      this.addLoyaltyPoints();
    }, 1500);
  }

  addLoyaltyPoints(): void {
    if (!this.selectedOffer) return;
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const userId = userData.userId;
    }
    const storeId = this.route.snapshot.paramMap.get('id');
    if (this.userId && storeId) {
      this.fideliteService.addFidelityPoints(+storeId, +this.userId).subscribe({
        next: (points) => {
          console.log(`Added ${points} loyalty points successfully`);
        },
        error: (err) => {
          console.error('Error adding loyalty points', err);
        }
      });
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  toggleFavorites(): void {
    if (this.favoriteOffers.length > 0 && this.offers.length !== this.favoriteOffers.length) {
      const originalOffers = [...this.offers];
      this.offers = this.offers.filter(offer => this.favoriteOffers.includes(offer.offre_id));
      sessionStorage.setItem('originalOffers', JSON.stringify(originalOffers));
    } else {
      const originalOffersJson = sessionStorage.getItem('originalOffers');
      if (originalOffersJson) {
        this.offers = JSON.parse(originalOffersJson);
        sessionStorage.removeItem('originalOffers');
      }
    }
  }

  addToFavorites(offerId: number): void {
    if (!this.favoriteOffers.includes(offerId)) {
      this.favoriteOffers.push(offerId);
      localStorage.setItem('favoriteOffers', JSON.stringify(this.favoriteOffers));
    }
  }

  removeFromFavorites(offerId: number): void {
    this.favoriteOffers = this.favoriteOffers.filter(id => id !== offerId);
    localStorage.setItem('favoriteOffers', JSON.stringify(this.favoriteOffers));
  }

  isFavorite(offerId: number): boolean {
    return this.favoriteOffers.includes(offerId);
  }

  // New method to add offer to cart
  addToCart(offer: Offer): void {
    if (this.userId) {
      this.cartService.addToCart(offer, this.userId).subscribe({
        next: () => {
          this.snackBar.open(`Offer ${offer.title} added to cart`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        },
        error: (err) => {
          console.error('Error adding to cart', err);
          this.snackBar.open('Failed to add to cart', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please log in to add to cart', 'Close', { duration: 3000 });
    }
  }

  toggleComments(offerId: number): void {
    if (!this.showComments[offerId]) {
      this.loadComments(offerId);
    }
    this.showComments[offerId] = !this.showComments[offerId];
  }

  loadComments(offerId: number): void {
    if (this.offerComments[offerId] || this.loadingComments[offerId]) {
      return;
    }
    this.loadingComments[offerId] = true;
    this.commentError[offerId] = false;
    this.offersService.getCommentsByOfferId(offerId).subscribe({
      next: (comments) => {
        this.offerComments[offerId] = comments;
        this.loadingComments[offerId] = false;
      },
      error: (err) => {
        console.error(`Error loading comments for offer ${offerId}`, err);
        this.commentError[offerId] = true;
        this.loadingComments[offerId] = false;
      }
    });
  }

  submitComment(offerId: number): void {
    if (this.commentForm.invalid || !this.userId || this.submittingComment) {
      return;
    }
    const commentText = this.commentForm.get('commentText')?.value;
    this.submittingComment = true;
    const commentRequest: CommentRequest = {
      text: commentText,
      userName: this.userName
    };
    this.offersService.addComment(offerId, this.userId, commentRequest, this.userName).subscribe({
      next: (newComment) => {
        if (!this.offerComments[offerId]) {
          this.offerComments[offerId] = [];
        }
        this.offerComments[offerId].unshift(newComment);
        this.commentForm.reset();
        this.submittingComment = false;
      },
      error: (err) => {
        console.error('Error submitting comment', err);
        this.submittingComment = false;
      }
    });
  }

  formatCommentDate(dateString: string | any[]): string {
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute, second] = dateString;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return this.formatRelativeTime(date);
    } else if (dateString) {
      const date = new Date(dateString);
      return this.formatRelativeTime(date);
    }
    return 'Unknown date';
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  getCommentUserName(comment: Comment): string {
    return comment.username || comment.userName || 'Anonymous';
  }
}