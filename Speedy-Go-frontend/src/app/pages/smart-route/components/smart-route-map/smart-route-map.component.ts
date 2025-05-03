import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

// Correction du chemin des icônes par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

import { NominatimService } from 'src/app/services/nominatim.service';
import { HttpClient } from '@angular/common/http';
import { IaService } from 'src/app/services/ia-service.service';
import { SmartRouteFeature } from 'src/app/models/smart-route.model';  // ajuste le chemin selon ton projet

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
  traffic: string | null = null;
  private fromMarker: L.Marker | null = null;
  private toMarker: L.Marker | null = null;
  private routeLayers: L.Polyline[] = [];
  routes: SmartRouteFeature[] = [];
  bestRoute: SmartRouteFeature | null = null;
  //bestFeature: SmartRouteFeature | null = null;


  constructor(
    private nominatim: NominatimService,
    private http: HttpClient,
    private iaService: IaService
  ) {}

  ngOnInit(): void {
    this.map = L.map('map').setView([36.8, 10.18], 8);
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
    const routeReq = {
      start: [this.fromCoords[1], this.fromCoords[0]] as [number, number],
      end: [this.toCoords[1], this.toCoords[0]] as [number, number]
    };

    this.iaService.getSmartRoutes(routeReq).subscribe({
      next: (geojson: any) => {
        if (geojson.features?.length > 0) {
          this.routes = geojson.features as SmartRouteFeature[];
          this.displayRoutes(this.routes);
          //this.selectBestRoute(); // Pour calculer et afficher la meilleure route

        } else {
          this.handleRouteError();
        }
        this.isLoading = false;
      },
      error: (error : any) => {
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  private displayRoutes(features: SmartRouteFeature[]) {
    // Nettoyage
    this.routeLayers.forEach(layer => this.map.removeLayer(layer));
    if (this.fromMarker) this.map.removeLayer(this.fromMarker);
    if (this.toMarker) this.map.removeLayer(this.toMarker);
    this.routeLayers = [];
  
    // Marqueurs
    if (this.fromCoords)
      this.fromMarker = L.marker(this.fromCoords).addTo(this.map).bindPopup("Départ");
    if (this.toCoords)
      this.toMarker = L.marker(this.toCoords).addTo(this.map).bindPopup("Arrivée");
  
    let bestScore = Infinity;
    let bestFeature: SmartRouteFeature | null = null;
  

  for (const feature of features) {
    const score = this.computeScore(feature);
    if (score < bestScore) {
      bestScore = score;
      bestFeature = feature;
    }

    this.drawRoute(feature, false); // route normale
  }

  if (bestFeature) {
    this.drawRoute(bestFeature, true); // meilleure route
    this.updateBestRouteData(bestFeature);
  }
   
  }

  private drawRoute(feature: SmartRouteFeature, isBest: boolean) {
    const coords = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]) as [number, number][];
    const color = isBest ? 'blue' : this.getTrafficColor(feature.properties.traffic);
    const line = L.polyline(coords, { color, weight: isBest ? 6 : 4, opacity: 0.8 }).addTo(this.map);
    line.bindPopup(`Durée IA : ${this.convertMinutes(feature.properties.predicted_duration)}<br>Trafic : ${feature.properties.traffic}`);
    this.routeLayers.push(line);
  }
  
  private updateBestRouteData(feature: SmartRouteFeature) {
    this.bestRoute = feature;
    this.distance = feature.properties.summary.distance / 1000;
    this.duration = this.convertMinutes(feature.properties.predicted_duration);
    this.traffic = feature.properties.traffic;
    const coords = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]) as [number, number][];
    this.map.fitBounds(L.polyline(coords).getBounds());
  }
  
  
  selectBestRoute() {
  if (!this.routes.length) return;

  let bestScore = Infinity;
  let selected: SmartRouteFeature | null = null;

  this.routes.forEach((route: SmartRouteFeature) => {
    const score = this.computeScore(route);
    if (score < bestScore) {
      bestScore = score;
      selected = route;
    }
  });

  if (selected) {
    this.updateBestRouteData(selected);
    this.routeLayers.forEach(layer => this.map.removeLayer(layer));
    this.routes.forEach(route => this.drawRoute(route, route === selected));
  }
}


   computeScore(feature: SmartRouteFeature): number {
    const durationScore = feature.properties.predicted_duration;
    const trafficLevel = feature.properties.traffic?.toUpperCase() || 'LOW';

    let trafficWeight = 1;
    switch (trafficLevel) {
      case 'HIGH':
        trafficWeight = 3;
        break;
      case 'MEDIUM':
        trafficWeight = 2;
        break;
    }

    const durationFactor = 0.6;
    const trafficFactor = 0.4;
    return durationFactor * durationScore + trafficFactor * trafficWeight;
  }

  private getTrafficColor(traffic: string): string {
    switch (traffic?.toUpperCase()) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HIGH': return 'red';
      default: return 'gray';
    }
  }

   convertMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}min`;
  }

  private handleRouteError() {
    alert("Aucun itinéraire disponible.");
  }

  private handleError(error: any) {
    console.error('Erreur :', error);
  }

  
  selectRoute(route: SmartRouteFeature) {
    this.updateBestRouteData(route);
    this.routeLayers.forEach(layer => this.map.removeLayer(layer));
    this.routes.forEach(r => this.drawRoute(r, r === route));
  }
  
  
}
