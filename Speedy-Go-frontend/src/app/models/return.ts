// Enum pour les statuts de retour
export enum RetourStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DONE = 'DONE',
  NOTDONE = 'NOTDONE',
}

// Enum pour les types de retour
export enum RetourType {
  RETURN = 'RETURN',
  EXCHANGE = 'EXCHANGE',
  REFUND = 'REFUND',
}

export interface Returns {
  returnID: number;
  retourstatus: RetourStatus; // Utilisation de l'enum RetourStatus
  reason_description: string;
  retourtype: RetourType; // Utilisation de l'enum RetourType
  parcel?: {
    parcelID: number;
  };
  retourdate: Date;
}
