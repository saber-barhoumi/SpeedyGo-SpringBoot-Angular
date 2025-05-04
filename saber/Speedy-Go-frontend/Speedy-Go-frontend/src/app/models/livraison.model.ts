import { DeliveryVehicle } from './vehicle.model';

export enum LivraisonStatus {
  PENDING = 'PENDING',
  VEHICLE_ASSIGNED = 'VEHICLE_ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface Livraison {
  livraisonId?: number;
  title: string;
  description?: string;
  originAddress: string;
  destinationAddress: string;
  distanceInKm?: number;
  packageWeightKg?: number;
  requiresRefrigeration: boolean;
  packageDimensions?: string;
  scheduledPickupTime: string;
  scheduledDeliveryTime: string;
  actualDeliveryTime?: string;
  status?: LivraisonStatus;
  assignedVehicle?: DeliveryVehicle;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

// For AI suggestion response
export interface AiVehicleSuggestion {
    suggestedVehicleId?: number;
    suggestedVehicle?: DeliveryVehicle;
    message?: string;
    livraison?: Livraison;
  }
