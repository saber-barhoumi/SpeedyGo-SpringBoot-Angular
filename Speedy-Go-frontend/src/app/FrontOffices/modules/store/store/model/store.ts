// src/app/models/store.model.ts
export enum StoreType {
    SHOP = 'SHOP',
    RESORT = 'RESORT',
    CAFE = 'CAFE',
    ELECTRONICS = 'ELECTRONICS',
    CLUB = 'CLUB',
    OTHERS = 'OTHERS'
  }
  
  export enum StoreStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    SUSPENDED = 'SUSPENDED'
  }
  
  export interface Store {
    storeID?: number;
    name: string;
    opening?: string;
    closing?: string;
    logo: string;
    website: string;
    image: string;
    address: string;
    city: string;
    location: string;
    description: string;
    phone?: string;
    email: string;
    storeType: StoreType;
    storeStatus: StoreStatus;
    // References to related entities
    user?: any;
    offres?: any[];
  }