export enum DeliveryType {
  INTERNATIONAL = 'INTERNATIONAL',
  LOCAL = 'LOCAL'
}

export interface DeliveryService {
  serviceId?: number;
  userId?: number;
  deliveryPersonName?: string;
  deliveryType: DeliveryType;
  countriesServed?: string[];
  acceptedGoodTypes?: string[];
  maxWeightPerOrder?: number;
  maxOrdersPerDay?: number;
  basePrice?: number;
  pricePerKg?: number;
  estimatedDeliveryDays?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Rating properties
  averageRating?: number;
  rating?: number;          // Average rating of the service
  ratingCount?: number;     // Number of ratings received
  userRating?: number;      // The current user's rating (if they've rated)
}