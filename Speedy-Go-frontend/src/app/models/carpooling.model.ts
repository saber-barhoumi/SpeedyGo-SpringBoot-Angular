// models/carpooling.model.ts
export interface Carpooling {
  carpoolingId?: number;
  userId?: number;
  departureLocation: string;
  destination: string;
  startTime: Date | string; // Add startTime field
  arrivalTime?: Date | string;
  availableSeats: number;
  pricePerSeat: number;
  description?: string;
  distanceKm: number;
  durationMinutes: number;
  vehicleType: string;
  fuelType: string;
  wifi?: number;
  airConditioning?: number;
  status?: string;
  weatherType?: string;
  reservationCarpoos?: any[];
}