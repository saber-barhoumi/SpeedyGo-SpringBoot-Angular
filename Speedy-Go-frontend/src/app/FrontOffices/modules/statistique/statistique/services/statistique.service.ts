import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, shareReplay, tap, catchError, retry } from 'rxjs/operators';

interface StatisticsData {
  totalStores: number;
  totalOffers: number;
  offersByStore: { store: string, offers: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private cachedData: BehaviorSubject<StatisticsData | null> = new BehaviorSubject<StatisticsData | null>(null);
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
  private readonly API_URL = 'http://localhost:8084/api/statistiques/dashboard';

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<StatisticsData> {
    // Si nous avons des données mises en cache et qu'elles ne sont pas expirées
    const now = new Date();
    if (this.cachedData.value && this.cacheExpiry && now < this.cacheExpiry) {
      return this.cachedData.asObservable() as Observable<StatisticsData>;
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
       
      })
    };

    // Récupérer les données depuis l'API
    return this.http.get<string[]>(this.API_URL, options).pipe(
      retry(2), // Retry failed requests up to 2 times
      map(this.parseApiResponse),
      tap(data => this.updateCache(data)),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    
    // Simply return the error to the caller instead of using demo data
    return throwError(() => new Error(errorMessage));
  }

  // Fonction pour analyser la réponse de l'API et la convertir en notre format
  private parseApiResponse(apiData: string[]): StatisticsData {
    let totalOffers = 0;
    let totalStores = 0;
    const offersByStore: { store: string, offers: number }[] = [];

    apiData.forEach(item => {
      // Parse total offers
      if (item.startsWith('Total Offers:')) {
        totalOffers = parseInt(item.split(':')[1].trim(), 10);
      } 
      // Parse total stores
      else if (item.startsWith('Total Stores:')) {
        totalStores = parseInt(item.split(':')[1].trim(), 10);
      } 
      // Parse store offers
      else if (item.includes('has')) {
        // Format: "Store 'Store Name' has X offers"
        const storeMatch = item.match(/Store '([^']+)' has (\d+) offers/);
        if (storeMatch && storeMatch.length === 3) {
          offersByStore.push({
            store: storeMatch[1],
            offers: parseInt(storeMatch[2], 10)
          });
        }
      }
    });

    return { totalOffers, totalStores, offersByStore };
  }

  // Données de démo pour le développement ou en cas d'erreur API

  private updateCache(data: StatisticsData): void {
    this.cachedData.next(data);
    this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION);
  }

  private getDefaultData(): StatisticsData {
    return {
      totalStores: 0,
      totalOffers: 0,
      offersByStore: []
    };
  }

  refreshData(): void {
    // Force le rafraîchissement des données
    this.cacheExpiry = null;
    this.getStatistics().subscribe();
  }
}