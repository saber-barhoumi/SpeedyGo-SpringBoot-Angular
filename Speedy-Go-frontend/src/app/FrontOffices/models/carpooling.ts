export class Carpooling {
    id: number = 0;  
    driverName: string = '';
    departureLocation: string = '';
    destination: string = '';
    arrivalTime: string = '';
    availableSeats: number = 0;
    pricePerSeat: number = 0;
    description: string = '';

    // Constructeur avec `id`
    constructor(
        id: number = 0,  // Ajouté ici
        driverName: string = '', 
        departureLocation: string = '', 
        destination: string = '', 
        arrivalTime: string = '', 
        availableSeats: number = 0, 
        pricePerSeat: number = 0, 
        description: string = ''
    ) {
        this.id = id;  // Ajouté ici
        this.driverName = driverName;
        this.departureLocation = departureLocation;
        this.destination = destination;
        this.arrivalTime = arrivalTime;
        this.availableSeats = availableSeats;
        this.pricePerSeat = pricePerSeat;
        this.description = description;
    }
}
