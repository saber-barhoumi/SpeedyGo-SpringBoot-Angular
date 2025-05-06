import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { DeliveryService } from '../../../../../services/delivery/international-shipping/delivery.service';
import { DeliveryService as DeliveryServiceType } from '../../../../../models/delivery-service.model';
import { AuthService } from '../../../../../FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ServiceListComponent implements OnInit {
  services: DeliveryServiceType[] = [];
  filteredServices: DeliveryServiceType[] = [];
  loading = false;
  error = '';
  ratingSuccess = '';
  
  // User ID for ratings
  userId: number | null = null;
  
  // Filters
  searchQuery = '';
  selectedCountry = '';
  countries: string[] = [];
  maxPrice: number | null = null;
  
  // Rating states
  minRating: number | null = null;
  hoverRating: { [key: number]: number } = {}; // Track hover state for each service
  
  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Get current user ID for ratings
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.userId = currentUser.userId;
    }
    
    this.loadServices();
    this.loadUserRatings();
  }

  loadServices(): void {
    this.loading = true;
    this.error = '';

    this.deliveryService.getInternationalShippingServices().subscribe({
      next: (data: DeliveryServiceType[]) => {
        // Initialize with default values for rating-related properties
        this.services = data.map(service => ({
          ...service,
          rating: service.rating || 0,
          ratingCount: service.ratingCount || 0,
          userRating: undefined
        }));
        this.filteredServices = [...this.services];
        this.extractCountries();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading services', err);
        this.error = 'Failed to load international shipping services. Please try again later.';
        this.loading = false;
      }
    });
  }
  
  loadUserRatings(): void {
    if (!this.userId) return;
    
    this.deliveryService.getUserServiceRatings(this.userId).subscribe({
      next: (ratings: {serviceId: number, rating: number}[]) => {
        // Add user ratings to services
        this.services = this.services.map(service => {
          const userRating = ratings.find(r => r.serviceId === service.serviceId);
          return {
            ...service,
            userRating: userRating ? userRating.rating : undefined
          };
        });
        
        // Update filtered services too
        this.filteredServices = this.filteredServices.map(service => {
          const userRating = ratings.find(r => r.serviceId === service.serviceId);
          return {
            ...service,
            userRating: userRating ? userRating.rating : undefined
          };
        });
      },
      error: (err) => {
        console.error('Error loading user ratings', err);
      }
    });
  }

  extractCountries(): void {
    const uniqueCountries = new Set<string>();
    this.services.forEach(service => {
      service.countriesServed?.forEach(country => {
        if (country) uniqueCountries.add(country);
      });
    });
    this.countries = Array.from(uniqueCountries).sort();
  }

  filterServices(): void {
    this.filteredServices = this.services.filter(service => {
      // Filter by country
      const countryMatch = !this.selectedCountry || 
        (service.countriesServed && service.countriesServed.includes(this.selectedCountry));
      
      // Filter by search term
      const searchMatch = !this.searchQuery || 
        this.isServiceMatchingSearch(service, this.searchQuery.toLowerCase());
      
      // Filter by max price
      const priceMatch = !this.maxPrice || 
        (service.basePrice !== undefined && service.basePrice <= this.maxPrice);
      
      // Filter by minimum rating
      const ratingMatch = !this.minRating || 
        (service.rating !== undefined && service.rating >= this.minRating);
      
      return countryMatch && searchMatch && priceMatch && ratingMatch;
    });
  }

  private isServiceMatchingSearch(service: DeliveryServiceType, searchTerm: string): boolean {
    return !!(
      service.deliveryPersonName?.toLowerCase().includes(searchTerm) ||
      service.countriesServed?.some((country: string) => country.toLowerCase().includes(searchTerm)) ||
      service.acceptedGoodTypes?.some((type: string) => type.toLowerCase().includes(searchTerm))
    );
  }

  onSearch(): void {
    this.filterServices();
  }

  onCountryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCountry = target.value;
    this.filterServices();
  }

  onMaxPriceChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.maxPrice = target.value ? parseFloat(target.value) : null;
    this.filterServices();
  }

  onMinRatingChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.minRating = target.value ? parseFloat(target.value) : null;
    this.filterServices();
  }
  
  // Rating functionality
  setHoverRating(serviceId: number, rating: number): void {
    this.hoverRating[serviceId] = rating;
  }
  
  rateService(serviceId: number, rating: number): void {
    if (!this.userId) {
      this.toastr.warning('You must be logged in to rate services');
      return;
    }
    
    this.loading = true;
    this.deliveryService.rateService(serviceId, rating).subscribe({
      next: (updatedService) => {
        this.loading = false;
        this.ratingSuccess = 'Thank you for rating this service!';
        this.toastr.success('Your rating has been submitted');
        
        // Update the service in the arrays with proper type safety
        this.services = this.services.map(service => {
          if (service.serviceId === serviceId) {
            return {
              ...service,
              rating: updatedService.rating || 0,
              userRating: rating,
              ratingCount: updatedService.ratingCount || 0
            };
          }
          return service;
        });
        
        this.filteredServices = this.filteredServices.map(service => {
          if (service.serviceId === serviceId) {
            return {
              ...service,
              rating: updatedService.rating || 0,
              userRating: rating,
              ratingCount: updatedService.ratingCount || 0
            };
          }
          return service;
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error submitting rating', err);
        this.error = 'Failed to submit rating. Please try again later.';
        this.toastr.error(this.error);
      }
    });
  }

  placeOrder(serviceId?: number): void {
    if (serviceId !== undefined) {
      this.router.navigate(['/customer/international-shipping/shipping-order', serviceId]);
    }
  }

  viewServiceDetails(serviceId?: number): void {
    if (serviceId !== undefined) {
      this.router.navigate(['/customer/international-shipping/service-details', serviceId]);
    }
  }

  formatCountries(countries: string[] | undefined): string {
    return countries?.length ? countries.join(', ') : 'None';
  }

  formatAcceptedGoods(goods: string[] | undefined): string {
    return goods?.length ? goods.join(', ') : 'None specified';
  }
  
  // Helper methods for rating display
  getRatingStars(rating: number | undefined): string[] {
    const stars = [];
    const ratingValue = rating || 0;
    
    // Full stars
    for (let i = 1; i <= Math.floor(ratingValue); i++) {
      stars.push('full');
    }
    
    // Half star
    if (ratingValue % 1 >= 0.3 && ratingValue % 1 <= 0.7) {
      stars.push('half');
    } else if (ratingValue % 1 > 0.7) {
      stars.push('full');
    }
    
    // Empty stars to make total 5
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }
  
  getStarIcon(starType: string): string {
    switch (starType) {
      case 'full': return 'fas fa-star';
      case 'half': return 'fas fa-star-half-alt';
      case 'empty': return 'far fa-star';
      default: return 'far fa-star';
    }
  }
}