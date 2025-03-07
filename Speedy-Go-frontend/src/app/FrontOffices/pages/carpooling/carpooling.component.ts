import { Component } from '@angular/core';

interface Carpooling {
  carpoolingId?: number;
  driverName: string;
  departureLocation: string;
  destination: string;
  arrivalTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description: string;
}

@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css']
})
export class CarpoolingComponent {
  isEditing: boolean = false;
  carpoolings: Carpooling[] = [];
  newCarpooling: Carpooling = {
    driverName: '',
    departureLocation: '',
    destination: '',
    arrivalTime: '',
    availableSeats: 0,
    pricePerSeat: 0,
    description: ''
  };
  editingIndex: number | null = null;

  addCarpooling() {
    this.newCarpooling.carpoolingId = Date.now(); // Générer un ID unique
    this.carpoolings.push({ ...this.newCarpooling });
    this.resetForm();
  }

  editCarpooling(carpooling: Carpooling) {
    this.isEditing = true;
    this.editingIndex = this.carpoolings.findIndex(c => c.carpoolingId === carpooling.carpoolingId);
    this.newCarpooling = { ...carpooling };
  }

  updateCarpooling() {
    if (this.editingIndex !== null) {
      this.carpoolings[this.editingIndex] = { ...this.newCarpooling };
      this.resetForm();
    }
  }

  deleteCarpooling(id: number) {
    this.carpoolings = this.carpoolings.filter(c => c.carpoolingId !== id);
  }

  resetForm() {
    this.isEditing = false;
    this.editingIndex = null;
    this.newCarpooling = {
      driverName: '',
      departureLocation: '',
      destination: '',
      arrivalTime: '',
      availableSeats: 0,
      pricePerSeat: 0,
      description: ''
    };
  }
}
