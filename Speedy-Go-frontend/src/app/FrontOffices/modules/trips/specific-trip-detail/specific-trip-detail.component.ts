import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-specific-trip-detail',
  templateUrl: './specific-trip-detail.component.html',
  styleUrls: [
    './specific-trip-detail.component.css'
  ]
})
export class SpecificTripDetailComponent implements OnInit {
  specificTrip: SpecificTrip | null = null;
  loading = true;
  mapLoading = true; 
  error: string | null = null;
  updateTripForm: FormGroup;

  @ViewChild('departureLocationInput') departureLocationInput!: ElementRef;
  @ViewChild('passThroughLocationInput') passThroughLocationInput!: ElementRef;
  @ViewChild('arrivalLocationInput') arrivalLocationInput!: ElementRef;

  apiLoaded = false;
  mapOptions: google.maps.MapOptions | undefined;
  startMarker: { position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions } | undefined;
  waypointMarker: { position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions } | undefined;
  endMarker: { position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions } | undefined;
  routePath: google.maps.LatLngLiteral[] | undefined;
  routeOptions: google.maps.PolylineOptions = {
    strokeColor: '#0075FF',
    strokeOpacity: 0.8,
    strokeWeight: 5
  };
  googleMapsApiKey = 'AIzaSyBQyBRLDvdrrGQk3NT8Sm9c5lX7Nizvj24';

  constructor(
    private route: ActivatedRoute, 
    private specificTripService: SpecificTripService, 
    private router: Router, 
    private fb: FormBuilder,
    private httpClient: HttpClient
  ) {
    this.updateTripForm = this.fb.group({
      description: ['', Validators.required],
      departureLocation: ['', Validators.required],
      arrivalLocation: ['', Validators.required],
      passThroughLocation: [''],  
      departureDate: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      parcelType: ['', Validators.required],
      receiverFullName: ['', Validators.required],
      receiverPhoneNumber: ['', Validators.required],
      parcelDescription: ['', Validators.required],
      parcelHeight: ['', Validators.required],
      parcelWidth: ['', Validators.required],
      parcelLength: ['', Validators.required],
      photo: ['', Validators.required],
      tripDetails: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSpecificTripDetails(+id);
    }

    this.loadGoogleMapsApiAsync();
  }

  loadGoogleMapsApiAsync(): void {
    if (window.google && window.google.maps) {
      this.apiLoaded = true;
      if (this.specificTrip) {
        this.initMap();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    (window as any)['initMap'] = () => {
      this.apiLoaded = true;
      if (this.specificTrip) {
        this.initMap();
      }
    };
    
    document.head.appendChild(script);
  }

  loadSpecificTripDetails(id: number): void {
    this.specificTripService.getTripById(id).subscribe({
      next: (data: SpecificTrip) => {
        this.specificTrip = data;
        this.loading = false;
        this.populateUpdateForm();
        
        if (this.apiLoaded) {
          this.initMap();
        }
      },
      error: (err: any) => {
        console.error('Error fetching specific trip details', err);
        this.error = 'Failed to load trip details. Please try again later.';
        this.loading = false;
        this.mapLoading = false;
      }
    });
  }

  initMap(): void {
    if (!this.specificTrip) return;
    
    this.mapLoading = true;

    if (this.specificTrip.passThroughLocation) {
      this.geocodeWithWaypoint(
        this.specificTrip.departureLocation, 
        this.specificTrip.passThroughLocation, 
        this.specificTrip.arrivalLocation
      );
    } else {
      this.geocodeStartAndEndLocations(
        this.specificTrip.departureLocation, 
        this.specificTrip.arrivalLocation
      );
    }
  }

  geocodeStartAndEndLocations(startLocation: string, endLocation: string): void {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: startLocation }, (startResults, startStatus) => {
      if (startStatus === google.maps.GeocoderStatus.OK && startResults && startResults[0]) {
        const startLatLng = {
          lat: startResults[0].geometry.location.lat(),
          lng: startResults[0].geometry.location.lng()
        };
        
        geocoder.geocode({ address: endLocation }, (endResults, endStatus) => {
          if (endStatus === google.maps.GeocoderStatus.OK && endResults && endResults[0]) {
            const endLatLng = {
              lat: endResults[0].geometry.location.lat(),
              lng: endResults[0].geometry.location.lng()
            };
            
            this.setupMapAndMarkers(startLatLng, null, endLatLng);
            
            this.calculateRoute(startLatLng, null, endLatLng);
          } else {
            console.error('Geocoding failed for end location:', endStatus);
            this.mapLoading = false;
          }
        });
      } else {
        console.error('Geocoding failed for start location:', startStatus);
        this.mapLoading = false;
      }
    });
  }

  geocodeWithWaypoint(startLocation: string, waypointLocation: string, endLocation: string): void {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: startLocation }, (startResults, startStatus) => {
      if (startStatus === google.maps.GeocoderStatus.OK && startResults && startResults[0]) {
        const startLatLng = {
          lat: startResults[0].geometry.location.lat(),
          lng: startResults[0].geometry.location.lng()
        };
        
        geocoder.geocode({ address: waypointLocation }, (waypointResults, waypointStatus) => {
          if (waypointStatus === google.maps.GeocoderStatus.OK && waypointResults && waypointResults[0]) {
            const waypointLatLng = {
              lat: waypointResults[0].geometry.location.lat(),
              lng: waypointResults[0].geometry.location.lng()
            };
            
            geocoder.geocode({ address: endLocation }, (endResults, endStatus) => {
              if (endStatus === google.maps.GeocoderStatus.OK && endResults && endResults[0]) {
                const endLatLng = {
                  lat: endResults[0].geometry.location.lat(),
                  lng: endResults[0].geometry.location.lng()
                };
                
                this.setupMapAndMarkers(startLatLng, waypointLatLng, endLatLng);
                
                this.calculateRoute(startLatLng, waypointLatLng, endLatLng);
              } else {
                console.error('Geocoding failed for end location:', endStatus);
                this.mapLoading = false;
              }
            });
          } else {
            console.error('Geocoding failed for waypoint location:', waypointStatus);
            
            this.geocodeStartAndEndLocations(startLocation, endLocation);
          }
        });
      } else {
        console.error('Geocoding failed for start location:', startStatus);
        this.mapLoading = false;
      }
    });
  }

  setupMapAndMarkers(
    startLatLng: google.maps.LatLngLiteral, 
    waypointLatLng: google.maps.LatLngLiteral | null, 
    endLatLng: google.maps.LatLngLiteral
  ): void {
    let sumLat = startLatLng.lat + endLatLng.lat;
    let sumLng = startLatLng.lng + endLatLng.lng;
    let pointCount = 2;
    
    if (waypointLatLng) {
      sumLat += waypointLatLng.lat;
      sumLng += waypointLatLng.lng;
      pointCount = 3;
    }
    
    const centerLat = sumLat / pointCount;
    const centerLng = sumLng / pointCount;
    
    this.mapOptions = {
      center: { lat: centerLat, lng: centerLng },
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: false
    };
    
    this.startMarker = {
      position: startLatLng,
      options: {
        title: 'Departure Location',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      }
    };
    
    if (waypointLatLng) {
      this.waypointMarker = {
        position: waypointLatLng,
        options: {
          title: 'Pass Through Location',
          animation: google.maps.Animation.DROP,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          }
        }
      };
    } else {
      this.waypointMarker = undefined;
    }
    
    this.endMarker = {
      position: endLatLng,
      options: {
        title: 'Arrival Location',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      }
    };
  }

  calculateRoute(
    startLatLng: google.maps.LatLngLiteral, 
    waypointLatLng: google.maps.LatLngLiteral | null, 
    endLatLng: google.maps.LatLngLiteral
  ): void {
    const directionsService = new google.maps.DirectionsService();
    
    const request: google.maps.DirectionsRequest = {
      origin: startLatLng,
      destination: endLatLng,
      travelMode: google.maps.TravelMode.DRIVING
    };
    
    if (waypointLatLng) {
      request.waypoints = [
        {
          location: waypointLatLng,
          stopover: true
        }
      ];
    }
    
    directionsService.route(request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        const route = response.routes[0];
        const path: google.maps.LatLngLiteral[] = [];
        
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
        
        if (waypointLatLng) {
          this.routePath = [startLatLng, waypointLatLng, endLatLng];
        } else {
          this.routePath = [startLatLng, endLatLng];
        }
      }
      
      this.mapLoading = false;
    });
  }

  populateUpdateForm(): void {
    if (this.specificTrip) {
      this.updateTripForm.patchValue({
        description: this.specificTrip.description,
        departureLocation: this.specificTrip.departureLocation,
        arrivalLocation: this.specificTrip.arrivalLocation,
        passThroughLocation: this.specificTrip.passThroughLocation || '',
        departureDate: this.specificTrip.departureDate,
        arrivalDate: this.specificTrip.arrivalDate,
        departureTime: this.specificTrip.departureTime,
        arrivalTime: this.specificTrip.arrivalTime,
        parcelType: this.specificTrip.parcelType,
        receiverFullName: this.specificTrip.receiverFullName,
        receiverPhoneNumber: this.specificTrip.receiverPhoneNumber,
        parcelDescription: this.specificTrip.parcelDescription,
        parcelHeight: this.specificTrip.parcelHeight,
        parcelWidth: this.specificTrip.parcelWidth,
        parcelLength: this.specificTrip.parcelLength,
        photo: this.specificTrip.photo,
        tripDetails: this.specificTrip.tripDetails
      });
    }
  }

  showUpdateModal(): void {
    const modalElement = document.getElementById('updateTripModal');
    if (modalElement) {
      const updateModal = bootstrap.Modal.getOrCreateInstance(modalElement);
      updateModal.show();
      
      setTimeout(() => {
        this.initPlacesAutocomplete();
      }, 500);
    } else {
      console.error('Modal element not found');
    }
  }
  
  initPlacesAutocomplete(): void {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API not loaded');
      return;
    }
    
    if (this.departureLocationInput && this.departureLocationInput.nativeElement) {
      const departureAutocomplete = new google.maps.places.Autocomplete(
        this.departureLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      departureAutocomplete.addListener('place_changed', () => {
        const place = departureAutocomplete.getPlace();
        if (place && place.formatted_address) {
          this.updateTripForm.get('departureLocation')?.setValue(place.formatted_address);
          
          this.updateTripForm.get('departureLocation')?.markAsDirty();
          this.updateTripForm.get('departureLocation')?.updateValueAndValidity();
        }
      });
    }
    
    if (this.passThroughLocationInput && this.passThroughLocationInput.nativeElement) {
      const wayPointAutocomplete = new google.maps.places.Autocomplete(
        this.passThroughLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      wayPointAutocomplete.addListener('place_changed', () => {
        const place = wayPointAutocomplete.getPlace();
        if (place && place.formatted_address) {
          this.updateTripForm.get('passThroughLocation')?.setValue(place.formatted_address);
          
          this.updateTripForm.get('passThroughLocation')?.markAsDirty();
          this.updateTripForm.get('passThroughLocation')?.updateValueAndValidity();
        }
      });
    }
    
    if (this.arrivalLocationInput && this.arrivalLocationInput.nativeElement) {
      const arrivalAutocomplete = new google.maps.places.Autocomplete(
        this.arrivalLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      arrivalAutocomplete.addListener('place_changed', () => {
        const place = arrivalAutocomplete.getPlace();
        if (place && place.formatted_address) {
          this.updateTripForm.get('arrivalLocation')?.setValue(place.formatted_address);
          
          this.updateTripForm.get('arrivalLocation')?.markAsDirty();
          this.updateTripForm.get('arrivalLocation')?.updateValueAndValidity();
        }
      });
    }
  }

  updateTrip(): void {
    console.log('Form values before submission:', this.updateTripForm.value);
    
    if (this.updateTripForm.valid && this.specificTrip) {
      const updatedTrip = {
        ...this.specificTrip,
        ...this.updateTripForm.value
      };
      
      if (updatedTrip.passThroughLocation === '') {
        updatedTrip.passThroughLocation = undefined;
      }
      
      console.log('Sending updated trip data:', updatedTrip);
      
      this.specificTripService.updateTrip(updatedTrip).subscribe({
        next: () => {
          const modalElement = document.getElementById('updateTripModal');
          if (modalElement) {
            const updateModal = bootstrap.Modal.getInstance(modalElement);
            if (updateModal) {
              updateModal.hide();
            }
          }
          this.loadSpecificTripDetails(this.specificTrip!.id);
        },
        error: (err: any) => {
          console.error('Error updating trip', err);
          this.error = 'Failed to update trip. Please try again later.';
        }
      });
    } else {
      console.log('Form is invalid:', this.updateTripForm.errors);
    }
  }
  
  deleteTrip(): void {
    if (this.specificTrip) {
      this.specificTripService.deleteTrip(this.specificTrip.id).subscribe({
        next: () => {
          const modalElement = document.getElementById('deleteConfirmModal');
          if (modalElement) {
            const deleteModal = bootstrap.Modal.getInstance(modalElement);
            if (deleteModal) {
              deleteModal.hide();
            }
          }
          
          const modalBackdrops = document.querySelectorAll('.modal-backdrop');
          modalBackdrops.forEach(backdrop => {
            document.body.classList.remove('modal-open');
            backdrop.remove();
          });
          
          this.router.navigate(['/trips']);
        },
        error: (err: any) => {
          console.error('Error deleting trip', err);
          this.error = 'Failed to delete trip. Please try again later.';
        }
      });
    }
  }
}