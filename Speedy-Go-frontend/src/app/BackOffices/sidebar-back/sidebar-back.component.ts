import { Component, OnInit } from '@angular/core';
import { ParcelIdPartageService } from 'src/app/services/parcel-id-partage.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar-back',
  templateUrl: './sidebar-back.component.html',
  styleUrls: ['./sidebar-back.component.css']
})
export class SidebarBackComponent implements OnInit {
  user: any;
  parcelId: number | null = null;
  isDelivered: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private websocketService: WebsocketService,
    private parcelService: ParcelIdPartageService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    // Récupérer depuis sessionStorage au démarrage
    const storedId = this.parcelService.getParcelId();
    if (storedId !== null) {
      this.parcelId = storedId;
      console.log('📦 parcelId restauré depuis sessionStorage:', this.parcelId);
    }

    // Écouter les mises à jour via Observable
    this.parcelService.parcelId$
      .pipe(filter(id => id !== null))
      .subscribe(parcelId => {
        this.parcelId = parcelId;
        console.log('📦 parcelId reçu par Observable:', this.parcelId);
      });

    // Écouter les changements depuis un autre onglet
    window.addEventListener('storage', (event) => {
      if (event.key === 'parcelId') {
        const newId = Number(event.newValue);
        if (!isNaN(newId)) {
          this.parcelId = newId;
          console.log('📦 parcelId mis à jour via storage event:', this.parcelId);
        }
      }
    });

    // Tentative tardive si jamais le stockage est mis à jour après
    setTimeout(() => {
      if (this.parcelId === null) {
        const lateId = this.parcelService.getParcelId();
        if (lateId !== null) {
          this.parcelId = lateId;
          console.log('📦 parcelId rechargé après délai:', this.parcelId);
        }
      }
    }, 500); // Attente de 0.5 sec
  }

  changeParcelStatus(): void {
    // Double vérification au clic
    if (this.parcelId === null) {
      const fromStorage = this.parcelService.getParcelId();
      if (fromStorage !== null) {
        this.parcelId = fromStorage;
        console.log('📦 parcelId rechargé au clic depuis sessionStorage:', this.parcelId);
      }
    }

    if (this.parcelId !== null) {
      this.websocketService.sendTrackingRequest(this.parcelId);
      this.http.post(`http://localhost:8084/parcel/rest/${this.parcelId}/next-status`, {}).subscribe({
        next: () => {
          console.log('✅ Statut mis à jour !');
          this.websocketService.sendTrackingRequest(this.parcelId!);
        },
        error: (err) => console.error('❌ Erreur lors de la mise à jour du statut:', err)
      });
    } else {
      console.error('🚫 parcelId est null, impossible de changer le statut.');
    }
  }
}
