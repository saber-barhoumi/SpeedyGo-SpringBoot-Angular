import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';
import { TunisiaRouteService, TouristAttraction } from 'src/app/FrontOffices/services/tunisia-route/tunisia-route.service';
import { SpecificTrip } from 'src/app/FrontOffices/models/specific-trip.model';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-specific-trip-detail',
  templateUrl: './specific-trip-detail.component.html',
  styleUrls: [
    './specific-trip-detail.component.css'
  ]
})
export class SpecificTripDetailComponent implements OnInit {
  specificTrip: (SpecificTrip & { expanded?: boolean }) | null = null;
  loading = true;
  mapLoading = true; 
  error: string | null = null;
  updateTripForm: FormGroup;
  governorates: string[] = [];
  governoratesLoading = false;

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
  googleMapsApiKey = environment.googleMapsApiKey;
  
  // Properties to store coordinates for Tunisia route analyzer
  startCoordinates: [number, number] | null = null;
  waypointCoordinates: [number, number] | null = null;
  endCoordinates: [number, number] | null = null;

  constructor(
    private route: ActivatedRoute, 
    private specificTripService: SpecificTripService, 
    private router: Router, 
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private tunisiaRouteService: TunisiaRouteService
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
        // Add expanded property to trip
        this.specificTrip = {
          ...data,
          expanded: false
        };
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
    this.governoratesLoading = true;

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

        // Use Tunisia Route Service for route analysis
        this.analyzeTunisiaRoute();
      } else {
        console.error('Directions request failed:', status);
        
        if (waypointLatLng) {
          this.routePath = [startLatLng, waypointLatLng, endLatLng];
        } else {
          this.routePath = [startLatLng, endLatLng];
        }

        // Use Tunisia Route Service for route analysis
        this.analyzeTunisiaRoute();
      }
      
      this.mapLoading = false;
    });
  }

  analyzeTunisiaRoute(): void {
    if (!this.startMarker || !this.endMarker) {
      console.error('Cannot analyze Tunisia route: Coordinates not available');
      return;
    }

    this.governoratesLoading = true;
    this.governorates = [];

    // Format coordinates as [lat, lng] tuples for Tunisia route analysis
    const pointA: [number, number] = [this.startMarker.position.lat, this.startMarker.position.lng];
    
    // If there's a waypoint, use it as pointB
    let pointB: [number, number];
    let pointC: [number, number];
    
    if (this.waypointMarker) {
      pointB = [this.waypointMarker.position.lat, this.waypointMarker.position.lng];
      pointC = [this.endMarker.position.lat, this.endMarker.position.lng];
    } else {
      // If no waypoint, calculate a middle point between start and end
      pointB = [
        (this.startMarker.position.lat + this.endMarker.position.lat) / 2,
        (this.startMarker.position.lng + this.endMarker.position.lng) / 2
      ];
      pointC = [this.endMarker.position.lat, this.endMarker.position.lng];
    }

    // Call the Tunisia Route Service to get governorates
    this.tunisiaRouteService.getTunisiaRouteGovernorates(pointA, pointB, pointC)
      .subscribe({
        next: (result) => {
          this.governorates = result;
          this.governoratesLoading = false;
        },
        error: (err) => {
          console.error('Error analyzing Tunisia route:', err);
          // Fallback to Google Maps geocoding method
          this.getGovernoratesFromGeocoding(
            this.specificTrip!.departureLocation, 
            this.specificTrip!.arrivalLocation,
            this.specificTrip!.passThroughLocation
          );
        }
      });
  }

  getGovernoratesFromGeocoding(departure: string, arrival: string, passThrough?: string): void {
    this.governoratesLoading = true;
    this.governorates = [];
    
    const geocoder = new google.maps.Geocoder();
    const promises: Promise<string>[] = [];
    
    // Get governorate for departure location
    promises.push(
      new Promise<string>((resolve) => {
        geocoder.geocode({ address: departure }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const governorate = this.extractGovernorateFromResults(results);
            resolve(governorate || '');
          } else {
            resolve('');
          }
        });
      })
    );
    
    // Get governorate for pass-through location if it exists
    if (passThrough) {
      promises.push(
        new Promise<string>((resolve) => {
          geocoder.geocode({ address: passThrough }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const governorate = this.extractGovernorateFromResults(results);
              resolve(governorate || '');
            } else {
              resolve('');
            }
          });
        })
      );
    }
    
    // Get governorate for arrival location
    promises.push(
      new Promise<string>((resolve) => {
        geocoder.geocode({ address: arrival }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const governorate = this.extractGovernorateFromResults(results);
            resolve(governorate || '');
          } else {
            resolve('');
          }
        });
      })
    );
    
    Promise.all(promises)
      .then(results => {
        // Filter out duplicates and undefined values
        this.governorates = [...new Set(results.filter(gov => gov))];
        this.governoratesLoading = false;
      })
      .catch(error => {
        console.error('Error getting governorates:', error);
        this.governoratesLoading = false;
      });
  }

  extractGovernorateFromResults(results: google.maps.GeocoderResult[]): string | null {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes('administrative_area_level_1')) {
          return component.long_name;
        }
      }
    }
    return null;
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

  /**
   * Opens the Tunisia Route Analyzer with the trip's coordinates
   */
  openTunisiaRouteAnalyzer(): void {
    if (!this.startMarker || !this.endMarker) {
      console.error('Cannot open Tunisia Route Analyzer: Coordinates not available');
      return;
    }

    // Format coordinates as [lat, lng] tuples for the Tunisia Route Analyzer
    const pointA: [number, number] = [this.startMarker.position.lat, this.startMarker.position.lng];
    
    // If there's a waypoint, use it as pointB
    let pointB: [number, number];
    let pointC: [number, number];
    
    if (this.waypointMarker) {
      pointB = [this.waypointMarker.position.lat, this.waypointMarker.position.lng];
      pointC = [this.endMarker.position.lat, this.endMarker.position.lng];
    } else {
      // If no waypoint, calculate a middle point between start and end
      pointB = [
        (this.startMarker.position.lat + this.endMarker.position.lat) / 2,
        (this.startMarker.position.lng + this.endMarker.position.lng) / 2
      ];
      pointC = [this.endMarker.position.lat, this.endMarker.position.lng];
    }

    // Navigate to Tunisia Route Analyzer with coordinates as query parameters
    this.router.navigate(['/tunisia-route'], {
      queryParams: {
        pointA: pointA.join(','),
        pointB: pointB.join(','),
        pointC: pointC.join(','),
        tripDescription: this.specificTrip?.description || 'Trip Route Analysis'
      }
    });
  }

  /**
   * Show tourist attractions for a selected governorate
   * @param governorateName The name of the governorate
   */
  showTouristAttractions(governorateName: string): void {
    // Create a loading modal first
    let modalElement = document.getElementById('touristAttractionsModal');
    
    if (!modalElement) {
      modalElement = document.createElement('div');
      modalElement.className = 'modal fade';
      modalElement.id = 'touristAttractionsModal';
      modalElement.setAttribute('tabindex', '-1');
      modalElement.setAttribute('aria-labelledby', 'touristAttractionsModalLabel');
      modalElement.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(modalElement);
    }
    
    // Set the loading content
    modalElement.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="touristAttractionsModalLabel">
              <i class="bi bi-geo-alt-fill me-2"></i>
              Tourist Attractions in ${governorateName}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading attractions...</span>
            </div>
            <p class="mt-3 text-primary">Finding tourist attractions for ${governorateName}...</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    // Show the loading modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Get tourist attractions for this governorate
    this.tunisiaRouteService.getTouristAttractions(governorateName).subscribe({
      next: (touristAttractions) => {
        // Create modal content with the received attractions
        let modalBody = '';
        
        if (touristAttractions.length > 0) {
          modalBody = `
            <div class="row row-cols-1 g-4">
              ${touristAttractions.map(attraction => `
                <div class="col">
                  <div class="card shadow-sm h-100 attraction-card hover-card">
                    <div class="row g-0 h-100">
                      ${attraction.image ? 
                        `<div class="col-md-4">
                          <div class="attraction-image" style="background-image: url('${attraction.image}'); height: 100%; min-height: 200px; background-size: cover; background-position: center; border-top-left-radius: 4px; border-bottom-left-radius: 4px;"></div>
                        </div>` : ''
                      }
                      <div class="col-md-${attraction.image ? '8' : '12'}">
                        <div class="card-body d-flex flex-column">
                          <div>
                            <h4 class="card-title fw-bold text-primary">${attraction.name}</h4>
                            ${attraction.rating ? 
                              `<div class="rating mb-2">
                                ${this.generateStarRating(attraction.rating)}
                                <span class="rating-value ms-2 badge bg-warning text-dark rounded-pill">${attraction.rating.toFixed(1)}</span>
                              </div>` : ''
                            }
                            <p class="card-text">${attraction.description}</p>
                          </div>
                          ${attraction.address ? 
                            `<div class="mt-auto">
                              <hr>
                              <p class="card-text text-muted mb-0">
                                <i class="bi bi-people-fill me-1"></i>${attraction.address}
                              </p>
                            </div>` : ''
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <style>
              .hover-card {
                transition: transform 0.3s, box-shadow 0.3s;
                cursor: pointer;
              }
              .hover-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
              }
              .rating {
                display: flex;
                align-items: center;
              }
              .attraction-card {
                border-radius: 8px;
                overflow: hidden;
                border: none;
              }
            </style>
          `;
        } else {
          modalBody = `
            <div class="text-center py-4">
              <i class="bi bi-geo-alt-fill text-muted fs-1 mb-3 d-block"></i>
              <p class="text-muted">No tourist attractions found for ${governorateName}.</p>
            </div>
          `;
        }
        
        // Update the modal content
        const modalBodyElement = modalElement?.querySelector('.modal-body');
        if (modalBodyElement) {
          modalBodyElement.innerHTML = modalBody;
        }
      },
      error: (err) => {
        console.error('Error fetching tourist attractions:', err);
        
        // Show error in modal
        const errorContent = `
          <div class="text-center py-5">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-4 d-block"></i>
            <h5 class="text-danger mb-3">Connection Error</h5>
            <p class="text-muted mb-4">Could not load tourist attractions for ${governorateName}.</p>
            <button class="btn btn-primary" onclick="window.open('https://www.google.com/search?q=tourist+attractions+in+${governorateName}+Tunisia', '_blank')">
              <i class="bi bi-search me-2"></i>Search on Google
            </button>
          </div>
        `;
        
        // Update the modal content
        const modalBodyElement = modalElement?.querySelector('.modal-body');
        if (modalBodyElement) {
          modalBodyElement.innerHTML = errorContent;
        }
      }
    });
  }
  
  /**
   * Generate HTML for star rating display
   * @param rating Rating value (0-5)
   * @returns HTML string with star icons
   */
  private generateStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    // Add half star if needed
    if (halfStar) {
      starsHtml += '<i class="bi bi-star-half text-warning"></i>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="bi bi-star text-warning"></i>';
    }
    
    return starsHtml;
  }

  // Toggle expanded state for trip cards
  toggleExpanded(): void {
    if (this.specificTrip) {
      this.specificTrip.expanded = !this.specificTrip.expanded;
    }
  }
  
  // Method to reload trip details
  reloadTripDetails(): void {
    if (this.specificTrip) {
      this.loading = true;
      this.error = null;
      this.loadSpecificTripDetails(this.specificTrip.id);
    }
  }
}