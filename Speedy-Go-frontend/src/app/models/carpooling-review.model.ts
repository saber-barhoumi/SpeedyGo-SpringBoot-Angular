export interface CarpoolingReview {
    reviewId?: number;
    reservationId: number;
    userId: number;
    rating?: number;
    reviewText?: string;
    createdAt?: Date;
    userName?: string; // To display who wrote the review
    carpoolingId?: number; // For easier access
    userProfileImage?: string; // Optional - for showing user avatar with reviews
  }