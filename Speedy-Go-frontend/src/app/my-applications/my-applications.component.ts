import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RecruitmentService } from '../services/recrutement/recruitment.service';
import { AuthService } from '../FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: any[] = [];
  currentUser: any;
  isLoading = true;
  errorMessage = '';
  
  // Mock user for now - in a real app, get this from AuthService


  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
     // Verify user authentication
     if (!this.authService.isAuthenticated()) {
      this.toastr.error('You must be logged in to access this page');
      this.router.navigate(['/login']);
      return;
    }
      // Get current user data
      this.currentUser = this.authService.getUser();
    
      // Load applications for current user
      this.loadMyApplications();
  }

  loadMyApplications(): void {
    this.isLoading = true;
    // Make sure we have a valid userId
    if (!this.currentUser || !this.currentUser.userId) {
      this.errorMessage = 'User information is not available';
      this.isLoading = false;
      return;
    }
    
    this.recruitmentService.getRecruitmentsByUser(this.currentUser.userId).subscribe({
      next: (data) => {
        console.log('Loaded applications:', data);
        this.applications = data.filter(app => app && app.recruitmentId);
        this.isLoading = false;
        
        if (this.applications.length === 0) {
          this.errorMessage = 'You have no applications yet';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load your applications';
        console.error('Error loading applications:', err);
        this.toastr.error(this.errorMessage);
      }
    });
  }

  editApplication(id: number): void {
    this.router.navigate(['/recruitment/edit', id]);
  }

  deleteApplication(id: number): void {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      this.recruitmentService.deleteRecruitment(id).subscribe({
        next: () => {
          this.toastr.success('Application deleted successfully');
          this.applications = this.applications.filter(app => app.recruitmentId !== id);
        },
        error: (err) => {
          console.error('Error deleting application:', err);
          this.toastr.error('Failed to delete application. Please try again later.');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning text-dark';
      case 'UNDER_REVIEW':
        return 'bg-info text-dark';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-primary';
      case 'ACCEPTED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  canEditApplication(status: string): boolean {
    // Only allow editing applications that are still pending or under review
    return ['PENDING', 'UNDER_REVIEW'].includes(status);
  }

  canDeleteApplication(status: string): boolean {
    // Only allow deleting applications that haven't been accepted yet
    return ['PENDING', 'UNDER_REVIEW', 'REJECTED'].includes(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}