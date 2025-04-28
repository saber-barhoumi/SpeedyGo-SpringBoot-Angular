export interface Trip {
    id: number;
    tripDate: string;
    destination: string;
    tripStatus: TripStatus;
    parcels: Parcel[];
    carpoolings: Carpooling[];
    carbonFootprints: CarbonFootprint[];
    feedbackAnalysis?: FeedbackAnalysis;
    smartRoute?: SmartRoute;
    vehicles: Vehicle[];
}