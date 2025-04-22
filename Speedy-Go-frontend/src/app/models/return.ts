export interface Returns {
    returnID?: number;
    retourstatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' ; // adapte selon ton enum
    reason_description: string;
    retourtype: 'RETURN' | 'EXCHANGE' | 'REFUND'; // adapte selon ton enum
    parcel?: {
      parcelID: number;
    };
    retourdate: Date;
  }
  