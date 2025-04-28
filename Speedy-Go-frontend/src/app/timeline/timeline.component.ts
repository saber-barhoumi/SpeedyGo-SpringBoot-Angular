import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { ParcelIdPartageService } from 'src/app/services/parcel-id-partage.service';

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
    private parcelService: ParcelIdPartageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.parcelId = +params.get('parcelId')!;
      console.log('📦 parcelId récupéré:', this.parcelId);

      this.parcelService.updateParcelId(this.parcelId);

      this.http.get<any>(`http://localhost:8084/parcel/get/${this.parcelId}`).subscribe(parcel => {
        console.log('📦 Statut initial:', parcel.parcelstatus);
        this.updateTimeline(parcel.parcelstatus);
      });

      this.websocketService.watchParcelStatus(this.parcelId).subscribe(status => {
        console.log('🟢 Statut reçu via WebSocket:', status);
        this.updateTimeline(status);
      });
    });
  }

  private updateTimeline(status: string): void {
    const currentIndex = this.orderStatus.findIndex(s => s === status);

    if (status === 'DELIVERED' && !this.deliveredFinalClickDone) {
      // Afficher DELIVERED temporairement en orange
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

      // Attendre 3s avant de valider complètement
      setTimeout(() => {
        this.deliveredFinalClickDone = true;
        this.showDeliveredMessage = true;

        // Masquer le message après 3 secondes
        setTimeout(() => {
          this.showDeliveredMessage = false;
        }, 3000);

        // Relancer update pour afficher tout en vert
        this.updateTimeline(status);
      }, 3000);

      return;
    }

    // Mise à jour visuelle "normale"
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

  nextStatus(): void {
    if (this.deliveredFinalClickDone) {
      return;
    }

    if (this.dotCss[this.orderStatus.length - 1] === 'state-progress') {
      this.deliveredFinalClickDone = true;
      this.updateTimeline('DELIVERED');
      return;
    }

    this.http.post(`http://localhost:8084/parcel/rest/${this.parcelId}/next-status`, {}).subscribe({
      next: () => {
        console.log('✅ Statut mis à jour');
        setTimeout(() => {
          this.websocketService.sendTrackingRequest(this.parcelId);
        }, 300);
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }
}
