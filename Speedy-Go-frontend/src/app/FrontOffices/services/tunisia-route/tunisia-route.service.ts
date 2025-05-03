import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TouristPlace } from '../../models/tourist-place.model';

export interface TouristAttraction {
  name: string;
  description: string;
  rating?: number;
  address?: string;
  image?: string;
}

export interface GovernorateInfo {
  name: string;
  lat: number;
  lng: number;
  touristAttractions?: TouristAttraction[];
}

@Injectable({
  providedIn: 'root'
})
export class TunisiaRouteService {
  private readonly googleMapsApiKey = environment.googleMapsApiKey;
  
  private tunisianGovernorates: GovernorateInfo[] = [
    { 
      name: 'Tunis', 
      lat: 36.8008, 
      lng: 10.1800,
      touristAttractions: [
        { 
          name: 'Medina of Tunis', 
          description: 'UNESCO World Heritage Site featuring narrow streets, colorful markets, and historic mosques.',
          rating: 4.7
        },
        { 
          name: 'Bardo Museum', 
          description: 'One of the most important museums in the Mediterranean, housing one of the world\'s largest collections of Roman mosaics.',
          rating: 4.6
        },
        { 
          name: 'Carthage Ruins', 
          description: 'Ancient ruins of the great Carthaginian and Roman city, featuring baths, villas, and an amphitheater.',
          rating: 4.5
        }
      ]
    },
    { 
      name: 'Ariana', 
      lat: 36.8625, 
      lng: 10.1956,
      touristAttractions: [
        { 
          name: 'Ariana Museum', 
          description: 'Museum dedicated to Tunisian ceramic art, featuring a beautiful collection of pottery.',
          rating: 4.3
        },
        { 
          name: 'Sidi Bou Said', 
          description: 'A picturesque blue and white village overlooking the Mediterranean.',
          rating: 4.8
        },
        { 
          name: 'Ennejma Ezzahra Palace', 
          description: 'Historic palace with stunning architecture and gardens.',
          rating: 4.2
        }
      ]
    },
    { 
      name: 'Ben Arous', 
      lat: 36.7533, 
      lng: 10.2311,
      touristAttractions: [
        { 
          name: 'Hammam Lif Beach', 
          description: 'Popular beach resort area with thermal springs.',
          rating: 4.0
        },
        { 
          name: 'Rades Olympic Stadium', 
          description: 'Tunisia\'s largest sports stadium hosting major sporting events.',
          rating: 4.1
        },
        {
          name: 'Borj Cedria',
          description: 'Peaceful coastal town with beautiful beaches and research centers.',
          rating: 3.9
        }
      ]
    },
    { 
      name: 'Manouba', 
      lat: 36.8081, 
      lng: 10.0863,
      touristAttractions: [
        { 
          name: 'Manouba Palace', 
          description: 'Historic palace with beautiful architecture from the Ottoman period.',
          rating: 4.2
        },
        { 
          name: 'Odhna Roman Site', 
          description: 'Ancient Roman ruins with well-preserved mosaics and structures.',
          rating: 4.0
        }
      ]
    },
    { 
      name: 'Nabeul', 
      lat: 36.4513, 
      lng: 10.7356,
      touristAttractions: [
        { 
          name: 'Nabeul Beach', 
          description: 'Beautiful sandy beach with clear waters and water sports.',
          rating: 4.5
        },
        { 
          name: 'Nabeul Market', 
          description: 'Famous pottery market with traditional Tunisian ceramics and crafts.',
          rating: 4.3
        },
        { 
          name: 'Archaeological Museum of Nabeul', 
          description: 'Museum showcasing the region\'s rich history with Roman artifacts.',
          rating: 4.1
        }
      ]
    },
    { 
      name: 'Zaghouan', 
      lat: 36.4028, 
      lng: 10.1433,
      touristAttractions: [
        { 
          name: 'Temple of Waters', 
          description: 'Roman temple and the starting point of an ancient aqueduct to Carthage.',
          rating: 4.6
        },
        { 
          name: 'Zaghouan Mountain', 
          description: 'Impressive mountain with hiking trails and panoramic views.',
          rating: 4.4
        },
        { 
          name: 'Zriba Old Village', 
          description: 'Abandoned Andalusian village with traditional architecture.',
          rating: 4.2
        }
      ]
    },
    { 
      name: 'Bizerte', 
      lat: 37.2744, 
      lng: 9.8739,
      touristAttractions: [
        { 
          name: 'Old Port of Bizerte', 
          description: 'Charming port area with fishing boats and waterfront restaurants.',
          rating: 4.4
        },
        { 
          name: 'Bizerte Beach', 
          description: 'Long sandy beach with clear waters and water sports.',
          rating: 4.3
        },
        { 
          name: 'Oceanographic Museum', 
          description: 'Museum dedicated to marine life with aquariums and exhibits.',
          rating: 4.0
        }
      ]
    },
    { 
      name: 'Sousse', 
      lat: 35.8333, 
      lng: 10.6333,
      touristAttractions: [
        { 
          name: 'Medina of Sousse', 
          description: 'UNESCO World Heritage Site with ancient walls, souks, and the Great Mosque.',
          rating: 4.7
        },
        { 
          name: 'Ribat of Sousse', 
          description: 'Ancient fortress offering panoramic views of the city and the Mediterranean.',
          rating: 4.5
        },
        { 
          name: 'Port El Kantaoui', 
          description: 'Beautiful marina and tourist complex with beaches, golf courses, and restaurants.',
          rating: 4.6
        }
      ]
    },
    { 
      name: 'Monastir', 
      lat: 35.7633, 
      lng: 10.8258,
      touristAttractions: [
        { 
          name: 'Ribat of Monastir', 
          description: 'Impressive 8th-century Islamic fortress used in several movies.',
          rating: 4.6
        },
        { 
          name: 'Habib Bourguiba Mausoleum', 
          description: 'Magnificent mausoleum dedicated to Tunisia\'s first president.',
          rating: 4.5
        },
        { 
          name: 'Monastir Marina', 
          description: 'Beautiful marina with yachts, restaurants, and shops.',
          rating: 4.3
        }
      ]
    },
    { 
      name: 'Mahdia', 
      lat: 35.5047, 
      lng: 11.0622,
      touristAttractions: [
        { 
          name: 'Cape Africa', 
          description: 'Historic cape with lighthouse and panoramic views.',
          rating: 4.4
        },
        { 
          name: 'Mahdia Beaches', 
          description: 'Beautiful golden sand beaches with clear blue waters.',
          rating: 4.7
        },
        { 
          name: 'Fatimid Port', 
          description: 'Historic port with ancient walls and gates.',
          rating: 4.2
        }
      ]
    },
    { 
      name: 'Kairouan', 
      lat: 35.6781, 
      lng: 10.0986,
      touristAttractions: [
        { 
          name: 'Great Mosque of Kairouan', 
          description: 'One of the most important mosques in Islamic history and a UNESCO World Heritage Site.',
          rating: 4.8
        },
        { 
          name: 'Medina of Kairouan', 
          description: 'Historic old town with traditional markets and architecture.',
          rating: 4.6
        },
        { 
          name: 'Aghlabid Basins', 
          description: 'Ancient water reservoirs built in the 9th century.',
          rating: 4.4
        }
      ]
    },
    { 
      name: 'Sfax', 
      lat: 34.7406, 
      lng: 10.7603,
      touristAttractions: [
        { 
          name: 'Medina of Sfax', 
          description: 'Well-preserved walled old town with authentic markets and architecture.',
          rating: 4.3
        },
        { 
          name: 'Kerkennah Islands', 
          description: 'Archipelago with traditional fishing villages and beautiful beaches.',
          rating: 4.5
        },
        { 
          name: 'Archaeological Museum of Sfax', 
          description: 'Museum with Roman mosaics and artifacts from the region.',
          rating: 4.1
        }
      ]
    },
    { 
      name: 'Gafsa', 
      lat: 34.4250, 
      lng: 8.7847,
      touristAttractions: [
        { 
          name: 'Gafsa Oasis', 
          description: 'Beautiful natural oasis with palms and natural pools.',
          rating: 4.2
        },
        { 
          name: 'Roman Swimming Pool', 
          description: 'Ancient Roman pool still filled with natural spring water.',
          rating: 4.4
        },
        { 
          name: 'Gafsa Mining Basin', 
          description: 'Historic phosphate mining area with unique industrial heritage.',
          rating: 3.8
        }
      ]
    },
    { 
      name: 'Tozeur', 
      lat: 33.9197, 
      lng: 8.1335,
      touristAttractions: [
        { 
          name: 'Tozeur Oasis', 
          description: 'Spectacular palm grove oasis with over 200 springs.',
          rating: 4.7
        },
        { 
          name: 'Chebika Mountain Oasis', 
          description: 'Mountain oasis with waterfalls and stunning desert views.',
          rating: 4.6
        },
        { 
          name: 'Star Wars Film Set', 
          description: 'Film locations used in the Star Wars movies.',
          rating: 4.5
        }
      ]
    },
    { 
      name: 'Tataouine', 
      lat: 32.9297, 
      lng: 10.4517,
      touristAttractions: [
        { 
          name: 'Ksar Ouled Soltane', 
          description: 'Well-preserved ancient Berber granary with distinctive architecture.',
          rating: 4.6
        },
        { 
          name: 'Chenini Village', 
          description: 'Ancient Berber village built into the mountainside.',
          rating: 4.5
        },
        { 
          name: 'Ksar Hadada', 
          description: 'Ancient granary that was used as a Star Wars filming location.',
          rating: 4.3
        }
      ]
    }
  ];

  private knownRoutes: { [key: string]: string[] } = {
    '36.8065,10.1815-35.8256,10.6084-33.8869,9.5375': [
      'Tunis', 'Ben Arous', 'Zaghouan', 'Sousse', 'Kairouan', 'Sidi Bouzid', 'Gafsa'
    ]
  };

  constructor(private http: HttpClient) { }

  analyzeRouteGovernorates(waypoints: [number, number][]): Observable<string[]> {
    if (!waypoints || waypoints.length < 2) {
      return of([]);
    }

    const routeKey = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('-');
    if (this.knownRoutes[routeKey]) {
      return of(this.knownRoutes[routeKey]);
    }

    const origin = `${waypoints[0][0]},${waypoints[0][1]}`;
    const destination = `${waypoints[waypoints.length - 1][0]},${waypoints[waypoints.length - 1][1]}`;
    
    let waypointsParam = '';
    if (waypoints.length > 2) {
      const middlePoints = waypoints.slice(1, waypoints.length - 1);
      waypointsParam = `&waypoints=${middlePoints.map(wp => `${wp[0]},${wp[1]}`).join('|')}`;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointsParam}&key=${this.googleMapsApiKey}`;

    return this.http.get(url).pipe(
      map((response: any) => {
        if (response.status !== 'OK' || !response.routes || response.routes.length === 0) {
          return this.fallbackGovernorates(waypoints);
        }

        const route = response.routes[0];
        const path: { lat: number, lng: number }[] = [];
        
        if (route.legs) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                if (step.start_location) {
                  path.push({
                    lat: step.start_location.lat,
                    lng: step.start_location.lng
                  });
                }
                if (step.end_location) {
                  path.push({
                    lat: step.end_location.lat,
                    lng: step.end_location.lng
                  });
                }
              });
            }
          });
        }

        return this.identifyGovernorates(path);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching route data:', error);
        
        if (error.status === 403 || 
            (error.error && 
             (error.error.error === 'API key not authorized' || 
              error.error.error_message && error.error.error_message.includes('API')))) {
          return throwError(() => ({
            status: 403,
            error: 'API key not authorized'
          }));
        }
        
        return of(this.fallbackGovernorates(waypoints));
      })
    );
  }

  private fallbackGovernorates(waypoints: [number, number][]): string[] {
    const routeKey = waypoints.map(wp => `${wp[0]},${wp[1]}`).join('-');
    if (this.knownRoutes[routeKey]) {
      return this.knownRoutes[routeKey];
    }
    
    const allPoints: { lat: number, lng: number }[] = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const startPoint = { lat: waypoints[i][0], lng: waypoints[i][1] };
      const endPoint = { lat: waypoints[i+1][0], lng: waypoints[i+1][1] };
      
      allPoints.push(startPoint);
      
      for (let j = 1; j <= 10; j++) {
        const ratio = j / 11;
        allPoints.push({
          lat: startPoint.lat + (endPoint.lat - startPoint.lat) * ratio,
          lng: startPoint.lng + (endPoint.lng - startPoint.lng) * ratio
        });
      }
      
      allPoints.push(endPoint);
    }
    
    return this.identifyGovernorates(allPoints);
  }

  private identifyGovernorates(path: { lat: number, lng: number }[]): string[] {
    if (!path || path.length === 0) {
      return [];
    }

    const governoratesFound: Set<string> = new Set();
    const result: string[] = [];

    const sampleCount = Math.min(20, path.length);
    const step = Math.floor(path.length / sampleCount);
    
    for (let i = 0; i < path.length; i += step) {
      const point = path[i];
      const nearestGovernorate = this.findNearestGovernorate(point.lat, point.lng);
      
      if (nearestGovernorate && !governoratesFound.has(nearestGovernorate)) {
        governoratesFound.add(nearestGovernorate);
        result.push(nearestGovernorate);
      }
    }

    const lastPoint = path[path.length - 1];
    const lastGovernorate = this.findNearestGovernorate(lastPoint.lat, lastPoint.lng);
    
    if (lastGovernorate && !governoratesFound.has(lastGovernorate)) {
      result.push(lastGovernorate);
    }

    return result;
  }

  private findNearestGovernorate(lat: number, lng: number): string | null {
    if (!this.tunisianGovernorates || this.tunisianGovernorates.length === 0) {
      return null;
    }

    let nearestGovernorate = null;
    let minDistance = Number.MAX_VALUE;

    for (const governorate of this.tunisianGovernorates) {
      const distance = this.calculateDistance(
        lat, lng, 
        governorate.lat, governorate.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestGovernorate = governorate.name;
      }
    }

    return nearestGovernorate;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getTunisiaRouteGovernorates(
    pointA: [number, number],
    pointB: [number, number],
    pointC: [number, number]
  ): Observable<string[]> {
    return this.analyzeRouteGovernorates([pointA, pointB, pointC]);
  }

  getTouristAttractions(governorateName: string): Observable<TouristAttraction[]> {
    const apiUrl = `http://localhost:8084/api/tourist-places/search/governorate/${governorateName}`;
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<TouristPlace[]>(apiUrl, { headers }).pipe(
      map(places => {
        if (!places || places.length === 0) {
          return [{
            name: 'No Attractions Found',
            description: `No tourist attractions were found for ${governorateName}.`,
            image: 'assets/FrontOffice/img/attractions/tunisia-tourism.jpg'
          }];
        }
        
        return places.map(place => ({
          name: place.name,
          description: place.type || 'Tourist Attraction',
          rating: place.rating,
          address: place.reviews,
          image: place.image_url
        }));
      }),
      catchError(error => {
        console.error(`Error fetching tourist places for ${governorateName}:`, error);
        
        const governorate = this.tunisianGovernorates.find(
          g => g.name.toLowerCase() === governorateName.toLowerCase()
        );
        
        if (!governorate || !governorate.touristAttractions) {
          return of([{
            name: 'Location Not Found',
            description: `Could not find tourist attractions for ${governorateName}. Please try another location.`,
            image: 'assets/FrontOffice/img/attractions/tunisia-tourism.jpg'
          }]);
        }
        
        return of(governorate.touristAttractions.slice(0, 3));
      })
    );
  }
}