export interface Trip {
    id?: number;
    departure_city: string;
    arrival_city: string;
    distance_km: number;
    duration_minutes: number;
    vehicle_type: string;
    fuel_type: string;
    price: number;
    wifi: number;
    air_conditioning: number;
    weather_type: string;
  }