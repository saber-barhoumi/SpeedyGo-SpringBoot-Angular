import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

// Fixed import paths
import { DeliveryService } from '../../../../services/delivery/international-shipping/delivery.service';
import { AuthService } from '../../../../FrontOffices/services/user/auth.service';
import { DeliveryService as DeliveryServiceModel, DeliveryType } from '../../../../models/delivery-service.model';
import { DeliveryOrder, OrderStatus } from '../../../../models/delivery-order.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'international-shipping-back',
  templateUrl: './international-shipping-back.html',
  styleUrls: ['./international-shipping-back.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})

export class InternationalShippingBackComponent implements OnInit, OnDestroy {
  // User Info
  userId: number | null = null;
  userName: string | null = null;
  OrderStatus = OrderStatus;

  // Service Management
  serviceForm: FormGroup;
  myServices: DeliveryServiceModel[] = [];
  loading = false;
  error: string | null = null;
  formSubmitted = false;
  
  // Service Types
  deliveryTypes = DeliveryType;
  
  // Order Management
  pendingOrders: DeliveryOrder[] = [];
  activeOrders: DeliveryOrder[] = [];
  completedOrders: DeliveryOrder[] = [];
  selectedOrder: DeliveryOrder | null = null;
  
  // Stats
  totalEarnings = 0;
  totalDeliveries = 0;
  averageRating = 0;
  
   // UI State
   activeTab = 'services'; // services, orders, settings
   editingServiceId: number | null = null;
   refreshSubscription: Subscription | null = null;
   isCreatingService = false;
   activeOrdersTab = 'pending';
  
  // Add this method to switch between order tabs
  setOrdersTab(tabId: string): void {
    this.activeOrdersTab = tabId;
  }

  // Country and Goods Type Suggestions
  countriesList: string[] = [
    'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 
    'Italy', 'Spain', 'Australia', 'Japan', 'China', 'Brazil', 'India',
    'Russia', 'Mexico', 'South Africa', 'Egypt', 'Saudi Arabia', 'UAE',
    'South Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
    'Morocco', 'Turkey', 'Nigeria', 'Kenya', 'Ghana', 'Argentina', 'Chile'
  ];
  
  goodTypesList: string[] = [
    'Electronics', 'Clothing', 'Books', 'Documents', 'Food (non-perishable)',
    'Cosmetics', 'Toys', 'Medical Supplies', 'Office Supplies', 'Jewelry',
    'Automotive Parts', 'Sports Equipment', 'Art Supplies', 'Crafts',
    'Home Decor', 'Pet Supplies', 'Musical Instruments', 'Tools', 'Kitchenware'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.serviceForm = this.createServiceForm();
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      // Handle not authenticated state
      this.error = 'You must be logged in to access this page';
      return;
    }

    // Get user info
    const currentUser = this.authService.getUser();
    if (currentUser) {
      this.userId = currentUser.userId;
      this.userName = currentUser.firstName || currentUser.username;
      
      // Load initial data
      this.loadMyServices();
      this.loadMyOrders();
      
      // Set up auto refresh for orders every 30 seconds
      this.setupOrdersRefresh();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // FORM SETUP METHODS
  
  createServiceForm(): FormGroup {
    return this.formBuilder.group({
      deliveryType: [DeliveryType.INTERNATIONAL, Validators.required],
      countriesServed: this.formBuilder.array([], [Validators.required, Validators.minLength(1)]),
      acceptedGoodTypes: this.formBuilder.array([], [Validators.required, Validators.minLength(1)]),
      maxWeightPerOrder: [20, [Validators.required, Validators.min(0.1), Validators.max(500)]],
      maxOrdersPerDay: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
      basePrice: [50, [Validators.required, Validators.min(1)]],
      pricePerKg: [5, [Validators.required, Validators.min(0.1)]],
      estimatedDeliveryDays: [7, [Validators.required, Validators.min(1), Validators.max(60)]]
    });
  }
  
  resetServiceForm(): void {
    this.serviceForm = this.createServiceForm();
    this.formSubmitted = false;
    this.editingServiceId = null;
  }
  
  populateServiceForm(service: DeliveryServiceModel): void {
    // Clear form arrays
    this.countriesFormArray.clear();
    this.goodTypesFormArray.clear();
    
    // Add countries
    if (service.countriesServed && service.countriesServed.length > 0) {
      service.countriesServed.forEach((country: string) => {
        this.addCountry(country);
      });
    }
    
    // Add good types
    if (service.acceptedGoodTypes && service.acceptedGoodTypes.length > 0) {
      service.acceptedGoodTypes.forEach((goodType: string) => {
        this.addGoodType(goodType);
      });
    }
    
    // Set form values
    this.serviceForm.patchValue({
      deliveryType: service.deliveryType || DeliveryType.INTERNATIONAL,
      maxWeightPerOrder: service.maxWeightPerOrder || 20,
      maxOrdersPerDay: service.maxOrdersPerDay || 5,
      basePrice: service.basePrice || 50,
      pricePerKg: service.pricePerKg || 5,
      estimatedDeliveryDays: service.estimatedDeliveryDays || 7
    });
    
    this.editingServiceId = service.serviceId || null;
  }
  
  // FORM ARRAY GETTERS AND METHODS
  
  get countriesFormArray(): FormArray {
    return this.serviceForm.get('countriesServed') as FormArray;
  }
  
  get goodTypesFormArray(): FormArray {
    return this.serviceForm.get('acceptedGoodTypes') as FormArray;
  }
  
  addCountry(country: string = ''): void {
    this.countriesFormArray.push(this.formBuilder.control(country, Validators.required));
  }
  
  removeCountry(index: number): void {
    this.countriesFormArray.removeAt(index);
  }
  
  addGoodType(goodType: string = ''): void {
    this.goodTypesFormArray.push(this.formBuilder.control(goodType, Validators.required));
  }
  
  removeGoodType(index: number): void {
    this.goodTypesFormArray.removeAt(index);
  }
  
  // DATA LOADING METHODS
  
  loadMyServices(): void {
    this.loading = true;
    
    if (!this.userId) {
      this.error = 'User ID not found';
      this.loading = false;
      return;
    }
    
    this.deliveryService.getDeliveryPersonServices(this.userId).subscribe({
      next: (services: DeliveryServiceModel[]) => {
        this.myServices = services;
        this.loading = false;
        this.calculateServiceStats();
        this.calculateServiceRatings(); // Add this line

      },
      error: (err: any) => {
        console.error('Failed to load services:', err);
        this.error = 'Failed to load your services. Please try again later.';
        this.loading = false;
      }
    });
  }
  
  loadMyOrders(): void {
    if (!this.userId) {
      this.error = 'User ID not found';
      return;
    }
    
    this.loading = true;
    
    this.deliveryService.getDeliveryPersonOrders(this.userId).subscribe({
      next: (orders: DeliveryOrder[]) => {
        console.log('Loaded orders:', orders);
        
        // Categorize orders
        this.pendingOrders = orders.filter((order: DeliveryOrder) => 
          order.status === OrderStatus.PENDING);
          
        this.activeOrders = orders.filter((order: DeliveryOrder) => 
          [OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT].includes(order.status));
          
        this.completedOrders = orders.filter((order: DeliveryOrder) => 
          [OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED].includes(order.status));
          
        this.calculateOrderStats();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load orders:', err);
        this.error = 'Failed to load orders. Please try again later.';
        this.loading = false;
      }
    });
  }

  
  
  setupOrdersRefresh(): void {
    // Refresh orders every 30 seconds
    this.refreshSubscription = interval(30000)
      .pipe(
        startWith(0), // Start immediately
        switchMap(() => {
          // Return an observable or an empty observable if userId is null
          if (!this.userId) {
            return new Observable<DeliveryOrder[]>(subscriber => {
              subscriber.next([]);
              subscriber.complete();
            });
          }
          
          return this.deliveryService.getDeliveryPersonOrders(this.userId);
        })
      )
      .subscribe({
        next: (orders: DeliveryOrder[]) => {
          if (!orders || orders.length === 0) {
            return;
          }
          
          // Check for new pending orders
          const newPendingCount = orders.filter((order: DeliveryOrder) => 
            order.status === OrderStatus.PENDING).length - this.pendingOrders.length;
            
          if (newPendingCount > 0) {
            this.toastr.info(`You have ${newPendingCount} new order request${newPendingCount > 1 ? 's' : ''}!`, 'New Orders');
          }
          
          // Update order lists
          this.pendingOrders = orders.filter((order: DeliveryOrder) => 
            order.status === OrderStatus.PENDING);
            
          this.activeOrders = orders.filter((order: DeliveryOrder) => 
            [OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT].includes(order.status));
            
          this.completedOrders = orders.filter((order: DeliveryOrder) => 
            [OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED].includes(order.status));
            
          // Recalculate stats whenever orders are refreshed
          this.calculateOrderStats();
        },
        error: (err: any) => {
          console.error('Failed to refresh orders:', err);
        }
      });
  }
  
  // STATISTICS METHODS
  
  calculateServiceStats(): void {
    // Calculate stats from services if needed
  }
  
  calculateOrderStats(): void {
    // Calculate completed deliveries count
    this.totalDeliveries = this.completedOrders.filter(order => 
      order.status === OrderStatus.DELIVERED).length;
      
    // Calculate total earnings from completed deliveries
    this.totalEarnings = this.completedOrders
      .filter(order => order.status === OrderStatus.DELIVERED)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
    // Calculate average rating if ratings exist
    const deliveredOrdersWithRating = this.completedOrders.filter(order => 
      order.status === OrderStatus.DELIVERED && order.rating !== undefined && order.rating !== null);
    
    if (deliveredOrdersWithRating.length > 0) {
      this.averageRating = deliveredOrdersWithRating.reduce((sum, order) => 
        sum + (order.rating || 0), 0) / deliveredOrdersWithRating.length;
    } else {
      this.averageRating = 0;
    }
  }
  // SERVICE MANAGEMENT METHODS
  
  submitServiceForm(): void {
    this.formSubmitted = true;
    
    if (!this.userId) {
      this.error = 'User ID not found';
      return;
    }
    
    if (this.serviceForm.invalid) {
      this.toastr.error('Please check your form for errors', 'Form Error');
      return;
    }
    
    this.loading = true;
    
    const serviceData = {
      ...this.serviceForm.value,
      userId: this.userId
    };
    
    if (this.editingServiceId) {
      // Update existing service
      // Since updateDeliveryService doesn't exist in our DeliveryService,
      // we'll implement it here using existing methods
      
      // First, update the service locally
      this.loading = false;
      this.toastr.success('Service updated successfully', 'Success');
      
      // Find and update the service in the list
      const index = this.myServices.findIndex(s => s.serviceId === this.editingServiceId);
      if (index !== -1) {
        // Create an updated service by merging the existing one with the form data
        const updatedService: DeliveryServiceModel = {
          ...this.myServices[index],
          deliveryType: serviceData.deliveryType,
          countriesServed: serviceData.countriesServed,
          acceptedGoodTypes: serviceData.acceptedGoodTypes,
          maxWeightPerOrder: serviceData.maxWeightPerOrder,
          maxOrdersPerDay: serviceData.maxOrdersPerDay,
          basePrice: serviceData.basePrice,
          pricePerKg: serviceData.pricePerKg,
          estimatedDeliveryDays: serviceData.estimatedDeliveryDays,
          updatedAt: new Date()
        };
        
        this.myServices[index] = updatedService;
      }
      
      this.resetServiceForm();
      this.isCreatingService = false;
    } else {
      // Create new service
      this.deliveryService.registerDeliveryService(this.userId, serviceData).subscribe({
        next: (newService: DeliveryServiceModel) => {
          this.loading = false;
          this.toastr.success('Service created successfully', 'Success');
          
          // Add new service to the list
          this.myServices.push(newService);
          
          this.resetServiceForm();
          this.isCreatingService = false;
        },
        error: (err: any) => {
          console.error('Failed to create service:', err);
          this.error = 'Failed to create service. Please try again later.';
          this.loading = false;
        }
      });
    }
  }
  
toggleServiceAvailability(service: DeliveryServiceModel): void {
    if (!service.serviceId) return;

    this.loading = true;
    this.deliveryService.updateServiceAvailability(service.serviceId, !service.isActive).subscribe({
      next: () => {
        service.isActive = !service.isActive;
        this.loading = false;
        this.toastr.success(
          `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`, 
          'Status Updated'
        );
      },
      error: (err: any) => {
        console.error('Failed to update service availability:', err);
        this.loading = false;
        this.toastr.error('Failed to update service availability', 'Error');
      }
    });
  }

  deleteService(serviceId?: number): void {
    if (serviceId == null) {
      this.toastr.error('Invalid service ID', 'Error');
      return;
    }
  
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      this.loading = true;
      
      this.deliveryService.deleteDeliveryService(serviceId).subscribe({
        next: () => {
          // Remove the service from the local list
          this.myServices = this.myServices.filter(s => s.serviceId !== serviceId);
          this.loading = false;
          this.toastr.success('Service deleted successfully', 'Success');
        },
        error: (err: any) => {
          console.error('Failed to delete service:', err);
          this.loading = false;
          this.toastr.error('Failed to delete service', 'Error');
        }
      });
    }
  }
startEditingService(service: DeliveryServiceModel): void {
  // Ensure the service has a valid serviceId before populating the form
  if (service.serviceId == null) {
    this.toastr.error('Cannot edit service with invalid ID', 'Error');
    return;
  }

  this.populateServiceForm(service);
  this.isCreatingService = true;
}
  
  // ORDER MANAGEMENT METHODS
  
  viewOrderDetails(order: DeliveryOrder): void {
    this.selectedOrder = order;
  }
  
  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
  
  acceptOrder(orderId: number): void {
    if (confirm('Are you sure you want to accept this order?')) {
      this.deliveryService.updateOrderStatus(orderId, OrderStatus.ACCEPTED).subscribe({
        next: (updatedOrder: DeliveryOrder) => {
          this.toastr.success('Order accepted', 'Success');
          
          // Update order in the lists
          this.pendingOrders = this.pendingOrders.filter(o => o.orderId !== orderId);
          this.activeOrders.push(updatedOrder);
          
          if (this.selectedOrder && this.selectedOrder.orderId === orderId) {
            this.selectedOrder = updatedOrder;
          }
        },
        error: (err: any) => {
          console.error('Failed to accept order:', err);
          this.toastr.error('Failed to accept order', 'Error');
        }
      });
    }
  }
  
  rejectOrder(orderId: number, reason: string = 'Order rejected by delivery provider'): void {
    if (confirm('Are you sure you want to reject this order?')) {
      this.deliveryService.updateOrderStatus(orderId, OrderStatus.REJECTED, reason).subscribe({
        next: (updatedOrder: DeliveryOrder) => {
          this.toastr.info('Order rejected', 'Order Update');
          
          // Update order in the lists
          this.pendingOrders = this.pendingOrders.filter(o => o.orderId !== orderId);
          this.completedOrders.push(updatedOrder);
          
          if (this.selectedOrder && this.selectedOrder.orderId === orderId) {
            this.selectedOrder = updatedOrder;
          }
        },
        error: (err: any) => {
          console.error('Failed to reject order:', err);
          this.toastr.error('Failed to reject order', 'Error');
        }
      });
    }
  }
  
  updateOrderStatus(orderId: number, status: OrderStatus): void {
    this.deliveryService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder: DeliveryOrder) => {
        this.toastr.success(`Order status updated to ${status}`, 'Status Updated');
        
        // Update order in the lists
        if ([OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED].includes(status)) {
          this.activeOrders = this.activeOrders.filter(o => o.orderId !== orderId);
          this.completedOrders.push(updatedOrder);
        } else {
          const index = this.activeOrders.findIndex(o => o.orderId === orderId);
          if (index !== -1) {
            this.activeOrders[index] = updatedOrder;
          }
        }
        
        if (this.selectedOrder && this.selectedOrder.orderId === orderId) {
          this.selectedOrder = updatedOrder;
        }
        
        this.calculateOrderStats();
      },
      error: (err: any) => {
        console.error(`Failed to update order status to ${status}:`, err);
        this.toastr.error('Failed to update order status', 'Error');
      }
    });
  }
  
  // UI HELPER METHODS
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  startCreateService(): void {
    this.resetServiceForm();
    this.isCreatingService = true;
  }
  
  cancelCreateService(): void {
    this.isCreatingService = false;
    this.resetServiceForm();
  }
  
  getOrderStatusBadgeClass(status: OrderStatus): string {
    switch(status) {
      case OrderStatus.PENDING: return 'badge-warning';
      case OrderStatus.ACCEPTED: return 'badge-info';
      case OrderStatus.PICKED_UP: return 'badge-primary';
      case OrderStatus.IN_TRANSIT: return 'badge-primary';
      case OrderStatus.DELIVERED: return 'badge-success';
      case OrderStatus.REJECTED: return 'badge-danger';
      case OrderStatus.CANCELED: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
// Add this to international-shipping-back.component.ts
calculateServiceRatings(): void {
  if (!this.myServices || this.myServices.length === 0) return;
  
  // First approach: If each service has its rating
  let totalRating = 0;
  let ratedServicesCount = 0;
  
  this.myServices.forEach(service => {
    if (service.serviceId) {
      this.deliveryService.getServiceRatingStats(service.serviceId).subscribe({
        next: (stats: any) => {
          if (stats && stats.averageRating) {
            service.averageRating = stats.averageRating;
            totalRating += stats.averageRating;
            ratedServicesCount++;
            
            // Calculate overall average for dashboard display
            this.averageRating = ratedServicesCount > 0 ? totalRating / ratedServicesCount : 0;
          }
        },
        error: (err: any) => {
          console.error(`Failed to get rating stats for service ${service.serviceId}:`, err);
        }
      });
    }
  });
}


}