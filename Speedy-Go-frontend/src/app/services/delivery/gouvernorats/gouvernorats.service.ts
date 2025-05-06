import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GouvernoratService {
  private gouvernorats = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Bizerte', 'Nabeul',
    'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir',
    'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes',
    'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili', 'Zaghouan'
  ];

  getGouvernorats(): string[] {
    return this.gouvernorats;
  }
}