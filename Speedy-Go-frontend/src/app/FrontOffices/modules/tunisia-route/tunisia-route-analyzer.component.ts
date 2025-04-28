import { Component, OnInit, OnDestroy } from '@angular/core';
import { TunisiaRouteService } from '../../services/tunisia-route/tunisia-route.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tunisia-route-analyzer',
  templateUrl: './tunisia-route-analyzer.component.html',
  styleUrls: ['./tunisia-route-analyzer.component.css']
})
export class TunisiaRouteAnalyzerComponent implements OnInit, OnDestroy {
  // Default coordinates for Tunisia routes (will be overridden by query params if available)
  pointA: [number, number] = [36.8065, 10.1815]; // Tunis area
  pointB: [number, number] = [35.8256, 10.6084]; // Sousse area
  pointC: [number, number] = [33.8869, 9.5375];  // Southern Tunisia

  tripDescription: string = 'Tunisia Route Analysis';
  governorates: string[] = [];
  loading: boolean = false;
  error: string | null = null;
  apiKeyError: boolean = false;
  mapError: boolean = false;
  
  // Define the Google Maps API key directly from environment
  private googleMapsApiKey = environment.googleMapsApiKey;
  private destroy$ = new Subject<void>();

  constructor(
    private tunisiaRouteService: TunisiaRouteService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get coordinates from query parameters if available
    this.route.queryParams.subscribe(params => {
      if (params['pointA'] && params['pointB'] && params['pointC']) {
        try {
          // Parse the coordinates from query parameters (format: "lat,lng")
          this.pointA = params['pointA'].split(',').map(Number) as [number, number];
          this.pointB = params['pointB'].split(',').map(Number) as [number, number];
          this.pointC = params['pointC'].split(',').map(Number) as [number, number];
          
          // Get trip description if available
          if (params['tripDescription']) {
            this.tripDescription = params['tripDescription'];
          }
          
          // Log the received coordinates for debugging
          console.log('Route coordinates received:', {
            pointA: this.pointA,
            pointB: this.pointB,
            pointC: this.pointC,
            description: this.tripDescription
          });
        } catch (error) {
          console.error('Error parsing coordinates from query params:', error);
          // Keep default coordinates if parsing fails
        }
      }
      
      // Start route analysis with the coordinates (default or from query params)
      this.analyzeRoute();
    });

    // Add error listener for iframe load failures
    window.addEventListener('error', this.handleResourceError, true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('error', this.handleResourceError, true);
  }

  private handleResourceError = (event: ErrorEvent | Event) => {
    // Check if it's a script or resource error related to Google Maps
    const target = event.target;
    if (target) {
      if (target instanceof HTMLScriptElement && target.src && target.src.includes('google')) {
        this.mapError = true;
      } else if (target instanceof HTMLIFrameElement && target.src && target.src.includes('google')) {
        this.mapError = true;
      }
    }
  };

  analyzeRoute(): void {
    this.loading = true;
    this.error = null;
    this.governorates = [];

    this.tunisiaRouteService.getTunisiaRouteGovernorates(
      this.pointA,
      this.pointB,
      this.pointC
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.governorates = result;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error analyzing route:', err);
        if (err.status === 403 || 
            (err.error && err.error.error === 'API key not authorized')) {
          this.apiKeyError = true;
          this.error = 'API key authorization error. The map may not display correctly.';
        } else {
          this.error = 'Failed to analyze the route. Please try again later.';
        }
        this.loading = false;
        
        // Fallback to static Tunisia governorates for this specific route
        this.useStaticGovernorates();
      }
    });
  }

  getStaticMapUrl(): SafeResourceUrl {
    // Using a static map image instead of an interactive map to avoid API key issues
    const width = 600;
    const height = 400;
    const zoom = 7;
    
    // Format markers for the static map
    const markers = [
      `color:green|label:A|${this.pointA[0]},${this.pointA[1]}`,
      `color:blue|label:B|${this.pointB[0]},${this.pointB[1]}`,
      `color:red|label:C|${this.pointC[0]},${this.pointC[1]}`
    ].join('&markers=');
    
    // Get center point (average of all coordinates)
    const centerLat = (this.pointA[0] + this.pointB[0] + this.pointC[0]) / 3;
    const centerLng = (this.pointA[1] + this.pointB[1] + this.pointC[1]) / 3;
    
    // Create static map URL
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=${width}x${height}&markers=${markers}&key=${this.googleMapsApiKey}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  getMapUrl(): SafeResourceUrl {
    try {
      // Format coordinates for the Google Maps embed URL
      const origin = `${this.pointA[0]},${this.pointA[1]}`;
      const destination = `${this.pointC[0]},${this.pointC[1]}`;
      const waypoint = `${this.pointB[0]},${this.pointB[1]}`;
      
      // Create Google Maps directions URL
      const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${this.googleMapsApiKey}&origin=${origin}&destination=${destination}&waypoints=${waypoint}&mode=driving`;
      
      // Sanitize URL for security
      return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    } catch (error) {
      console.error('Error creating map URL:', error);
      this.mapError = true;
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
  }
  
  /**
   * Fallback method for the specific Tunisia route
   */
  private useStaticGovernorates(): void {
    // Known governorates for this specific route (Tunis to Sousse to Southern Tunisia)
    this.governorates = [
      'Tunis', 
      'Ben Arous', 
      'Zaghouan', 
      'Sousse', 
      'Kairouan', 
      'Sidi Bouzid', 
      'Gafsa'
    ];
  }

  /**
   * Open the route in Google Maps website
   */
  openInGoogleMaps(): void {
    const origin = `${this.pointA[0]},${this.pointA[1]}`;
    const destination = `${this.pointC[0]},${this.pointC[1]}`;
    const waypoint = `${this.pointB[0]},${this.pointB[1]}`;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoint}&travelmode=driving`;
    window.open(url, '_blank');
  }
}