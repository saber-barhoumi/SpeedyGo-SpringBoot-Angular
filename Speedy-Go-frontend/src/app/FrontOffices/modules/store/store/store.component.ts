import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from 'src/app/FrontOffices/services/store/store.service';
import { Store, StoreStatus, StoreType } from './model/store';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { addstoreComponent } from '../Component/add-store/add-store.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-store-list',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreListComponent implements OnInit {
  userRole: string = '';
  isDarkMode: boolean = false;

  constructor(private storeService: StoreService, private router: Router, private dialog: MatDialog) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || '';
    
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
    }
  }

  goToOffre(
    id: number
  ) {
    this.router.navigate(['/offres', id]);
  }

  stores: Store[] = [];
  filteredStores: Store[] = [];
  loading = true;
  error = false;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];
  totalPages = 0;

  // Filter options
  storeTypes = Object.values(StoreType);
  storeStatuses = ['OPEN', 'CLOSED', 'SUSPENDED'];
  selectedType: string = '';
  selectedStatus: string = '';

  ngOnInit(): void {
    this.loadStores();
  }

  getStatusIcon(status: StoreStatus): string {
    switch (status) {
      case StoreStatus.OPEN:
        return '✅'; // Green check for open
      case StoreStatus.CLOSED:
        return '❌'; // Red cross for closed
      case StoreStatus.SUSPENDED:
        return '⚠️'; // Warning sign for suspended
      default:
        return '❓'; // Question mark for unknown status
    }
  }

  loadStores(): void {
    this.loading = true;

    this.storeService.getAllStores().subscribe({
      next: (data: any[]) => {
        this.stores = data.map(store => ({
          storeID: store.store_id,
          name: store.name,
          opening: store.opening,
          closing: store.closing,
          logo: store.logo,
          website: store.website,
          image: store.image,
          address: store.address,
          city: store.city,
          location: store.location,
          description: store.description,
          phone: store.phone,
          email: store.email,
          storeType: store.store_type || StoreType.OTHERS,
          storeStatus: store.store_status || StoreStatus.OPEN
        }));
        this.filteredStores = this.stores;
        this.totalPages = Math.ceil(this.filteredStores.length / this.pageSize);
        this.loading = false;
        console.log('Stores loaded', this.stores);
      },
      error: (err: any) => {
        console.error('Error loading stores', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  deleteStore(id: number): void {
    if (confirm('Are you sure you want to delete this store?')) {
      this.storeService.deleteStore(id).subscribe({
        next: () => {
          this.stores = this.stores.filter(store => store.storeID !== id);
          this.filteredStores = this.filteredStores.filter(store => store.storeID !== id);
          this.totalPages = Math.ceil(this.filteredStores.length / this.pageSize);
        },
        error: (err: any) => console.error('Error deleting store', err)
      });
    }
  }

  search(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredStores = this.stores.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.description.toLowerCase().includes(query)
    );
    this.pageIndex = 0;
    this.totalPages = Math.ceil(this.filteredStores.length / this.pageSize);
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.stores;

    if (this.selectedType) {
      filtered = filtered.filter(store => store.storeType === this.selectedType);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(store => store.storeStatus === this.selectedStatus);
    }

    this.filteredStores = filtered;
    this.pageIndex = 0;
    this.totalPages = Math.ceil(this.filteredStores.length / this.pageSize);
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
    }
  }

  get paginatedStores(): Store[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredStores.slice(startIndex, startIndex + this.pageSize);
  }

  getStoreTypeClass(type: StoreType): string {
    return type.toLowerCase();
  }

  getStoreTypeIcon(type: StoreType): string {
    const iconMap: Record<StoreType, string> = {
      [StoreType.SHOP]: '🛍️',        // Shop
      [StoreType.RESORT]: '🏖️',      // Resort
      [StoreType.CAFE]: '☕',         // Cafe
      [StoreType.ELECTRONICS]: '💻',  // Electronics
      [StoreType.CLUB]: '🎵',         // Club
      [StoreType.OTHERS]: '🔹'        // Others
    };

    return iconMap[type] || '❓'; // Default icon for unknown types
  }

  openStore(id: number, mode: 'add' | 'edit'): void {
    console.log('Opening store', id, mode);
    let storeData = null;

    if (mode === 'edit') {
      storeData = this.stores.find(store => store.storeID === id);
      if (storeData) {
        this.updateStore(storeData);
      }
      
    }

    this.router.navigate(['/add-store'], {
      queryParams: { store: JSON.stringify(storeData), mode }
    });
  }

  updateStore(store: Store): void {
    this.storeService.updateStore(store).subscribe({
      next: (response) => {
        try {
          const updatedStore = response;
          const index = this.stores.findIndex(s => s.storeID === updatedStore.storeID);
          this.stores[index] = updatedStore;
          this.filteredStores = this.stores;
          // Close the dialog after updating
        } catch (error) {
          console.error('Error parsing response', error);
        }
      },
      error: (error) => console.error('Error updating store', error)
    });
    this.loadStores();
  }

  createStore(store: Store): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      store.user = parseInt(userId, 10);
    }

    const formData = new FormData();
    Object.keys(store).forEach(key => {
      formData.append(key, (store as any)[key]);
    });
    this.storeService.addStore(formData).subscribe({
      next: (newStore) => {
        this.stores.push(newStore);
        this.filteredStores = this.stores;
        this.dialog.closeAll(); // Close the dialog after creating
      },
      error: (error) => console.error('Error creating store', error)
    });
    this.loadStores();
  }

  canEditOrDelete(): boolean {
    return this.userRole !== 'CUSTOMER' && this.userRole !== 'DELEVERY';
  }

  addOffer(storeId: number): void {
    this.router.navigate(['/add-offer'], {
      queryParams: { storeId }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    // Save preference to localStorage
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  getPaginationArray(): number[] {
    const pageCount = Math.min(5, this.totalPages); // Show max 5 page numbers
    const halfWay = Math.floor(pageCount / 2);
    const isStart = this.pageIndex <= halfWay;
    const isEnd = this.pageIndex >= this.totalPages - halfWay - 1;
    const startPage = isStart ? 1 : (isEnd ? this.totalPages - pageCount + 1 : this.pageIndex - halfWay + 1);
    
    return Array(pageCount).fill(0).map((_, i) => startPage + i);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageIndex = page;
    }
  }
}

