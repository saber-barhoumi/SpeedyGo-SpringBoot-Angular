// src/app/models/delivery-order.model.ts
export enum OrderStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    REJECTED = 'REJECTED',
    CANCELED = 'CANCELED'
  }
  
  export interface DeliveryOrder {
    orderId: number;
    customerId: number;
    serviceId: number;
    serviceName?: string;
    deliveryPersonId?: number;
    deliveryPersonName?: string;
    status: OrderStatus;
    statusReason?: string;
    rating?: number;

    // Package details
    packageWeight: number;
    packageDescription: string;
    packageValue?: number;
    packagePhotos?: string[];
    
    // Shipping details
    sourceAddress: string;
    sourceCity: string;
    sourceCountry: string;
    sourcePostalCode?: string;
    
    destinationAddress: string;
    destinationCity: string;
    destinationCountry: string;
    destinationPostalCode?: string;
    
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
    
    // Payment and tracking
    trackingNumber?: string;
    totalPrice: number;
    estimatedDeliveryDate?: Date;
    
    // Timestamps
    createdAt?: Date; // Change Date to Date | undefined
    updatedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;

     // Rating properties
  ratingCount?: number;     // Number of ratings received
  userRating?: number;      // The current user's rating (if they've rated)
  }