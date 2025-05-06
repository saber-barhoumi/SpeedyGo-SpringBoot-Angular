export interface SpecificTrip {
    id: number;
    tripDetails: string;
    departureLocation: string;
    arrivalLocation: string;
    passThroughLocation?: string; // New optional field for intermediate location
    size: number;
    description: string;
    departureDate: string;
    arrivalDate: string;
    departureTime: string;
    arrivalTime: string;
    parcelType: string;
    receiverFullName: string;
    receiverPhoneNumber: string;
    parcelDescription: string;
    parcelHeight: number;
    parcelWidth: number;
    parcelLength: number;
    photo: string;
    reservation: any;
    trip_status: string;
  }
  