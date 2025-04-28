import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParcelIdPartageService {
  private parcelIdSource = new BehaviorSubject<number | null>(null); // Valeur initiale : null
  parcelId$ = this.parcelIdSource.asObservable();

  constructor() {}

  // Méthode pour mettre à jour le parcelId
  updateParcelId(parcelId: number): void {
    this.parcelIdSource.next(parcelId);
    sessionStorage.setItem('parcelId', parcelId.toString()); // ou localStorage
  }
  
  getParcelId(): number | null {
    const id = sessionStorage.getItem('parcelId');
    return id ? +id : null;
  }
  
  
}
