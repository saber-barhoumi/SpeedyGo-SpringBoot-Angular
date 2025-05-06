import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DeliveryService } from '../../../../services/delivery/international-shipping/delivery.service';
import { DeliveryService as DeliveryServiceType } from '../../../../models/delivery-service.model';
import { AuthService } from '../../../../FrontOffices/services/user/auth.service';

// Add Order type interface to fix the 'any' type issues
interface Order {
  orderId: number;
  orderDate: Date;
  serviceName: string;
  destinationCountry: string;
  status: string;
  totalPrice: number;
}

@Component({
  selector: 'app-international-shipping',
  templateUrl: './international-shipping.component.html',
  styleUrls: ['./international-shipping.component.scss'], // Changed to scss
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class InternationalShippingComponent implements OnInit {
  // User and Services Data
  userId: number | null = null;
  username: string | null = null;
  services: DeliveryServiceType[] = [];
  filteredServices: DeliveryServiceType[] = [];
  
  // State Management
  loading = false;
  error = '';
  
  // Filters
  searchQuery = '';
  selectedCountry = '';
  countries: string[] = [];
  maxPrice: number | null = null;
  
  // Recent Orders and Statistics
  recentOrders: Order[] = []; // Changed from any[] to Order[]
  totalServices = 0;

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Authenticate user
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user details
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.userId = currentUser.userId;
      this.username = currentUser.firstName || currentUser.username;
    }

    // Load shipping services and data
    this.loadShippingServicesData();
  }

  loadShippingServicesData(): void {
    this.loading = true;
    this.error = '';

    this.deliveryService.getInternationalShippingServices().subscribe({
      next: (data: DeliveryServiceType[]) => {
        this.services = data;
        this.filteredServices = [...data];
        this.totalServices = data.length;
        this.extractCountries();
        this.loadRecentOrders();
        this.loading = false;
      },
      error: (err: any) => { // Added explicit type to fix the 'any' type issue
        console.error('Error loading services', err);
        this.error = 'Failed to load international shipping services. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadRecentOrders(): void {
    if (!this.userId) return;

    // If getCustomerRecentOrders doesn't exist, you should either:
    // 1. Add it to the DeliveryService or
    // 2. Use a different method that exists
    
    // For now, using a mock implementation with fake data 
    // until you can implement the actual method in DeliveryService
    this.mockGetCustomerRecentOrders(this.userId);
    
    /* Original code with error:
    this.deliveryService.getCustomerRecentOrders(this.userId).subscribe({
      next: (orders) => {
        this.recentOrders = orders;
      },
      error: (err) => {
        console.error('Error loading recent orders', err);
      }
    });
    */
  }

  // Temporary mock method until you implement the actual method in DeliveryService
  mockGetCustomerRecentOrders(userId: number): void {
    // Sample data for demonstration - replace with real implementation
    const mockOrders: Order[] = [
      {
        orderId: 1001,
        orderDate: new Date(),
        serviceName: 'Express International',
        destinationCountry: 'France',
        status: 'Pending',
        totalPrice: 120.50
      },
      {
        orderId: 1002,
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        serviceName: 'Standard Shipping',
        destinationCountry: 'Germany',
        status: 'Shipped',
        totalPrice: 85.75
      }
    ];
    
    // Simulate async behavior
    setTimeout(() => {
      this.recentOrders = mockOrders;
    }, 500);
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
      
      return countryMatch && searchMatch && priceMatch;
    });
  }

  private isServiceMatchingSearch(service: DeliveryServiceType, searchTerm: string): boolean {
    return !!(
      service.deliveryPersonName?.toLowerCase().includes(searchTerm) ||
      service.countriesServed?.some((country: string) => country.toLowerCase().includes(searchTerm)) ||
      service.acceptedGoodTypes?.some((type: string) => type.toLowerCase().includes(searchTerm))
    );
  }

  // Navigation Methods
  navigateToServiceList(): void {
    this.router.navigate(['/customer/international-shipping/services']);
  }

  navigateToPlaceOrder(): void {
  console.log("Attempting to navigate to place order");
  this.router.navigate(['/customer/international-shipping/shipping-order']);
}

navigateToMyOrders(): void {
  console.log("navigateToMyOrders() function called!");
  this.router.navigate(['/customer/international-shipping/my-orders'])
    .then(() => console.log('Navigation successful'))
    .catch(err => console.error('Navigation error:', err));
}

placeOrder(serviceId?: number): void {
  if (serviceId !== undefined) {
    this.router.navigate(['/customer/international-shipping/shipping-order', serviceId]);
  }
}

  // Utility Methods
  formatCountries(): string {
    return this.countries.length > 0 
      ? this.countries.join(', ') 
      : 'No countries available';
  }

  getOrderStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'pending': return 'text-warning';
      case 'shipped': return 'text-primary';
      case 'delivered': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  // Filter Event Handlers
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
}