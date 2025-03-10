import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { Carpooling } from 'src/app/models/carpooling.model';

@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css'],
})
export class CarpoolingComponent implements OnInit {
  isLoading: boolean = false; // Loading state
  isEditing: boolean = false; // Editing state
  carpoolings: Carpooling[] = []; // List of carpoolings
  newCarpooling: Carpooling = {
    // Default new carpooling object
    carpoolingId: undefined,
    driverName: '',
    departureLocation: '',
    destination: '',
    arrivalTime: '',
    availableSeats: 0,
    pricePerSeat: 0,
    description: '',
  };
  editingIndex: number | null = null; // Index of the carpooling being edited

  constructor(private carpoolingService: CarpoolingService) {}

  ngOnInit(): void {
    this.loadCarpoolings(); // Load carpoolings on component initialization
  }

  // Load all carpoolings from the backend
  loadCarpoolings(): void {
    this.isLoading = true;
    this.carpoolingService.getAllCarpoolings().subscribe({
      next: (data) => {
        this.carpoolings = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading carpoolings:', error);
        this.isLoading = false;
      },
    });
  }

  addCarpooling(): void {
    this.isLoading = true;
    let arrivalTimeToSend: string | null = null;
    if (this.newCarpooling.arrivalTime) {
      arrivalTimeToSend = new Date(this.newCarpooling.arrivalTime).toISOString();
    }
    const carpoolingToSend = {
      ...this.newCarpooling,
      arrivalTime: arrivalTimeToSend,
    } as Carpooling;
  
    this.carpoolingService.addCarpooling(carpoolingToSend).subscribe({
      next: (response) => {
        console.log('Carpooling added:', response);
        this.loadCarpoolings(); // Refresh the list
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding carpooling:', error);
        this.isLoading = false;
      },
    });
  }
  
  updateCarpooling(): void {
    if (this.newCarpooling.carpoolingId) {
      let arrivalTimeToSend: string | null = null;
      if (this.newCarpooling.arrivalTime) {
        arrivalTimeToSend = new Date(this.newCarpooling.arrivalTime).toISOString();
      }
      const carpoolingToSend = {
        ...this.newCarpooling,
        arrivalTime: arrivalTimeToSend,
      } as Carpooling;
      this.carpoolingService.updateCarpooling(carpoolingToSend).subscribe({
        next: (response) => {
          console.log('Carpooling updated:', response);
          this.loadCarpoolings(); // Refresh the list
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating carpooling:', error);
        },
      });
    }
  }


  resetForm(): void {
    this.isEditing = false;
    this.newCarpooling = {
      carpoolingId: undefined,
      driverName: '',
      departureLocation: '',
      destination: '',
      arrivalTime: '',
      availableSeats: 0,
      pricePerSeat: 0,
      description: '',
    };
  }
}