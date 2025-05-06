import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  selector: 'app-paid-parcels',
  templateUrl: './paid-parcels.component.html',
  styleUrls: ['./paid-parcels.component.css']
})
export class PaidParcelsComponent implements OnInit {
  parcels: ParcelDTO[] = [];
  userId: number | null = null;
  loading = true;
  error = false;
  isDarkMode: boolean = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
    }
  }

  loadUserData(): void {
    const userDataString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      this.handleUserNotLoggedIn();
      return;
    }
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        this.userId = userData.userId;
        if (!this.userId || this.userId <= 0) {
          console.error('Invalid userId in user data:', userData);
          this.handleUserNotLoggedIn();
          return;
        }
        console.log('UserId loaded:', this.userId);
        this.loadParcels();
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.handleUserNotLoggedIn();
      }
    } else {
      this.handleUserNotLoggedIn();
    }
  }

  private handleUserNotLoggedIn(): void {
    this.error = true;
    this.loading = false;
    this.snackBar.open('Veuillez vous connecter pour voir vos colis payés', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/login']);
  }

  loadParcels(): void {
    if (this.userId !== null) {
      this.loading = true;
      const token = localStorage.getItem('token');
      this.http.get<ParcelDTO[]>(`http://localhost:8084/parcel/by-user/${this.userId}`, {
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
          this.snackBar.open('Échec du chargement des colis: ' + (err.statusText || 'Erreur serveur'), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  trackParcel(parcelId: number): void {
    if (!parcelId || isNaN(parcelId) || parcelId <= 0) {
      console.error('Invalid parcelId:', parcelId);
      this.snackBar.open('ID de colis invalide', 'Fermer', { duration: 3000 });
      return;
    }
    console.log('Navigating to tracking for parcelId:', parcelId);
    this.router.navigate([`/tracking/${parcelId}`]);
  }

  cancelOrder(parcelId: number): void {
    if (!parcelId || isNaN(parcelId) || parcelId <= 0) {
      console.error('Invalid parcelId for cancellation:', parcelId);
      this.snackBar.open('ID de colis invalide', 'Fermer', { duration: 3000 });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for cancellation');
      this.snackBar.open('Veuillez vous reconnecter', 'Fermer', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    console.log('Cancelling order for parcelId:', parcelId);
    this.http.delete(`http://localhost:8084/parcel/delete/${parcelId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.parcels = this.parcels.filter(parcel => parcel.parcel_id !== parcelId);
        console.log('Parcel deleted successfully, updated parcels:', this.parcels);
        this.snackBar.open('Commande annulée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cancelling order:', err);
        let errorMessage = 'Échec de l\'annulation de la commande';
        if (err.status === 403) {
          errorMessage = 'Accès refusé : vous n\'êtes pas autorisé à annuler cette commande';
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          errorMessage = 'Colis introuvable';
        } else if (err.status === 400) {
          errorMessage = 'Commande non annulable (par exemple, déjà expédiée)';
        }
        this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
      }
    });
  }

  canCancel(status: string): boolean {
    return status === 'ORDERED';
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
      'DELIVERED': 'LIVRÉ'
    };
    return labels[status] || (status ? status : 'INCONNU');
  }
}