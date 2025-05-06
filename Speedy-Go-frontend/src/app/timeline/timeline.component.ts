import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {
  orderStatus = ['ORDERED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  dotCss: string[] = [];
  cssClass: string[] = [];
  parcelId!: number;
  public deliveredFinalClickDone = false;
  showDeliveredMessage = false;

  constructor(
    private websocketService: WebsocketService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      this.snackBar.open('Veuillez vous connecter', 'Fermer', { duration: 3000 });
      return;
    }

    this.route.paramMap.subscribe(params => {
      const parcelIdParam = params.get('parcelId');
      this.parcelId = parcelIdParam ? +parcelIdParam : NaN;
      console.log('📦 parcelId récupéré:', this.parcelId);

      if (isNaN(this.parcelId) || this.parcelId <= 0) {
        console.error('Invalid parcelId:', parcelIdParam);
        this.snackBar.open('ID de colis invalide', 'Fermer', { duration: 3000 });
        return;
      }

      this.http.get<ParcelDTO>(`http://localhost:8084/parcel/get/${this.parcelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (parcel) => {
          console.log('📦 Statut initial:', parcel.parcelstatus);
          this.updateTimeline(parcel.parcelstatus);
        },
        error: (err) => {
          console.error('Erreur lors du chargement du colis:', err);
          let message = 'Échec du chargement du suivi du colis';
          if (err.status === 403) {
            message = 'Accès refusé. Veuillez vous reconnecter.';
          } else if (err.status === 404) {
            message = 'Colis introuvable.';
          }
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
        }
      });

      this.websocketService.watchParcelStatus(this.parcelId).subscribe(status => {
        console.log('🟢 Statut reçu via WebSocket:', status);
        this.updateTimeline(status);
      });
    });
  }

  private updateTimeline(status: string): void {
    const currentIndex = this.orderStatus.findIndex(s => s === status);

    if (currentIndex === -1) {
      console.warn('Invalid status received:', status);
      this.snackBar.open('Statut de colis invalide', 'Fermer', { duration: 3000 });
      return;
    }

    if (status === 'DELIVERED' && !this.deliveredFinalClickDone) {
      this.dotCss = [];
      this.cssClass = [];

      this.orderStatus.forEach((_, i) => {
        if (i < currentIndex) {
          this.dotCss[i] = 'state-success';
          this.cssClass[i] = 'completed';
        } else if (i === currentIndex) {
          this.dotCss[i] = 'state-progress';
          this.cssClass[i] = 'intermediate';
        } else {
          this.dotCss[i] = '';
          this.cssClass[i] = '';
        }
      });

      setTimeout(() => {
        this.deliveredFinalClickDone = true;
        this.showDeliveredMessage = true;

        setTimeout(() => {
          this.showDeliveredMessage = false;
        }, 3000);

        this.updateTimeline(status);
      }, 3000);

      return;
    }

    const allDone = status === 'DELIVERED' && this.deliveredFinalClickDone;

    this.dotCss = [];
    this.cssClass = [];

    this.orderStatus.forEach((_, i) => {
      if (allDone || i < currentIndex) {
        this.dotCss[i] = 'state-success';
        this.cssClass[i] = 'completed';
      } else if (i === currentIndex) {
        this.dotCss[i] = 'state-progress';
        this.cssClass[i] = 'intermediate';
      } else {
        this.dotCss[i] = '';
        this.cssClass[i] = '';
      }
    });
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