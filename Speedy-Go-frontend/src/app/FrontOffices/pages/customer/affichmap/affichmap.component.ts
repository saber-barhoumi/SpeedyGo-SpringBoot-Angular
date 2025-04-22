import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { PointsRelaisService } from 'src/app/services/points-relais.service';
import { PointRelais } from 'src/app/models/points-relais.model';

@Component({
  selector: 'app-affichmap',
  templateUrl: './affichmap.component.html',
  styleUrls: ['./affichmap.component.css']
})
export class AffichmapComponent implements OnInit {
  map!: Map;
  vectorSource = new VectorSource();

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
        center: fromLonLat([10, 36]), // Tunisie
        zoom: 7,
      })
    });
  }

  loadPointsRelais(): void {
    this.pointRelaisService.getAll().subscribe(points => {
      points.forEach(p => this.addMarker(p));
    });
  }

  addMarker(point: PointRelais): void {
    const feature = new Feature({
      geometry: new Point(fromLonLat([point.longitude, point.latitude]))
    });

    feature.setStyle(new Style({
      image: new Icon({
        src: 'assets/marker.png',
        scale: 0.2,
      }),
    }));

    this.vectorSource.addFeature(feature);
  }
}
