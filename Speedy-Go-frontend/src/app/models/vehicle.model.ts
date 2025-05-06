export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  VAN = 'VAN',
  TRUCK = 'TRUCK',
  BICYCLE = 'BICYCLE',
  ELECTRIC_SCOOTER = 'ELECTRIC_SCOOTER'
}

export interface DeliveryVehicle {
  vehicleId?: number;
  brand: string;
  model: string;
  yearOfManufacture: number;
  licensePlate: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  maxLoadCapacity: number;
  hasRefrigeration: boolean;
  isInsured: boolean;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  vehiclePhotoPath?: string;
}