import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { NominatimService } from 'src/app/services/nominatim.service';
import { SmartRouteService } from 'src/app/services/smart-route.service';
import { TripHistoryService } from 'src/app/services/trip-history.service';


@Component({
  selector: 'app-smart-route-map',
  templateUrl: './smart-route-map.component.html',
  styleUrls: ['./smart-route-map.component.css']
})
export class SmartRouteMapComponent implements OnInit {

  map!: L.Map;

  fromQuery = '';
  toQuery = '';
  fromResults: any[] = [];
  toResults: any[] = [];

  fromCoords: [number, number] | null = null;
  toCoords: [number, number] | null = null;

  distance: number | null = null;
  duration: string | null = null;

  isLoading = false;

  private currentPolyline: L.Polyline | null = null;
  private fromMarker: L.Marker | null = null;
  private toMarker: L.Marker | null = null;

  constructor(
    private nominatim: NominatimService,
    private routeService: SmartRouteService,
    private tripHistory: TripHistoryService
  ) {}

  ngOnInit(): void {
    this.map = L.map('map').setView([36.8, 10.18], 8); // Tunis par défaut
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
  }

  searchFrom() {
    if (this.fromQuery.length > 2) {
      this.nominatim.search(this.fromQuery).subscribe(
        res => this.fromResults = res,
        error => this.handleError(error)
      );
    }
  }

  searchTo() {
    if (this.toQuery.length > 2) {
      this.nominatim.search(this.toQuery).subscribe(
        res => this.toResults = res,
        error => this.handleError(error)
      );
    }
  }

  selectFrom(place: any) {
    this.fromCoords = [parseFloat(place.lat), parseFloat(place.lon)];
    this.fromQuery = place.display_name;
    this.fromResults = [];
    this.map.setView(this.fromCoords, 14);
  }

  selectTo(place: any) {
    this.toCoords = [parseFloat(place.lat), parseFloat(place.lon)];
    this.toQuery = place.display_name;
    this.toResults = [];
    this.map.setView(this.toCoords, 14);
  }

  calculateSmartRoute() {
    if (!this.fromCoords || !this.toCoords) return;
  
    this.isLoading = true;
  
    const req = {
      fromLat: this.fromCoords[0],
      fromLon: this.fromCoords[1],
      toLat: this.toCoords[0],
      toLon: this.toCoords[1],
      fromLabel: this.fromQuery,
      toLabel: this.toQuery
    };
  
    this.routeService.getRoute(req).subscribe(
      (res: any) => {
        const geometry = res.features[0].geometry;
        const summary = res.features[0].properties.summary;
        const coords = geometry.coordinates.map((c: any) => [c[1], c[0]]);
  
        // Nettoyer ancien tracé
        if (this.currentPolyline) {
          this.map.removeLayer(this.currentPolyline);
        }
        this.currentPolyline = L.polyline(coords, { color: 'blue' }).addTo(this.map);
  
        // Nettoyer anciens marqueurs
        if (this.fromMarker) this.map.removeLayer(this.fromMarker);
        if (this.toMarker) this.map.removeLayer(this.toMarker);
  
        // Ajouter marqueurs
        this.fromMarker = L.marker(this.fromCoords!, { icon: this.createMarkerIcon('green') }).addTo(this.map);
        this.toMarker = L.marker(this.toCoords!, { icon: this.createMarkerIcon('red') }).addTo(this.map);
  
        this.map.fitBounds(this.currentPolyline.getBounds());
  
        // Distance et durée estimée
        const distance = summary.distance / 1000;
        const estimated = summary.duration / 60;
  
        this.distance = parseFloat(distance.toFixed(2));
        this.duration = this.convertSeconds(summary.duration);
  
        // Simuler une durée réelle (+/-10%)
        const realDuration = estimated * (0.9 + Math.random() * 0.2);
  
        // Enrichissement des données historiques
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
        const trip = {
          fromLabel: req.fromLabel,
          toLabel: req.toLabel,
          fromLat: req.fromLat,
          fromLon: req.fromLon,
          toLat: req.toLat,
          toLon: req.toLon,
          distanceKm: distance,
          estimatedDurationMin: estimated,
          realDurationMin: realDuration,
          startTime: now.toISOString(),
          trafficLevel: 'medium', // en dur pour l’instant
          dayOfWeek: dayOfWeek
        };
  
        this.tripHistory.saveTrip(trip).subscribe(() => {
          console.log('Trajet sauvegardé ✅');
        });
      },
      error => this.handleError(error),
      () => this.isLoading = false
    );
  }
  
  private convertSeconds(totalSec: number): string {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${h}h ${m}min`;
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue', error);
    // Optionnel : affiche une alerte utilisateur
  }

  private createMarkerIcon(color: string): L.Icon {
    return L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=flag|${color}`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -30]
    });
  }
}
