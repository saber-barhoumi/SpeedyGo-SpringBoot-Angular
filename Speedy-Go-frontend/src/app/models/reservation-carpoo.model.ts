import { Carpooling } from './carpooling.model';
import { User } from './user.model';

export interface ReservationCarpoo {
  reservation_id: number;
  user_id?: number;
  carpooling_id?: number;
  seatsReserved: number;  // Added this property
  reservation_date?: Date;
  status?: string;
  carpooling: {
    carpoolingId?: number;
    departure_location: string;
    destination: string;
    start_time: Date;
    price_per_seat: number;
    availableSeats?: number;
    totalSeats?: number;
    driver_id?: number;
    vehicleType?: string;
    wifi?: number;
    airConditioning?: number;
  };
  user?: User;
  rating?: number;  // Added this property for storing rating
}