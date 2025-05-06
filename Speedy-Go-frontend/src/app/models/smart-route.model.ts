export interface SmartRouteFeature {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][]; // Note : array of coordinate pairs
    };
    properties: {
      summary: {
        distance: number;  // in meters
        duration: number;  // in minutes
      };
      predicted_duration: number;  // in minutes
      traffic: 'LOW' | 'MEDIUM' | 'HIGH' | string;
    };
  }
  