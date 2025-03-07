import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { DeliveryVehicle } from '../../../../models/vehicle.model';
import { VehicleService } from '../../../../services/recrutement/vehicle.service';

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.css']
})
export class VehicleDetailComponent implements OnInit {
  vehicle: DeliveryVehicle | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicleDetails(+id);
    } else {
      this.errorMessage = 'No vehicle ID provided';
      this.isLoading = false;
    }
  }

  loadVehicleDetails(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vehicle details:', err);
        this.errorMessage = 'Failed to load vehicle details.';
        this.isLoading = false;
        this.toastr.error(this.errorMessage);
      }
    });
  }

  getVehicleTypeName(type: string): string {
    return type.replace('_', ' ');
  }

  goBack(): void {
    this.location.back();
  }

  editVehicle(): void {
    if (this.vehicle?.vehicleId) {
      this.router.navigate(['/vehicles/edit', this.vehicle.vehicleId]);
    }
  }

  deleteVehicle(): void {
    if (!this.vehicle?.vehicleId) return;
    
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(this.vehicle.vehicleId).subscribe({
        next: () => {
          this.toastr.success('Vehicle deleted successfully');
          this.router.navigate(['/vehicles']);
        },
        error: (err) => {
          console.error('Error deleting vehicle:', err);
          this.toastr.error('Failed to delete vehicle. It might be used in other parts of the system.');
        }
      });
    }
  }
}