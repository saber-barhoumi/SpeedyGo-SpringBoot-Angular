export interface Carpooling {
  carpoolingId?: number; // Optional, will be assigned by the backend
  driverName: string;
  departureLocation: string;
  destination: string;
  arrivalTime: string; // Ensure this matches the backend format (e.g., ISO string)
  availableSeats: number;
  pricePerSeat: number;
  description: string;
}