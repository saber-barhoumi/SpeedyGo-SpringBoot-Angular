// models/reservation-carpoo.model.ts
export interface ReservationCarpoo {
  reservation_id: number;
  carpooling: {
    carpooling_id: number;
    departure_location: string;
    destination: string;
    start_time?: string;
    price_per_seat?: number;
  };
  user_id: number;
}