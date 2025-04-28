export interface Parcel {
    parcelId: number;
    parcelName: string;
    deliveryAddress: string;
    currentLocation: string;
    weight: number;
    parcelstatus: ParcelStatus;
    trip: Trip;
    offre: Offers;
  }