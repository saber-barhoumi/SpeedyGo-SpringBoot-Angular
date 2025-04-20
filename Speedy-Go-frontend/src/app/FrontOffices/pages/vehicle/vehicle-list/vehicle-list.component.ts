import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DeliveryVehicle, VehicleType } from '../../../../models/vehicle.model';
import { VehicleService } from '../../../../services/recrutement/vehicle.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/user/auth.service';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css']
})
export class VehicleListComponent implements OnInit {
  vehicles: DeliveryVehicle[] = [];
  filteredVehicles: DeliveryVehicle[] = [];
  isLoading = true;
  searchTerm = '';
  selectedType: VehicleType | 'ALL' = 'ALL';
  vehicleTypes = Object.values(VehicleType);
  currentUser: any;
  constructor(
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('You must be logged in to access this page');
      this.router.navigate(['/login']);
      return;
    }
    
    // Get current user
    this.currentUser = this.authService.getUser();
    
    // Load vehicles
    this.loadVehicles();
  }
  

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.filteredVehicles = [...vehicles];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vehicles:', err);
        this.isLoading = false;
        this.toastr.error('Failed to load vehicles. Please try again later.');
      }
    });
  }

  onSearch(): void {
    this.filterVehicles();
  }

  onTypeChange(): void {
    this.filterVehicles();
  }

  filterVehicles(): void {
    let filtered = [...this.vehicles];
    
    // Filter by type
    if (this.selectedType !== 'ALL') {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === this.selectedType);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.licensePlate.toLowerCase().includes(term)
      );
    }
    
    this.filteredVehicles = filtered;
  }

  deleteVehicle(id: number): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => {
          this.toastr.success('Vehicle deleted successfully');
          this.vehicles = this.vehicles.filter(v => v.vehicleId !== id);
          this.filterVehicles();
        },
        error: (err) => {
          console.error('Error deleting vehicle:', err);
          this.toastr.error('Failed to delete vehicle. It might be used in other parts of the system.');
        }
      });
    }
  }

  getVehicleTypeName(type: VehicleType): string {
    return type.replace('_', ' ');
  }
}