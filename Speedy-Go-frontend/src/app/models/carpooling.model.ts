export interface Carpooling {
  carpoolingId?: number;
  userId?: number;
  departureLocation: string;
  destination: string;
  arrivalTime?: Date;
  availableSeats: number;
  pricePerSeat: number;
  description?: string;
  distanceKm: number;
  durationMinutes: number;
  vehicleType: string;
  fuelType: string;
  wifi?: number;
  airConditioning?: number;
  weatherType?: string;
  status?: string;
}