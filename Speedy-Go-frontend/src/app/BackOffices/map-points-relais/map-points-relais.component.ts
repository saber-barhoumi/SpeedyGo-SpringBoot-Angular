import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { PointsRelaisService } from 'src/app/services/points-relais.service';
import { PointRelais } from 'src/app/models/points-relais.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-map-points-relais',
  templateUrl: './map-points-relais.component.html',
  styleUrls: ['./map-points-relais.component.css']
})
export class MapPointsRelaisComponent implements OnInit {
  map!: Map;
  vectorSource = new VectorSource();
  selectedPosition: PointRelais | null = null;
  temporaryFeature: Feature | null = null;

  constructor(private pointRelaisService: PointsRelaisService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadPointsRelais();
  }

  initMap(): void {
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([10, 36]), // centre par défaut sur Tunisie
        zoom: 7,
      })
    });

    // Sélectionner une position au clic
    this.map.on('click', (event) => {
      const coords = toLonLat(event.coordinate);

      if (this.temporaryFeature) {
        this.vectorSource.removeFeature(this.temporaryFeature);
      }

      this.selectedPosition = {
        capacite: 0,
        longitude: coords[0],
        latitude: coords[1],
      };

      this.temporaryFeature = new Feature({
        geometry: new Point(fromLonLat([this.selectedPosition.longitude, this.selectedPosition.latitude]))
      });

      this.temporaryFeature.setStyle(new Style({
        image: new Icon({
          src: 'assets/marker-temp.png',
          scale: 0.2,
        }),
      }));

      this.vectorSource.addFeature(this.temporaryFeature);
    });
  }

  confirmAddPoint(): void {
    if (this.selectedPosition) {
      const point = this.selectedPosition;

      this.pointRelaisService.add(point).subscribe(() => {
        // Ajout dans la carte (définitif)
        this.addMarker(point);

        // Suppression du marqueur temporaire
        if (this.temporaryFeature) {
          this.vectorSource.removeFeature(this.temporaryFeature);
        }

        this.selectedPosition = null;
        this.temporaryFeature = null;

        // Affichage du message de succès
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Le point relais a été ajouté avec succès !',
          confirmButtonText: 'OK'
        });
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l’ajout du point relais.',
        });
      });
    }
  }

  addMarker(point: PointRelais): void {
    const feature = new Feature({
      geometry: new Point(fromLonLat([point.longitude, point.latitude]))
    });

    feature.setStyle(new Style({
      image: new Icon({
        src: 'assets/marker.png',
        scale: 0.07,
      }),
    }));

    this.vectorSource.addFeature(feature);
  }

  loadPointsRelais(): void {
    this.pointRelaisService.getAll().subscribe(points => {
      points.forEach(p => this.addMarker(p));
    });
  }
}
