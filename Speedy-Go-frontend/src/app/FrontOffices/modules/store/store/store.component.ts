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
import { RecommendationService } from 'src/app/FrontOffices/services/recommendation/recommendation.service';
import { OffersService, Offer } from 'src/app/FrontOffices/services/offres/offre.service';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-store-list',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreListComponent implements OnInit {
  userRole: string = '';
  isDarkMode: boolean = false;

  constructor(
    private storeService: StoreService, 
    private router: Router, 
    private dialog: MatDialog,
    private recommendationService: RecommendationService,
    private offersService: OffersService,
    private authService: AuthService
  ) {
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
  recommendedStores: Store[] = [];
  loading = true;
  error = false;
  
  // API Key
  private groqApiKey: string = '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';
  recommendationsEnabled: boolean = false;

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

  // Add these properties to the component class
  showDebugPanel: boolean = false;
  userDebugInfo: any = {};
  recommendationExplanations: {id: string, text: string}[] = [];
  maskedApiKey: string = '';

  ngOnInit(): void {
    // Check authentication status
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login page');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('User is logged in, loading stores');
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
        
        // Automatically enable recommendations with the provided API key
        this.recommendationsEnabled = true;
        this.loadRecommendedStores();
      },
      error: (err: any) => {
        console.error('Error loading stores', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadRecommendedStores(): void {
    if (!this.authService.isLoggedIn() || !this.groqApiKey) {
      return;
    }
    
    // Use a fallback in case of errors
    const getFallbackRecommendations = () => {
      // Simple fallback sorting by name
      return [...this.stores]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 3);
    };
    
    this.recommendationService.recommendStores(this.stores, this.groqApiKey).subscribe({
      next: (recommendedStores) => {
        this.recommendedStores = recommendedStores.slice(0, 3); // Get top 3
        console.log('Recommended stores loaded', this.recommendedStores);
      },
      error: (err) => {
        console.error('Error loading recommended stores', err);
        // Fall back to a simple sorting algorithm
        this.recommendedStores = getFallbackRecommendations();
        console.log('Using fallback recommendations', this.recommendedStores);
      }
    });
  }

  setApiKey(apiKey: string): void {
    this.groqApiKey = apiKey;
    this.recommendationsEnabled = true;
    
    if (this.stores.length > 0) {
      this.loadRecommendedStores();
    }
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

  /**
   * Navigate to the store details page
   */
  viewStore(storeId: number): void {
    if (storeId !== undefined) {
      this.router.navigate(['/offres', storeId]);
    }
  }
  
  /**
   * Toggles the debug panel visibility
   */
  toggleDebugPanel(): void {
    this.showDebugPanel = !this.showDebugPanel;
    
    if (this.showDebugPanel) {
      // Prepare user debug info
      const user = this.authService.getUser();
      
      // Extract demographic data with multiple fallbacks
      const birthDateValue = user.birthDate || user.birth_date || user.dateOfBirth || user.date_of_birth || null;
      const sexValue = user.sexe || user.sex || user.gender || null;
      
      console.log('Debug panel - user data:', user);
      console.log('Debug panel - extracted birthDate:', birthDateValue);
      console.log('Debug panel - extracted sex:', sexValue);
      
      this.userDebugInfo = {
        age: this.calculateAge(birthDateValue),
        sex: sexValue || 'Not specified',
        location: user.address || 'Not specified',
        preferences: 'Extracted from browsing behavior',
        rawUserData: JSON.stringify(user, null, 2)
      };
      
      // Create masked API key for display
      const key = this.groqApiKey;
      this.maskedApiKey = key.substring(0, 5) + '...' + key.substring(key.length - 5);
      
      // Set up subscription to get explanations
      this.setupExplanationListener();
    }
  }

  /**
   * Calculates age from birthdate string
   */
  private calculateAge(birthDate: string): number | string {
    if (!birthDate) return 'Not specified';
    
    try {
      const dob = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    } catch {
      return 'Invalid date';
    }
  }

  /**
   * Sets up a listener for recommendation explanations
   */
  private setupExplanationListener(): void {
    // Clear previous explanations
    this.recommendationExplanations = [];
    
    // Use a CustomEvent listener to get explanations from the recommendation service
    window.addEventListener('recommendation-explanation', ((event: CustomEvent) => {
      if (event.detail && event.detail.explanations) {
        // Convert explanations object to array for display
        this.recommendationExplanations = Object.entries(event.detail.explanations)
          .map(([id, text]) => ({ id, text: text as string }));
      }
    }) as EventListener);
    
    // Trigger new recommendations if already loaded
    if (this.stores.length > 0) {
      this.loadRecommendedStores();
    }
  }

  /**
   * Sets test demographic data for demonstration purposes
   */
  setTestDemographicData(): void {
    const user = this.authService.getUser();
    if (user && user.userId) {
      this.recommendationService.setTestDemographicData(user.userId);
      
      // Show loading indicator
      this.loading = true;
      
      // Wait a bit for localStorage to update, then reload
      setTimeout(() => {
        // Reload the recommendations
        this.loadRecommendedStores();
        
        // Refresh the debug panel
        this.toggleDebugPanel();
        this.toggleDebugPanel();
        
        this.loading = false;
        
        alert('User demographic data updated for recommendations. Check the debug panel for details.');
      }, 1000);
    } else {
      alert('Error: No user logged in. Please log in first.');
    }
  }
}