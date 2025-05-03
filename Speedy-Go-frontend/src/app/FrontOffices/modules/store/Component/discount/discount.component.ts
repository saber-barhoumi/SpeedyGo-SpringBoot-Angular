// discount-offer.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Offer {
[x: string]: any;
  offre_id: number;
  title: string;
  description: string;
  discount: number;
  image: string;
  price: number;
  category: string;
  date_start: string | null;
  store_name: string;
  available: boolean;
}

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.css']
})
export class DiscountOfferComponent implements OnInit {
  @Input() offerId: number | null = null;
  
  offer: Offer | null = null;
  loading = true;
  error = false;
  
  private readonly apiUrl = 'http://localhost:8084/api/offres';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
  }
  
  
  loadOffer(): void {
    this.loading = true;
    this.http.get<Offer>(`${this.apiUrl}/${this.offerId}`).subscribe({
      next: (data) => {
        this.offer = data;
        this.loading = false;
        console.log('Offer loaded', data);
      },
      error: (err) => {
        console.error('Error loading offer', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  calculateFinalPrice(): number {
    if (!this.offer) return 0;
    return this.offer.price - (this.offer.price * this.offer.discount / 100);
  }
  
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}