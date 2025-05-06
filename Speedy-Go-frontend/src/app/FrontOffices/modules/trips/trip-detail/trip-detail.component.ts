import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Trip } from '../model/trip';
import { TripService } from '../trip/trip.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit, AfterViewInit {
  trip: Trip | null = null;
  loading = true;
  error: string | null = null;
  isDeleting = false;
  deleteModal: Modal | null = null;
  editModal: Modal | null = null;
  editForm: FormGroup;

  // Google Maps properties
  apiLoaded = false;
  mapOptions: google.maps.MapOptions | undefined;
  startMarker: { position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions } | undefined;
  endMarker: { position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions } | undefined;
  routePath: google.maps.LatLngLiteral[] | undefined;
  routeOptions: google.maps.PolylineOptions = {
    strokeColor: '#0075FF',
    strokeOpacity: 0.8,
    strokeWeight: 5
  };
  googleMapsApiKey = 'AIzaSyBQyBRLDvdrrGQk3NT8Sm9c5lX7Nizvj24'; // Your API key

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private fb: FormBuilder,
    private httpClient: HttpClient
  ) {
    this.editForm = this.fb.group({
      description: ['', Validators.required],
      start_location: ['', Validators.required],
      end_location: ['', Validators.required],
      trip_date: ['', Validators.required],
      trip_status: ['', Validators.required],
      phone_number: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.loadTrip();
    });

    // Load Google Maps API script
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit(): void {
    // Initialize the delete modal
    const deleteModalElement = document.getElementById('deleteModal');
    if (deleteModalElement) {
      this.deleteModal = new Modal(deleteModalElement);
    }

    // Initialize the edit modal
    const editModalElement = document.getElementById('editModal');
    if (editModalElement) {
      this.editModal = new Modal(editModalElement);
    }
  }

  loadGoogleMapsScript(): void {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.apiLoaded = true;
        if (this.trip) {
          this.initMap();
        }
      };
      document.head.appendChild(script);
    } else {
      this.apiLoaded = true;
    }
  }

  loadTrip(): void {
    this.loading = true;
    this.error = null;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(id)) {
      this.error = 'Invalid trip ID';
      this.loading = false;
      return;
    }

    this.tripService.getTrip(id).subscribe({
      next: (data) => {
        this.trip = data;
        this.editForm.patchValue(data);
        this.loading = false;
        
        // Initialize map if Google API is loaded
        if (this.apiLoaded) {
          this.initMap();
        }
      },
      error: (err) => {
        console.error('Error fetching trip details', err);
        this.error = 'Failed to load trip details. Please try again later.';
        this.loading = false;
      }
    });
  }

  // This method is called from the template to reload trip details
  loadTripDetails(): void {
    // Reset any error state
    this.error = null;
    
    // Show loading state
    this.loading = true;
    
    // Reload trip data
    this.loadTrip();
  }

  initMap(): void {
    if (!this.trip) return;

    // Geocode the start and end locations
    this.geocodeStartAndEndLocations(this.trip.start_location, this.trip.end_location);
  }

  geocodeStartAndEndLocations(startLocation: string, endLocation: string): void {
    const geocoder = new google.maps.Geocoder();
    
    // Geocode start location
    geocoder.geocode({ address: startLocation }, (startResults, startStatus) => {
      if (startStatus === google.maps.GeocoderStatus.OK && startResults && startResults[0]) {
        const startLatLng = {
          lat: startResults[0].geometry.location.lat(),
          lng: startResults[0].geometry.location.lng()
        };
        
        // Geocode end location
        geocoder.geocode({ address: endLocation }, (endResults, endStatus) => {
          if (endStatus === google.maps.GeocoderStatus.OK && endResults && endResults[0]) {
            const endLatLng = {
              lat: endResults[0].geometry.location.lat(),
              lng: endResults[0].geometry.location.lng()
            };
            
            // Set up map and markers
            this.setupMapAndMarkers(startLatLng, endLatLng);
            
            // Calculate and display the route
            this.calculateRoute(startLatLng, endLatLng);
          } else {
            console.error('Geocoding failed for end location:', endStatus);
          }
        });
      } else {
        console.error('Geocoding failed for start location:', startStatus);
      }
    });
  }

  setupMapAndMarkers(startLatLng: google.maps.LatLngLiteral, endLatLng: google.maps.LatLngLiteral): void {
    // Calculate center point between start and end
    const centerLat = (startLatLng.lat + endLatLng.lat) / 2;
    const centerLng = (startLatLng.lng + endLatLng.lng) / 2;
    
    // Set map options with center and zoom
    this.mapOptions = {
      center: { lat: centerLat, lng: centerLng },
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: false
    };
    
    // Create markers for start and end locations
    this.startMarker = {
      position: startLatLng,
      options: {
        title: 'Start Location',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      }
    };
    
    this.endMarker = {
      position: endLatLng,
      options: {
        title: 'End Location',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      }
    };
  }

  calculateRoute(startLatLng: google.maps.LatLngLiteral, endLatLng: google.maps.LatLngLiteral): void {
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route({
      origin: startLatLng,
      destination: endLatLng,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        const route = response.routes[0];
        const path: google.maps.LatLngLiteral[] = [];
        
        // Extract path points from the route
        if (route.overview_path) {
          route.overview_path.forEach(point => {
            path.push({
              lat: point.lat(),
              lng: point.lng()
            });
          });
          
          this.routePath = path;
        }
      } else {
        console.error('Directions request failed:', status);
        
        // If directions fail, at least draw a straight line between points
        this.routePath = [startLatLng, endLatLng];
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PLANNED':
        return 'bg-info';
      case 'IN_PROGRESS':
        return 'bg-warning';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  }

  confirmDelete(): void {
    this.deleteModal?.show();
  }

  deleteTrip(): void {
    if (!this.trip || !this.trip.id) return;
    
    this.isDeleting = true;
    
    this.tripService.deleteTrip(this.trip.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteModal?.hide();
        this.router.navigate(['/trips']);
      },
      error: (err) => {
        console.error('Error deleting trip', err);
        this.isDeleting = false;
        // Could add a toast notification here
        this.error = 'Failed to delete trip. Please try again later.';
      }
    });
  }

  openEditDialog(): void {
    if (!this.trip) return;

    // Set the trip data in the modal
    const tripDataElement = document.getElementById('editTripData');
    if (tripDataElement) {
      tripDataElement.innerText = JSON.stringify(this.trip, null, 2);
    }

    this.editModal?.show();
  }

  saveEdit(): void {
    if (this.editForm.valid) {
      if (this.trip) {
        const updatedTrip: Trip = { ...this.trip, ...this.editForm.value };
        this.tripService.updateTrip(updatedTrip, this.editForm.value).subscribe({
        next: () => {
          this.editModal?.hide();
          this.loadTrip();
        },
        error: (err) => {
          console.error('Error updating trip', err);
          // Could add a toast notification here
          this.error = 'Failed to update trip. Please try again later.';
        }
      });
      }
    }
  }
}