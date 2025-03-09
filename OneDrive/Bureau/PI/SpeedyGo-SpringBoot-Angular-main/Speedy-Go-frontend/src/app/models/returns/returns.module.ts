
export class ReturnsModule { }
export enum RetourStatus {
  PENDING = 'PENDING',
  APPROVED = 'PROGRESS',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DONE ='DONE'

}

export enum RetourType {
  RETURN = 'RETURN',
  EXCHANGE = 'EXCHANGE',
  REFUND = 'REFUND'
}

export class Returns {
  return_id?: number;
  retourstatus?: RetourStatus;
  reason_description?: string;
  retourtype?: RetourType;
  parcelId?: number; 
}
