

import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { Carpooling } from 'src/app/models/carpooling.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker'; // Import BsDatepickerConfig

@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css'],
})
export class CarpoolingComponent implements OnInit {
  isLoading: boolean = false;
  isEditing: boolean = false;
  carpoolings: Carpooling[] = [];
  newCarpooling: Carpooling = {
    carpoolingId: undefined,
    driverName: '',
    departureLocation: '',
    destination: '',
    arrivalTime: '',
    availableSeats: 0,
    pricePerSeat: 0,
    description: '',
  };
  editingIndex: number | null = null;
  bsConfig: Partial<BsDatepickerConfig>; // BsDatepicker configuration

  constructor(private carpoolingService: CarpoolingService) {
    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-dark-blue', // Optional: Customize the appearance
      dateInputFormat: 'YYYY-MM-DD HH:mm',
      showWeekNumbers: false,
    });
  }

  ngOnInit(): void {
    this.loadCarpoolings();
  }

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
    // Convert arrivalTime to ISO string only if it's a valid Date object
    const arrivalTimeToSend = this.newCarpooling.arrivalTime
      ? new Date(this.newCarpooling.arrivalTime).toISOString()
      : null; // Or handle the null case as needed

    const carpoolingToSend = {
      ...this.newCarpooling,
      arrivalTime: arrivalTimeToSend,
    };

    this.carpoolingService.addCarpooling(carpoolingToSend).subscribe({
      next: (response) => {
        console.log('Carpooling added:', response);
        this.loadCarpoolings();
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding carpooling:', error);
        this.isLoading = false;
      },
    });
  }

  
  deleteCarpooling(id: number): void {
    console.log('Deleting carpooling with ID:', id);
    this.carpoolingService.deleteCarpooling(id).subscribe({
      next: () => {
        console.log('Carpooling deleted successfully');
        this.loadCarpoolings();
      },
      error: (error) => {
        console.error('Error deleting carpooling:', error);
      },
    });
  }

  editCarpooling(carpooling: Carpooling) {
    this.isEditing = true;
    this.editingIndex = this.carpoolings.findIndex(c => c.carpoolingId === carpooling.carpoolingId);
    this.newCarpooling = { ...carpooling };
  }

  updateCarpooling(): void {
    console.log("newCarpooling object:", this.newCarpooling); // Add this line
    if (this.newCarpooling.carpoolingId) {
    } else {
      console.error('Carpooling ID is undefined. Cannot update carpooling.');
    }
  
    const arrivalTimeToSend = this.newCarpooling.arrivalTime
      ? new Date(this.newCarpooling.arrivalTime).toISOString()
      : null;
  
    const carpoolingToSend = {
      ...this.newCarpooling,
      arrivalTime: arrivalTimeToSend,
    };
  
    this.carpoolingService.updateCarpooling(carpoolingToSend).subscribe({
      next: (response) => {
        console.log('Carpooling updated successfully:', response);
        this.loadCarpoolings();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error updating carpooling:', error);
      },
    });
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