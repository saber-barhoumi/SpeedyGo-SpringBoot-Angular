export interface Carpooling {
  carpoolingId?: number;
  driverName: string;
  departureLocation: string;
  destination: string;
  arrivalTime: string | null; // أو string | Date | null
  availableSeats: number;
  pricePerSeat: number;
  description: string;
}