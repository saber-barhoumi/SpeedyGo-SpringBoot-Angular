import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DeliveryService } from '../../../../../services/delivery/international-shipping/delivery.service';
import { AuthService } from '../../../../../FrontOffices/services/user/auth.service';

// Define Order interface matching what your API returns
interface Order {
  orderId: number;
  orderDate: Date;
  serviceName: string;
  destinationCountry: string;
  status: string;
  totalPrice: number;
}

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';
  userId: number | null = null;

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user details
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.userId = currentUser.userId;
      this.loadOrders();
    } else {
      this.error = 'User information not available';
    }
  }

  loadOrders(): void {
    if (!this.userId) return;
    
    this.loading = true;
    this.error = '';

    // You'll need to implement this method in your DeliveryService
    // For now using a temporary mock implementation
    this.mockGetCustomerOrders(this.userId);
    
    // Actual implementation would look like:
    /*
    this.deliveryService.getCustomerOrders(this.userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.error = 'Failed to load your orders. Please try again later.';
        this.loading = false;
      }
    });
    */
  }

  // Temporary mock method until you implement the actual method in DeliveryService
  mockGetCustomerOrders(userId: number): void {
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
      },
      {
        orderId: 1003,
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        serviceName: 'Economy Shipping',
        destinationCountry: 'Spain',
        status: 'Delivered',
        totalPrice: 45.20
      }
    ];
    
    // Simulate async behavior
    setTimeout(() => {
      this.orders = mockOrders;
      this.loading = false;
    }, 500);
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

  viewOrderDetails(orderId: number): void {
    // Implement this when you have order details page
    console.log('View order details for order ID:', orderId);
    // this.router.navigate(['/customer/international-shipping/order-details', orderId]);
  }
}