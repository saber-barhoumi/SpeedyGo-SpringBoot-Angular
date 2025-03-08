export class Carpooling {
    carpoolingId: number = 0;
    driverName: string = '';
    departureLocation: string = '';
    destination: string = '';
    arrivalTime: string = '';
    availableSeats: number = 0;
    pricePerSeat: number = 0;
    description: string = '';
  
    constructor(
      carpoolingId: number = 0,
      driverName: string = '',
      departureLocation: string = '',
      destination: string = '',
      arrivalTime: string = '',
      availableSeats: number = 0,
      pricePerSeat: number = 0,
      description: string = ''
    ) {
      this.carpoolingId = carpoolingId;
      this.driverName = driverName;
      this.departureLocation = departureLocation;
      this.destination = destination;
      this.arrivalTime = arrivalTime;
      this.availableSeats = availableSeats;
      this.pricePerSeat = pricePerSeat;
      this.description = description;
    }
  }

