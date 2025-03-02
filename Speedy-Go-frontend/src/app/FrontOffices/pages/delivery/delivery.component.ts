import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from '../../services/carpooling.service';
import { Carpooling } from '../../models/carpooling';  // Assure-toi que ce chemin est correct.
import { HttpHeaders } from '@angular/common/http'; // Ajouter cette ligne

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  carpoolings: Carpooling[] = [];
  newCarpooling: Carpooling = {
    id: 0,
    driverName: '', // Ajouté ici
    departureLocation: '',
    destination: '',
    arrivalTime: '',
    availableSeats: 1,
    pricePerSeat: 0,
    description: ''
  };

  constructor(private carpoolingService: CarpoolingService) {}

  ngOnInit(): void {
    this.loadCarpoolings();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadCarpoolings(): void {
    this.carpoolingService.getAllCarpoolings().subscribe(data => {
      this.carpoolings = data;
    });
  }

  deleteCarpooling(id: number): void {
    this.carpoolingService.deleteCarpooling(id).subscribe(() => {
      this.loadCarpoolings();
    });
  }

  addCarpooling(): void {
    this.carpoolingService.addCarpooling(this.newCarpooling).subscribe(() => {
      this.loadCarpoolings();
      this.newCarpooling = {
        id: 0,
        driverName: '',  // Réinitialisé ici
        departureLocation: '',
        destination: '',
        arrivalTime: '',
        availableSeats: 1,
        pricePerSeat: 0,
        description: ''
      };
    });
  }
}
