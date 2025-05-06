import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';

interface Trip {
  id: number;
  trip_date: string;
  description: string;
  start_location: string;
  end_location: string;
}

interface InternationalShipping {
  id: number;
  destination_country: string;
}

interface ParcelDTO {
  parcel_id: number;
  parcel_name: string;
  delivery_address: string;
  current_location: string;
  weight: number;
  trip: Trip | null;
  international_shipping: InternationalShipping | null;
  user_id: number;
  parcelstatus: string;
}

@Component({
  selector: 'app-all-paid-parcels',
  templateUrl: './all-paid-parcels.component.html',
  styleUrls: ['./all-paid-parcels.component.css']
})
export class AllPaidParcelsComponent implements OnInit {
  parcels: ParcelDTO[] = [];
  loading = true;
  error = false;
  isDarkMode: boolean = false;
  deliveredFinalClickDone: { [key: number]: boolean } = {};
  refusedDeliveryDone: { [key: number]: boolean } = {};
  acceptedDeliveryDone: { [key: number]: boolean } = {};

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
    }
    this.loadParcels();
  }

  loadParcels(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      this.handleUserNotLoggedIn();
      return;
    }

    // Load accepted parcels from localStorage
    const userId = this.getUserIdFromToken(token); // Implement based on your JWT structure
    const savedAccepted = localStorage.getItem(`acceptedParcels_${userId}`);
    const acceptedParcels: { [key: number]: boolean } = savedAccepted ? JSON.parse(savedAccepted) : {};

    this.loading = true;
    this.http.get<ParcelDTO[]>(`http://localhost:8084/parcel/getAll`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (parcels) => {
        console.log('Loaded parcels:', JSON.stringify(parcels, null, 2));
        this.parcels = parcels
          .map(parcel => ({
            ...parcel,
            weight: Number((Math.random() * (10 - 1) + 1).toFixed(2)) // Random weight between 1 and 10
          }))
          .filter(parcel => {
            const isValid = parcel.parcel_id && !isNaN(parcel.parcel_id) && parcel.parcel_id > 0;
            if (!isValid) {
              console.warn('Filtered out invalid parcel:', parcel);
            }
            return isValid;
          });
        console.log('Filtered parcels:', JSON.stringify(this.parcels, null, 2));
        this.parcels.forEach(parcel => {
          this.deliveredFinalClickDone[parcel.parcel_id] = parcel.parcelstatus === 'DELIVERED';
          this.refusedDeliveryDone[parcel.parcel_id] = parcel.parcelstatus === 'REFUSED';
          // Initialize as false; restore from localStorage if previously accepted
          this.acceptedDeliveryDone[parcel.parcel_id] = acceptedParcels[parcel.parcel_id] || false;
          console.log(`Parcel ID: ${parcel.parcel_id}, Status: ${parcel.parcelstatus}, Accepted: ${this.acceptedDeliveryDone[parcel.parcel_id]}, Refused: ${this.refusedDeliveryDone[parcel.parcel_id]}, Delivered: ${this.deliveredFinalClickDone[parcel.parcel_id]}`);
        });
        if (this.parcels.length === 0) {
          console.warn('No valid parcels found after filtering');
          this.snackBar.open('Aucun colis valide trouvé', 'Fermer', { duration: 3000 });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des colis:', err);
        this.error = true;
        this.loading = false;
        let message = 'Échec du chargement des colis';
        if (err.status === 403) {
          message = 'Accès refusé. Veuillez vous reconnecter.';
        } else if (err.status === 404) {
          message = 'Aucun colis trouvé.';
        }
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }

  private handleUserNotLoggedIn(): void {
    this.error = true;
    this.loading = false;
    this.snackBar.open('Veuillez vous connecter pour voir les colis', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/login']);
  }

  private getUserIdFromToken(token: string): string {
    // Decode JWT to extract user_id (adjust based on your JWT structure)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || 'unknown';
    } catch (e) {
      console.error('Error decoding token:', e);
      return 'unknown';
    }
  }

  private saveAcceptedParcels(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const userId = this.getUserIdFromToken(token);
      localStorage.setItem(`acceptedParcels_${userId}`, JSON.stringify(this.acceptedDeliveryDone));
    }
  }

  nextStatus(parcelId: number): void {
    if (this.deliveredFinalClickDone[parcelId] || this.refusedDeliveryDone[parcelId] || !this.acceptedDeliveryDone[parcelId]) {
      console.log(`Cannot update status for parcelId: ${parcelId}, Delivered: ${this.deliveredFinalClickDone[parcelId]}, Refused: ${this.refusedDeliveryDone[parcelId]}, Accepted: ${this.acceptedDeliveryDone[parcelId]}`);
      return;
    }

    const token = localStorage.getItem('token');
    this.http.post(`http://localhost:8084/parcel/rest/${parcelId}/next-status`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log('✅ Statut mis à jour pour parcelId:', parcelId);
        this.websocketService.sendTrackingRequest(parcelId);
        this.websocketService.watchParcelStatus(parcelId).subscribe(status => {
          console.log('🟢 Statut reçu via WebSocket:', status);
          if (status === 'DELIVERED') {
            this.deliveredFinalClickDone[parcelId] = true;
            this.acceptedDeliveryDone[parcelId] = false; // Reset acceptance
            this.saveAcceptedParcels();
            this.snackBar.open('Livraison complétée !', 'Fermer', { duration: 3000 });
          }
          this.loadParcels(); // Refresh parcels to reflect new status
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour du statut:', err);
        let message = 'Échec de la mise à jour du statut';
        if (err.status === 403) {
          message = 'Accès refusé. Veuillez vous reconnecter.';
        } else if (err.status === 400) {
          message = 'Statut final déjà atteint.';
        }
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }

  refuseDelivery(parcelId: number): void {
    if (this.refusedDeliveryDone[parcelId] || this.deliveredFinalClickDone[parcelId] || this.acceptedDeliveryDone[parcelId]) {
      console.log(`Cannot refuse delivery for parcelId: ${parcelId}, Refused: ${this.refusedDeliveryDone[parcelId]}, Delivered: ${this.deliveredFinalClickDone[parcelId]}, Accepted: ${this.acceptedDeliveryDone[parcelId]}`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for refusal');
      this.snackBar.open('Veuillez vous reconnecter', 'Fermer', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    console.log('Refusing delivery for parcelId:', parcelId);
    this.http.post(`http://localhost:8084/parcel/rest/${parcelId}/refuse`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log('✅ Parcel refused for parcelId:', parcelId);
        this.websocketService.sendTrackingRequest(parcelId);
        this.websocketService.watchParcelStatus(parcelId).subscribe(status => {
          console.log('🟢 Refusal status received via WebSocket:', status);
          if (status === 'REFUSED') {
            this.refusedDeliveryDone[parcelId] = true;
            this.acceptedDeliveryDone[parcelId] = false; // Reset acceptance
            this.saveAcceptedParcels();
            this.snackBar.open('Livraison refusée !', 'Fermer', { duration: 3000 });
            this.loadParcels(); // Refresh parcels to reflect new status
          }
        });
      },
      error: (err) => {
        console.error('❌ Error refusing delivery:', err);
        let message = 'Échec du refus de livraison';
        if (err.status === 403) {
          message = 'Accès refusé. Veuillez vous reconnecter.';
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          message = 'Le colis ne peut être refusé que s\'il est en statut COMMANDÉ.';
        } else if (err.status === 404) {
          message = 'Colis introuvable.';
        }
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }

  acceptParcel(parcelId: number): void {
    if (this.acceptedDeliveryDone[parcelId] || this.deliveredFinalClickDone[parcelId]) {
      console.log(`Cannot accept delivery for parcelId: ${parcelId}, Accepted: ${this.acceptedDeliveryDone[parcelId]}, Delivered: ${this.deliveredFinalClickDone[parcelId]}`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for acceptance');
      this.snackBar.open('Veuillez vous reconnecter', 'Fermer', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    console.log('Accepting delivery for parcelId:', parcelId);
    this.http.post(`http://localhost:8084/parcel/rest/${parcelId}/accept`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log('✅ Parcel accepted for parcelId:', parcelId);
        this.websocketService.sendTrackingRequest(parcelId);
        this.websocketService.watchParcelStatus(parcelId).subscribe(status => {
          console.log('🟢 Acceptance status received via WebSocket:', status);
          if (status === 'ORDERED') {
            this.acceptedDeliveryDone[parcelId] = true;
            this.refusedDeliveryDone[parcelId] = false; // Reset refusal
            this.saveAcceptedParcels();
            this.snackBar.open('Colis accepté pour livraison !', 'Fermer', { duration: 3000 });
            this.loadParcels(); // Refresh parcels to reflect new status
          }
        });
      },
      error: (err) => {
        console.error('❌ Error accepting delivery:', err);
        let message = 'Échec de l\'acceptation du colis';
        if (err.status === 403) {
          message = 'Accès refusé. Veuillez vous reconnecter.';
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          message = 'Le colis ne peut être accepté que s\'il est en statut COMMANDÉ ou REFUSÉ.';
        } else if (err.status === 404) {
          message = 'Colis introuvable.';
        }
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ORDERED': 'COMMANDÉ',
      'SHIPPED': 'EXPÉDIÉ',
      'OUT_FOR_DELIVERY': 'EN COURS DE LIVRAISON',
      'DELIVERED': 'LIVRÉ',
      'REFUSED': 'REFUSÉ'
    };
    return labels[status] || (status ? status : 'INCONNU');
  }
}