import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Livraison, LivraisonStatus } from 'src/app/models/livraison.model';
import { LivraisonService } from 'src/app/services/livraison.service';

@Component({
  selector: 'app-livraison-list',
  templateUrl: './livraison-list.component.html',
  styleUrls: ['./livraison-list.component.css']
})
export class LivraisonListComponent implements OnInit {
  livraisons: Livraison[] = [];
  filteredLivraisons: Livraison[] = [];
  loading = false;
  filterValue = '';
  statusFilter: LivraisonStatus | '' = '';
  
  statuses = Object.values(LivraisonStatus);

  constructor(
    private livraisonService: LivraisonService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadLivraisons();
  }

  loadLivraisons(): void {
    this.loading = true;
    this.livraisonService.getAllLivraisons().subscribe({
      next: (data) => {
        this.livraisons = data;
        this.filteredLivraisons = [...data];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Error loading livraisons: ' + error.message);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.livraisons];
    
    // Text filter
    if (this.filterValue) {
      const filterValueLower = this.filterValue.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(filterValueLower) ||
        l.originAddress.toLowerCase().includes(filterValueLower) ||
        l.destinationAddress.toLowerCase().includes(filterValueLower)
      );
    }
    
    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(l => l.status === this.statusFilter);
    }
    
    this.filteredLivraisons = filtered;
  }

  onFilterChange(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as LivraisonStatus | '';
    this.applyFilters();
  }

  addNewLivraison(): void {
    this.router.navigate(['/livraison-management/create']);
  }

  editLivraison(livraison: Livraison): void {
    this.router.navigate([`/livraison-management/edit/${livraison.livraisonId}`]);
  }

  viewLivraisonDetails(livraison: Livraison): void {
    this.router.navigate([`/livraison-management/view/${livraison.livraisonId}`]);
  }

  deleteLivraison(livraison: Livraison): void {
    if (confirm(`Are you sure you want to delete the livraison "${livraison.title}"?`)) {
      if (livraison.livraisonId) {
        this.livraisonService.deleteLivraison(livraison.livraisonId).subscribe({
          next: () => {
            this.toastr.success('Livraison deleted successfully');
            this.loadLivraisons();
          },
          error: (error) => {
            this.toastr.error('Error deleting livraison: ' + error.message);
          }
        });
      }
    }
  }

  getStatusLabel(status: LivraisonStatus | undefined): string {
    if (!status) return '-';
    return status.replace('_', ' ');
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