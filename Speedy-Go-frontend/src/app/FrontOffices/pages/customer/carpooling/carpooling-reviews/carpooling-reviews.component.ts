import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { CarpoolingReview } from 'src/app/models/carpooling-review.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-carpooling-reviews',
  templateUrl: './carpooling-reviews.component.html',
  styleUrls: ['./carpooling-reviews.component.scss']
})
export class CarpoolingReviewsComponent implements OnInit {
  userReviews: CarpoolingReview[] = [];
  statistics: any = {};
  isLoading: boolean = false;
  reviewFilter: 'all' | 'given' | 'received' = 'all';

  constructor(
    private carpoolingService: CarpoolingService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadUserReviews();
    this.loadStatistics();
  }

  loadUserReviews(): void {
    this.isLoading = true;
    this.carpoolingService.getUserReviews().subscribe({
      next: (response) => {
        if (response && response.reviews) {
          this.userReviews = response.reviews;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user reviews:', error);
        this.toastr.error('Failed to load reviews.');
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.carpoolingService.getReviewStatistics().subscribe({
      next: (response) => {
        this.statistics = response || {};
      },
      error: (error) => {
        console.error('Error fetching review statistics:', error);
      }
    });
  }

  filterReviews(filter: 'all' | 'given' | 'received'): void {
    this.reviewFilter = filter;
  }

  getFilteredReviews(): CarpoolingReview[] {
    switch (this.reviewFilter) {
      case 'given':
        return this.userReviews.filter(review => review.reviewText);
      case 'received':
        // In a real implementation, you might need to filter by carpoolings created by the user
        return [];
      default:
        return this.userReviews;
    }
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getAverageRating(): number {
    if (!this.userReviews || this.userReviews.length === 0) return 0;
    
    const reviews = this.userReviews.filter(r => r.rating !== undefined && r.rating !== null);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
    return sum / reviews.length;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}