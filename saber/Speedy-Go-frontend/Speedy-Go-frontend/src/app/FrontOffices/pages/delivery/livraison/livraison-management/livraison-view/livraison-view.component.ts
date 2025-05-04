import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { AiVehicleSuggestionDialogComponent } from '../ai-vehicle-suggestion-dialog/ai-vehicle-suggestion-dialog.component';
import { AiVehicleSuggestion, Livraison, LivraisonStatus } from 'src/app/models/livraison.model';
import { DeliveryVehicle } from 'src/app/models/vehicle.model';
import { LivraisonService } from 'src/app/services/livraison.service';
import { VehicleService } from 'src/app/services/vehicle/vehicle.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-livraison-view',
  templateUrl: './livraison-view.component.html',
  styleUrls: ['./livraison-view.component.css']
})
export class LivraisonViewComponent implements OnInit {
  livraison: Livraison | null = null;
  loading = false;
  processingAction = false;
  livraisonId!: number;
  availableVehicles: DeliveryVehicle[] = [];
  statusOptions = Object.values(LivraisonStatus);
  aiSuggestion: AiVehicleSuggestion | null = null;
  showAiSuggestionDialog = false;

  constructor(
    private livraisonService: LivraisonService,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/livraison-management']);
      return;
    }
    
    this.livraisonId = +idParam;
    this.loadLivraisonData();
    this.loadAvailableVehicles();
  }

  loadLivraisonData(): void {
    this.loading = true;
    this.livraisonService.getLivraisonById(this.livraisonId).subscribe({
      next: (data) => {
        this.livraison = data;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error loading livraison: ' + error.message);
        this.loading = false;
        this.router.navigate(['/livraison-management']);
      }
    });
  }

  loadAvailableVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        this.availableVehicles = vehicles;
      },
      error: (error) => {
        this.toastr.error('Error loading vehicles: ' + error.message);
      }
    });
  }

  editLivraison(): void {
    this.router.navigate([`/livraison-management/edit/${this.livraisonId}`]);
  }

  deleteLivraison(): void {
    if (confirm('Are you sure you want to delete this livraison?')) {
      this.processingAction = true;
      
      this.livraisonService.deleteLivraison(this.livraisonId).subscribe({
        next: () => {
          this.processingAction = false;
          this.toastr.success('Livraison deleted successfully');
          this.router.navigate(['/livraison-management']);
        },
        error: (error) => {
          this.processingAction = false;
          this.toastr.error('Error deleting livraison: ' + error.message);
        }
      });
    }
  }

  updateStatus(event: Event): void {
    if (!this.livraison) return;
    
    const status = (event.target as HTMLSelectElement).value as LivraisonStatus;
    const updatedLivraison: Livraison = {
      ...this.livraison,
      status
    };
    
    this.processingAction = true;
    this.livraisonService.updateLivraison(this.livraisonId, updatedLivraison).subscribe({
      next: (data) => {
        this.livraison = data;
        this.processingAction = false;
        this.toastr.success('Status updated successfully');
      },
      error: (error) => {
        this.processingAction = false;
        this.toastr.error('Error updating status: ' + error.message);
      }
    });
  }

  assignVehicle(event: Event): void {
    const vehicleId = +(event.target as HTMLSelectElement).value;
    if (!vehicleId) return;
    
    this.processingAction = true;
    this.livraisonService.assignVehicle(this.livraisonId, vehicleId).subscribe({
      next: (data) => {
        this.livraison = data;
        this.processingAction = false;
        this.toastr.success('Vehicle assigned successfully');
      },
      error: (error) => {
        this.processingAction = false;
        this.toastr.error('Error assigning vehicle: ' + error.message);
      }
    });
  }

  suggestVehicle(): void {
    this.processingAction = true;
    this.livraisonService.suggestBestVehicle(this.livraisonId).subscribe({
      next: (suggestion) => {
        this.processingAction = false;
        console.log('Received AI suggestion:', suggestion); // Add this debug log
        this.aiSuggestion = suggestion;
        this.showAiSuggestionDialog = true;
      },
      error: (error) => {
        this.processingAction = false;
        this.toastr.error('Error getting AI suggestion: ' + error.message);
      }
    });
  }

  onAiSuggestionDialogClose(): void {
    this.showAiSuggestionDialog = false;
    this.loadLivraisonData();
  }

  

  getStatusClass(status: LivraisonStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case LivraisonStatus.PENDING:
        return 'status-pending';
      case LivraisonStatus.VEHICLE_ASSIGNED:
        return 'status-assigned';
      case LivraisonStatus.IN_TRANSIT:
        return 'status-transit';
      case LivraisonStatus.DELIVERED:
        return 'status-delivered';
      case LivraisonStatus.CANCELLED:
        return 'status-cancelled';
      case LivraisonStatus.FAILED:
        return 'status-failed';
      default:
        return '';
    }
  }
}