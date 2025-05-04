import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';
import { RecruitmentService } from 'src/app/services/recrutement/recruitment.service';

enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  INTERVIEW = 'INTERVIEW_SCHEDULED'
}


@Component({
  selector: 'app-recruitment-management',
  templateUrl: './recruitment-management.component.html',
  styleUrls: ['./recruitment-management.component.css']
})
export class RecruitmentManagementComponent implements OnInit {
  applications: any[] = [];
  filteredApplications: any[] = [];
  isLoading = true;
  statusFilter: string = 'ALL';
  searchTerm = '';
  currentUser: any;
  sortBy = 'date';
  sortDesc = true;
  // Add this at the top of your component class, within the class definition
Math = Math;
// Add these properties to track what action we're currently performing
showRejectModal = false;
showDetailsModal = false;

  
  // Reference time
  currentDate = new Date('2025-03-03 15:49:05');
  currentUserLogin = 'YoussefHarrabi';
  
  // For pagination
  page = 1;
  pageSize = 10;
  totalItems = 0;
  
  // For modal
  selectedApplication: any = null;
  rejectReason: string = '';
  
  // Enum for status
  ApplicationStatus = ApplicationStatus;
  
  constructor(
    private recruitmentService: RecruitmentService,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if user is authenticated and is an admin
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Please log in to access this page.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = this.authService.getUser();
    
    // Check if the user is an admin
    if (this.currentUser.role !== 'ADMIN') {
      this.toastr.error('You do not have permission to access the admin area.');
      this.router.navigate(['/']);
      return;
    }
    
    this.loadAllApplications();
  }

  handleAIRecommendation(application: any): void {
    application.loadingAI = true; // Affiche un spinner ou désactive un bouton
  
    this.recruitmentService.getAIRecommendation(application.recruitmentId).subscribe({
      next: (res) => {
        // On stocke le résultat dans une variable claire
        application.recommendedDeliveryPerson = res;
        this.toastr.success('Recommandation IA chargée avec succès');
      },
      error: (err) => {
        this.toastr.error('Échec de la recommandation IA');
        console.error('Erreur recommandation IA:', err);
      },
      complete: () => {
        application.loadingAI = false;
      }
    });
  }
  
  
  
  loadAllApplications(): void {
    this.isLoading = true;
    this.recruitmentService.getAllRecruitments().subscribe({
      next: (data) => {
        console.log('Loaded applications:', data);
        this.applications = data;
        this.totalItems = this.applications.length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading applications:', err);
        this.toastr.error('Failed to load applications.');
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.applications];
    
    // Filter by status
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        (app.applicant?.firstName?.toLowerCase().includes(term)) ||
        (app.applicant?.lastName?.toLowerCase().includes(term)) ||
        (app.applicant?.email?.toLowerCase().includes(term)) ||
        (app.drivingLicenseNumber?.toLowerCase().includes(term))
      );
    }
    
    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(b.creationDate || b.applicationDate).getTime() - 
                       new Date(a.creationDate || a.applicationDate).getTime();
          break;
        case 'name':
          const nameA = `${a.applicant?.firstName || ''} ${a.applicant?.lastName || ''}`.toLowerCase();
          const nameB = `${b.applicant?.firstName || ''} ${b.applicant?.lastName || ''}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'experience':
          comparison = a.yearsOfExperience - b.yearsOfExperience;
          break;
        case 'status':
          comparison = a.status?.localeCompare(b.status || '');
          break;
      }
      
      return this.sortDesc ? -comparison : comparison;
    });
    
    this.totalItems = filtered.length;
    this.filteredApplications = filtered;
  }
  
  onStatusFilterChange(): void {
    this.page = 1; // Reset to first page
    this.applyFilters();
  }
  
  onSearch(): void {
    this.page = 1; // Reset to first page
    this.applyFilters();
  }
  
  setSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = sortBy;
      this.sortDesc = true;
    }
    this.applyFilters();
  }
  
  getSortIcon(column: string): string {
    if (this.sortBy === column) {
      return this.sortDesc ? 'feather icon-chevron-down' : 'feather icon-chevron-up';
    }
    return 'feather icon-chevrons-up';
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'INTERVIEW': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
  
  changeStatus(application: any, newStatus: ApplicationStatus): void {
    this.selectedApplication = application;
    
    if (newStatus === ApplicationStatus.REJECTED) {
      // Show rejection modal to collect reason
      this.rejectReason = '';
      this.showRejectModal = true;
      this.showDetailsModal = false;
      return;
    }
    
    // For other statuses, process immediately
    this.processStatusChange(application, newStatus);
    this.selectedApplication = null;
  }
  
  viewApplicationDetails(application: any): void {
    // Store the selected application for detailed view
    this.selectedApplication = application;
    this.showDetailsModal = true;
    this.showRejectModal = false;
  }
  
  closeDetailsModal(): void {
    this.selectedApplication = null;
    this.showDetailsModal = false;
  }
  
  confirmReject(): void {
    if (!this.selectedApplication) return;
    
    this.processStatusChange(
      this.selectedApplication, 
      ApplicationStatus.REJECTED, 
      this.rejectReason
    );
    
    // Reset modal data
    this.showRejectModal = false;
    this.selectedApplication = null;
    this.rejectReason = '';
  }
  
  cancelReject(): void {
    this.selectedApplication = null;
    this.showRejectModal = false;
    this.rejectReason = '';
  }
  
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
 // Update the processStatusChange method in RecruitmentManagementComponent
processStatusChange(application: any, newStatus: ApplicationStatus, reason?: string): void {
  const statusData = {
    status: newStatus,
    reason: reason || null
    // processedBy and processedDate will be handled by the backend
  };
  
  this.recruitmentService.updateRecruitmentStatus(application.recruitmentId, statusData).subscribe({
    next: (response) => {
      application.status = newStatus;
      if (reason) application.rejectionReason = reason;
      this.toastr.success(`Application marked as ${newStatus}!`);
    },
    error: (err) => {
      console.error('Error updating status:', err);
      this.toastr.error('Failed to update application status.');
    }
  });
}
  

  
  get paginatedApplications(): any[] {
    const startItem = (this.page - 1) * this.pageSize;
    const endItem = startItem + this.pageSize;
    return this.filteredApplications.slice(startItem, endItem);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  
  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.page = page;
  }
 

  
  
  
}
