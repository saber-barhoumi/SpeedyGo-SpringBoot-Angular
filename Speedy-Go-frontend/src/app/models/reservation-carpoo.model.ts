export interface ReservationCarpoo {
    reservation_id: number;
    carpooling: {
      carpooling_id: number;
      departure_location: string;
      destination: string;
    };
    user_id: number;
  }