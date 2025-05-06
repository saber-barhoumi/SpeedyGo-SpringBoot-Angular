import { Component, OnInit, ViewChild, ElementRef, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import * as Ably from 'ably';
import { environment } from '../../../../../environments/environment';
import { RealtimeChannel } from 'ably';

// Interface for location coordinates
interface Location {
  lat: number;
  lng: number;
}

// Interface for driver location data
interface DriverLocation {
  userId: string;
  location: Location;
  timestamp: string;
  isDeliveryActive: boolean;
}

@Component({
  selector: 'app-traking',
  templateUrl: './traking.component.html',
  styleUrls: ['./traking.component.css']
})
export class TrakingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  map: google.maps.Map | null = null;
  currentMarker: any = null; // Using any to support both Marker and AdvancedMarkerElement
  currentLocation: Location | null = null;
  watchId: number | null = null;
  accuracyCircle: google.maps.Circle | null = null;
  
  // Status variables
  locationError: string | null = null;
  isLocating: boolean = false;
  retryCount: number = 0;
  maxRetries: number = 3;
  mapsLoaded: boolean = false;
  
  // Delivery driver specific properties
  isDeliveryUser: boolean = false;
  isDeliveryActive: boolean = false;
  userData: any = null;
  
  // Driver tracking for regular users
  deliveryDriverMarkers: Map<string, any> = new Map(); // Map of driver userId to marker
  activeDrivers: DriverLocation[] = [];
  
  // Ably related properties
  private ably: any = null; // Using 'any' to avoid TypeScript errors with Ably
  private locationChannel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private lastPublishedLocation: Location | null = null;
  private publishIntervalId: any = null;
  private readonly MIN_DISTANCE_TO_PUBLISH = 0.005; // approximately 5 meters
  private readonly PUBLISH_INTERVAL = 5000; // 5 seconds
  
  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    // Check if user is a delivery driver
    this.checkUserRole();
    
    // Load Google Maps API with proper async loading pattern
    this.loadGoogleMapsAPI();
    
    // Initialize Ably and get user ID
    this.initializeAbly();
  }

  // Check if user has delivery role
  checkUserRole(): void {
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        this.userData = JSON.parse(userDataStr);
        this.isDeliveryUser = this.userData && this.userData.role === 'DELEVERY';
        console.log('User role check:', this.isDeliveryUser ? 'Delivery driver' : 'Regular user');
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.isDeliveryUser = false;
    }
  }

  // Toggle delivery status
  toggleDeliveryStatus(): void {
    this.isDeliveryActive = !this.isDeliveryActive;
    
    if (this.isDeliveryActive) {
      console.log('Delivery tracking started for driver ID:', this.userData?.userId);
      // Start more frequent location publishing
      this.startDeliveryTracking();
    } else {
      console.log('Delivery tracking stopped');
      // Revert back to normal publishing interval
      this.stopDeliveryTracking();
    }
  }

  // Start more frequent location publishing for active delivery
  startDeliveryTracking(): void {
    // Clear existing interval
    if (this.publishIntervalId) {
      clearInterval(this.publishIntervalId);
    }
    
    // Set more frequent updates during active delivery
    this.publishIntervalId = setInterval(() => {
      if (this.currentLocation && this.locationChannel) {
        // For active delivery, always publish location regardless of distance change
        this.publishLocationData();
      }
    }, 3000); // More frequent updates (every 3 seconds)
  }

  // Stop frequent location publishing
  stopDeliveryTracking(): void {
    // Clear existing interval
    if (this.publishIntervalId) {
      clearInterval(this.publishIntervalId);
    }
    
    // Reset to normal publishing interval
    this.setupLocationPublishing();
  }

  // Publish location data directly
  publishLocationData(): void {
    if (!this.currentLocation || !this.locationChannel || !this.userId) return;
    
    // Prepare location data with user ID and delivery status
    const locationData = {
      userId: this.userId,
      location: this.currentLocation,
      timestamp: new Date().toISOString(),
      isDeliveryActive: this.isDeliveryActive
    };
    
    // Publish to Ably channel
    this.locationChannel.publish('location', locationData)
      .then(() => {
        console.log('Location published successfully:', locationData);
        
        // Update last published location
        if (this.currentLocation) {
          this.lastPublishedLocation = { ...this.currentLocation };
        }
      })
      .catch((err) => {
        console.error('Error publishing location to Ably:', err);
      });
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready if Maps API is already loaded
    if (this.mapsLoaded) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    // Clean up location watcher when component is destroyed
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    
    // Clean up Ably resources
    this.cleanupAbly();
  }

  loadGoogleMapsAPI(): void {
    // Check if script already exists
    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=weekly&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Define the global callback function that Google Maps will call
      (window as any).initMap = () => {
        this.ngZone.run(() => {
          this.mapsLoaded = true;
          if (this.mapElement && this.mapElement.nativeElement) {
            this.initMap();
          }
        });
      };
      
      document.head.appendChild(script);
    } else if ((window as any).google && (window as any).google.maps) {
      // Maps already loaded - initialize directly
      this.mapsLoaded = true;
      this.initMap();
    }
  }

  initMap(): void {
    if (!this.mapElement || !this.mapElement.nativeElement) {
      console.error('Map element not found');
      return;
    }
    
    // Default location (will be replaced by user's actual location)
    const defaultLocation = { lat: 36.8065, lng: 10.1815 }; // Default to Tunisia
    
    // Map styles (condensed for brevity)
    const mapStyles = [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "saturation": 36
          },
          {
            "color": "#333333"
          },
          {
            "lightness": 40
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#ffffff"
          },
          {
            "lightness": 16
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#fefefe"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#fefefe"
          },
          {
            "lightness": 17
          },
          {
            "weight": 1.2
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          },
          {
            "lightness": 21
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dedede"
          },
          {
            "lightness": 21
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#4e73df"
          },
          {
            "lightness": 60
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#4e73df"
          },
          {
            "lightness": 70
          },
          {
            "weight": 0.2
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#4e73df"
          },
          {
            "lightness": 65
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#4e73df"
          },
          {
            "lightness": 70
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f2f2f2"
          },
          {
            "lightness": 19
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c2d8f9"
          },
          {
            "lightness": 17
          }
        ]
      }
    ];
    
    // Create map with advanced styling
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControl: true,
      styles: mapStyles,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_LEFT
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      }
    });
    
    // Add initial marker to show default location
    this.addDefaultMarker(defaultLocation);
    
    // Start tracking the user's location
    this.trackLocation();

    // Add a button to request location permission
    const locationButton = document.createElement("button");
    locationButton.textContent = "Get My Location";
    locationButton.classList.add("custom-map-control-button");
    locationButton.setAttribute("style", 
      "background-color: #fff; border: 0; border-radius: 2px; box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3); margin: 10px; padding: 10px; font-family: Roboto, sans-serif; font-size: 16px; cursor: pointer;");
    
    locationButton.addEventListener("click", () => {
      this.resetAndTrackLocation();
    });

    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  }

  async addDefaultMarker(location: Location): Promise<void> {
    if (!this.map) return;
    
    // Check if AdvancedMarkerElement exists in the loaded API
    if ((window as any).google?.maps?.marker?.AdvancedMarkerElement) {
      try {
        // Using the modern AdvancedMarkerElement
        const { AdvancedMarkerElement } = (window as any).google.maps.marker;
        
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'default-marker';
        markerElement.innerHTML = `
          <div style="width: 20px; height: 20px; background-color: #9e9e9e; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        `;
        
        this.currentMarker = new AdvancedMarkerElement({
          map: this.map,
          position: location,
          title: 'Default location (Tunisia)',
          content: markerElement
        });
        
        // Add info window to show this is not the actual location
        const infoWindow = new google.maps.InfoWindow({
          content: '<div style="padding: 10px;"><strong>Default Location</strong><br>This is not your actual location.<br>Please click "Get My Location" or allow location access when prompted.</div>'
        });
        
        // Add click listener for info window
        (this.currentMarker as any).addListener('click', () => {
          infoWindow.open(this.map, this.currentMarker);
        });
        
        // Open info window initially
        infoWindow.open(this.map, this.currentMarker);
        
        // Close info window after 8 seconds
        setTimeout(() => {
          infoWindow.close();
        }, 8000);
        
      } catch (error) {
        console.warn('Error creating AdvancedMarkerElement, falling back to legacy Marker', error);
        this.addLegacyMarker(location);
      }
    } else {
      // Fallback to legacy marker if AdvancedMarkerElement is not available
      this.addLegacyMarker(location);
    }
  }
  
  addLegacyMarker(location: Location): void {
    if (!this.map) return;
    
    // Using legacy marker with warning suppression
    console.warn('Using legacy Google Maps Marker. Consider upgrading to AdvancedMarkerElement in the future.');
    
    this.currentMarker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Default location (Tunisia)',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#9e9e9e',
        fillOpacity: 0.7,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10
      }
    });
    
    // Add info window to show this is not the actual location
    const infoWindow = new google.maps.InfoWindow({
      content: '<div style="padding: 10px;"><strong>Default Location</strong><br>This is not your actual location.<br>Please click "Get My Location" or allow location access when prompted.</div>'
    });
    
    infoWindow.open(this.map, this.currentMarker);
    
    // Close info window after 8 seconds
    setTimeout(() => {
      infoWindow.close();
    }, 8000);
  }

  resetAndTrackLocation(): void {
    this.retryCount = 0;
    this.trackLocation();
  }

  trackLocation(): void {
    if (navigator.geolocation) {
      this.isLocating = true;
      this.locationError = null;
      
      // First try with low timeout but high accuracy
      this.tryGetLocation(true);
    } else {
      this.locationError = "Geolocation is not supported by this browser.";
      console.error(this.locationError);
    }
  }

  tryGetLocation(highAccuracy: boolean): void {
    const timeoutDuration = highAccuracy ? 10000 : 30000;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.ngZone.run(() => {
          this.handleLocationSuccess(position);
        });
      },
      (error) => {
        this.ngZone.run(() => {
          // If high accuracy failed and we haven't tried low accuracy yet
          if (highAccuracy && error.code === error.TIMEOUT) {
            console.log('High accuracy location timed out. Trying with low accuracy...');
            this.tryGetLocation(false);
          } else {
            this.handleLocationError(error);
          }
        });
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: timeoutDuration,
        maximumAge: highAccuracy ? 0 : 60000 // Allow cached positions for low accuracy
      }
    );
  }

  async handleLocationSuccess(position: GeolocationPosition): Promise<void> {
    this.isLocating = false;
    this.retryCount = 0;
    
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    this.currentLocation = location;
    this.locationError = null;
    
    console.log('Location successfully updated:', location);
    
    if (this.map) {
      // Center map on the new location
      this.map.setCenter(location);
      
      // Update or create marker based on the API version available
      await this.updateOrCreateLocationMarker(location, position.coords.accuracy);
      
      // Now set up continuous watching with relaxed parameters
      this.setupContinuousTracking();
    }
  }
  
  async updateOrCreateLocationMarker(location: Location, accuracy: number): Promise<void> {
    if (!this.map) return;
    
    // Check if we can use AdvancedMarkerElement
    if ((window as any).google?.maps?.marker?.AdvancedMarkerElement) {
      const { AdvancedMarkerElement } = (window as any).google.maps.marker;
      
      // Create a pulsing dot marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'location-marker';
      markerElement.innerHTML = `
        <div class="marker-pulse" style="
          width: 20px;
          height: 20px;
          background-color: #4e73df;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(78, 115, 223, 0.8);
          animation: pulse 1.5s infinite;
        "></div>
      `;
      
      // Create or update advanced marker
      if (this.currentMarker) {
        try {
          // Update position if it's an AdvancedMarkerElement
          if (this.currentMarker instanceof AdvancedMarkerElement) {
            this.currentMarker.position = location;
            this.currentMarker.content = markerElement;
          } else {
            // Remove legacy marker and create new advanced marker
            if ('setMap' in this.currentMarker) {
              this.currentMarker.setMap(null);
            }
            
            this.currentMarker = new AdvancedMarkerElement({
              map: this.map,
              position: location,
              title: 'Your current location',
              content: markerElement
            });
          }
        } catch (error) {
          console.warn('Error updating AdvancedMarkerElement, falling back to legacy Marker', error);
          this.updateLegacyMarker(location);
        }
      } else {
        try {
          // Create new advanced marker
          this.currentMarker = new AdvancedMarkerElement({
            map: this.map,
            position: location,
            title: 'Your current location',
            content: markerElement
          });
        } catch (error) {
          console.warn('Error creating AdvancedMarkerElement, falling back to legacy Marker', error);
          this.updateLegacyMarker(location);
        }
      }
    } else {
      // Use legacy marker if advanced markers not available
      this.updateLegacyMarker(location);
    }
    
    // Update or create accuracy circle
    if (this.accuracyCircle) {
      this.accuracyCircle.setCenter(location);
      this.accuracyCircle.setRadius(accuracy);
    } else {
      this.accuracyCircle = new google.maps.Circle({
        strokeColor: '#4e73df',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4e73df',
        fillOpacity: 0.1,
        map: this.map,
        center: location,
        radius: accuracy
      });
    }
  }
  
  updateLegacyMarker(location: Location): void {
    if (!this.map) return;
    
    console.warn('Using legacy Google Maps Marker. Consider upgrading to AdvancedMarkerElement in the future.');
    
    if (this.currentMarker && 'setPosition' in this.currentMarker) {
      // Remove old marker animations if they exist
      if ('getAnimation' in this.currentMarker) {
        const existingAnimation = this.currentMarker.getAnimation();
        if (existingAnimation !== null) {
          this.currentMarker.setAnimation(null);
        }
      }
      
      // Update position
      this.currentMarker.setPosition(location);
      
      // Update icon to blue (from gray if it was default)
      if ('setIcon' in this.currentMarker) {
        this.currentMarker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4e73df',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10
        });
      }
      
      // Add drop animation
      if ('setAnimation' in this.currentMarker) {
        this.currentMarker.setAnimation(google.maps.Animation.DROP);
      }
    } else {
      // Create new marker if none exists or if current marker is incompatible
      if (this.currentMarker && 'setMap' in this.currentMarker) {
        this.currentMarker.setMap(null);
      }
      
      this.currentMarker = new google.maps.Marker({
        position: location,
        map: this.map,
        title: 'Your current location',
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4e73df',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10
        }
      });
      
      // Add a pulsing animation effect to the marker
      this.animateMarker();
    }
  }

  setupContinuousTracking(): void {
    // Clear any existing watch
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    
    // Set up watching with more relaxed parameters
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.ngZone.run(() => {
          this.updateLocationSilently(position);
        });
      },
      (error) => {
        // Just log watch errors, don't display to user unless it persists
        console.warn('Watch position error:', error.message);
      },
      {
        enableHighAccuracy: false, // Less battery drain
        timeout: 30000,
        maximumAge: 60000 // Accept positions up to 1 minute old
      }
    );
  }

  async updateLocationSilently(position: GeolocationPosition): Promise<void> {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    this.currentLocation = location;
    
    if (this.map) {
      // Update marker position
      await this.updateMarkerPosition(location);
      
      // Only center map if the position has changed significantly (more than 50 meters)
      const lastCenter = this.map.getCenter();
      if (lastCenter) {
        const lastPos = { lat: lastCenter.lat(), lng: lastCenter.lng() };
        if (this.calculateDistance(lastPos, location) > 0.05) {
          this.map.panTo(location);
        }
      }
      
      // Update accuracy circle
      if (this.accuracyCircle) {
        this.accuracyCircle.setCenter(location);
        this.accuracyCircle.setRadius(position.coords.accuracy);
      }
    }
  }
  
  async updateMarkerPosition(location: Location): Promise<void> {
    if (!this.currentMarker) return;
    
    try {
      // Handle AdvancedMarkerElement
      if ((window as any).google?.maps?.marker?.AdvancedMarkerElement && 
          this.currentMarker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
        this.currentMarker.position = location;
      } 
      // Handle legacy Marker
      else if ('setPosition' in this.currentMarker) {
        this.currentMarker.setPosition(location);
      }
    } catch (error) {
      console.warn('Error updating marker position:', error);
    }
  }

  calculateDistance(p1: Location, p2: Location): number {
    // Simple distance calculation in km using the Haversine formula
    const toRad = (value: number) => value * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lng - p1.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  animateMarker(): void {
    if (!this.currentMarker || !('getIcon' in this.currentMarker)) return;
    
    try {
      if (this.currentMarker.getIcon && typeof this.currentMarker.getIcon() !== 'string') {
        // Set up interval for pulsing effect
        const pulseInterval = setInterval(() => {
          if (!this.currentMarker || !('getIcon' in this.currentMarker)) {
            clearInterval(pulseInterval);
            return;
          }
          
          const icon = this.currentMarker.getIcon() as google.maps.Symbol;
          if (icon) {
            icon.scale = icon.scale === 10 ? 12 : 10;
            this.currentMarker.setIcon(icon);
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('Error animating marker:', error);
    }
  }

  handleLocationError(error: GeolocationPositionError): void {
    this.isLocating = false;
    this.retryCount++;
    
    // Prepare error message
    let errorMessage = "";
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "User denied the request for geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "The request to get user location timed out.";
        
        // Auto-retry for timeouts, but only up to maxRetries
        if (this.retryCount < this.maxRetries) {
          console.log(`Location timeout. Automatic retry ${this.retryCount} of ${this.maxRetries}...`);
          setTimeout(() => {
            this.tryGetLocation(false); // Try again with low accuracy
          }, 2000);
          errorMessage += " Retrying...";
          this.isLocating = true;
        }
        break;
      default:
        errorMessage = "An unknown error occurred.";
        break;
    }
    
    // Only update UI error if we're not retrying or we've exhausted retries
    if (!this.isLocating) {
      this.locationError = errorMessage;
    }
    
    console.error('Geolocation error:', errorMessage);
  }

  initializeAbly(): void {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      
      if (userData) {
        // Parse the JSON string to an object
        const userObj = JSON.parse(userData);
        this.userId = userObj.userId?.toString();
      }
      
      if (!this.userId) {
        console.warn('User ID not found in localStorage. Using anonymous ID.');
        this.userId = 'anonymous-' + new Date().getTime();
      }
      
      // Initialize Ably client with the promises-based API
      this.ably = new Ably.Realtime({ key: environment.ablyApiKey });
      
      // Set up channel for location updates
      this.locationChannel = this.ably.channels.get('location-updates');
      
      // Set up interval for publishing location (if significant movement detected)
      this.setupLocationPublishing();
      
      // If not a delivery user, subscribe to location updates from delivery drivers
      if (!this.isDeliveryUser) {
        this.subscribeToDriverLocations();
      }
      
      console.log('Ably initialized successfully with user ID:', this.userId);
    } catch (error) {
      console.error('Error initializing Ably:', error);
    }
  }
  
  // Set up interval for publishing location
  setupLocationPublishing(): void {
    // Clear any existing interval
    if (this.publishIntervalId) {
      clearInterval(this.publishIntervalId);
      this.publishIntervalId = null;
    }
    
    // Set up interval for regular location publishing
    this.publishIntervalId = setInterval(() => {
      if (this.currentLocation && this.locationChannel) {
        // For normal publishing, only send if position changed significantly
        this.publishLocationIfChanged();
      }
    }, this.PUBLISH_INTERVAL);
    
    console.log('Location publishing interval set up. Interval:', this.PUBLISH_INTERVAL, 'ms');
  }

  // Publish location data if it has changed significantly
  publishLocationIfChanged(): void {
    if (!this.currentLocation || !this.locationChannel || !this.userId) return;
    
    // Check if location has changed significantly since last publish
    if (!this.lastPublishedLocation || 
        this.calculateDistance(this.currentLocation, this.lastPublishedLocation) > this.MIN_DISTANCE_TO_PUBLISH) {
      
      // Use the publishLocationData method to ensure consistent data format
      this.publishLocationData();
    }
  }

  // Subscribe to delivery driver location updates (for non-delivery users)
  subscribeToDriverLocations(): void {
    if (!this.locationChannel) return;
    
    console.log('Subscribing to delivery driver location updates...');
    
    this.locationChannel.subscribe('location', (message) => {
      this.ngZone.run(() => {
        const driverData = message.data as DriverLocation;
        
        // Only process if it's a delivery driver with active status
        if (driverData && driverData.isDeliveryActive) {
          console.log('Received driver location update:', driverData);
          
          // Update or add to active drivers array
          const driverIndex = this.activeDrivers.findIndex(d => d.userId === driverData.userId);
          
          if (driverIndex >= 0) {
            // Update existing driver data
            this.activeDrivers[driverIndex] = driverData;
          } else {
            // Add new driver
            this.activeDrivers.push(driverData);
          }
          
          // Update marker on map
          this.updateDriverMarker(driverData);
        }
      });
    });
  }
  
  // Update or create a marker for a delivery driver
  updateDriverMarker(driverData: DriverLocation): void {
    if (!this.map) return;
    
    // Check if we already have a marker for this driver
    const existingMarker = this.deliveryDriverMarkers.get(driverData.userId);
    
    if (existingMarker) {
      // Update existing marker
      try {
        if ((window as any).google?.maps?.marker?.AdvancedMarkerElement && 
            existingMarker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
          existingMarker.position = driverData.location;
        } else if ('setPosition' in existingMarker) {
          existingMarker.setPosition(driverData.location);
        }
      } catch (error) {
        console.warn('Error updating driver marker:', error);
      }
    } else {
      // Create a new marker for this driver
      this.createDriverMarker(driverData);
    }
  }
  
  // Create a new marker for a delivery driver
  createDriverMarker(driverData: DriverLocation): void {
    if (!this.map) return;
    
    // Check if AdvancedMarkerElement exists in the loaded API
    if ((window as any).google?.maps?.marker?.AdvancedMarkerElement) {
      try {
        // Using the modern AdvancedMarkerElement
        const { AdvancedMarkerElement } = (window as any).google.maps.marker;
        
        // Create marker element for delivery driver (red color)
        const markerElement = document.createElement('div');
        markerElement.className = 'driver-marker';
        markerElement.innerHTML = `
          <div style="
            width: 22px; 
            height: 22px; 
            background-color: #e74a3b; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 8px rgba(231, 74, 59, 0.8);
            animation: pulse 1.5s infinite;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -25px;
              left: 50%;
              transform: translateX(-50%);
              background-color: rgba(0,0,0,0.7);
              color: white;
              padding: 3px 6px;
              border-radius: 3px;
              font-size: 10px;
              white-space: nowrap;
            ">Delivery Driver</div>
          </div>
        `;
        
        const driverMarker = new AdvancedMarkerElement({
          map: this.map,
          position: driverData.location,
          title: 'Delivery Driver',
          content: markerElement
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h4 style="margin-top: 0;">Delivery Driver</h4>
              <p style="margin-bottom: 5px;"><strong>Driver ID:</strong> ${driverData.userId}</p>
              <p style="margin-bottom: 5px;"><strong>Status:</strong> Active</p>
              <p style="margin-bottom: 0;"><strong>Last update:</strong> ${new Date(driverData.timestamp).toLocaleTimeString()}</p>
            </div>
          `
        });
        
        // Add click listener for info window
        (driverMarker as any).addListener('click', () => {
          infoWindow.open(this.map, driverMarker);
        });
        
        // Store the marker reference
        this.deliveryDriverMarkers.set(driverData.userId, driverMarker);
        
      } catch (error) {
        console.warn('Error creating AdvancedMarkerElement for driver, falling back to legacy Marker', error);
        this.createLegacyDriverMarker(driverData);
      }
    } else {
      // Fallback to legacy marker if AdvancedMarkerElement is not available
      this.createLegacyDriverMarker(driverData);
    }
  }
  
  // Create a legacy marker for delivery driver
  createLegacyDriverMarker(driverData: DriverLocation): void {
    if (!this.map) return;
    
    console.warn('Using legacy Google Maps Marker for driver. Consider upgrading to AdvancedMarkerElement in the future.');
    
    const driverMarker = new google.maps.Marker({
      position: driverData.location,
      map: this.map,
      title: 'Delivery Driver',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#e74a3b',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 12
      },
      label: {
        text: 'D',
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 'bold'
      }
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h4 style="margin-top: 0;">Delivery Driver</h4>
          <p style="margin-bottom: 5px;"><strong>Driver ID:</strong> ${driverData.userId}</p>
          <p style="margin-bottom: 5px;"><strong>Status:</strong> Active</p>
          <p style="margin-bottom: 0;"><strong>Last update:</strong> ${new Date(driverData.timestamp).toLocaleTimeString()}</p>
        </div>
      `
    });
    
    // Add click listener
    driverMarker.addListener('click', () => {
      infoWindow.open(this.map, driverMarker);
    });
    
    // Store the marker reference
    this.deliveryDriverMarkers.set(driverData.userId, driverMarker);
  }
  
  // Clean up resources when component is destroyed
  cleanupAbly(): void {
    // Clear publishing interval
    if (this.publishIntervalId) {
      clearInterval(this.publishIntervalId);
      this.publishIntervalId = null;
    }
    
    // Clean up driver markers
    this.deliveryDriverMarkers.forEach(marker => {
      if (marker) {
        if ((window as any).google?.maps?.marker?.AdvancedMarkerElement && 
            marker instanceof (window as any).google.maps.marker.AdvancedMarkerElement) {
          marker.map = null;
        } else if ('setMap' in marker) {
          marker.setMap(null);
        }
      }
    });
    this.deliveryDriverMarkers.clear();
    
    // Close Ably connection
    if (this.ably) {
      this.ably.close();
      this.ably = null;
      this.locationChannel = null;
    }
  }
}
