import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { RecruitmentService } from '../../../../services/recrutement/recruitment.service';
import { AuthService } from '../../../services/user/auth.service';

@Component({
  selector: 'app-recruitment-detail',
  templateUrl: './recruitment-detail.component.html',
  styleUrls: ['./recruitment-detail.component.css']
})
export class RecruitmentDetailComponent implements OnInit {
  recruitment: any = null;
  currentUser: any;
  isLoading = true;
  errorMessage = '';

  
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recruitmentService: RecruitmentService,
    private toastr: ToastrService,
    private location: Location,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
        // Verify user authentication
        if (!this.authService.isAuthenticated()) {
          this.toastr.error('You must be logged in to access this page');
          this.router.navigate(['/login']);
          return;
        }
        
        // Get current user
        this.currentUser = this.authService.getUser();
        
        // Load recruitment details
        const id = this.route.snapshot.paramMap.get('id');
        console.log('id',id);
        if (id) {
          this.loadRecruitmentDetail(+id);
        } else {
          this.errorMessage = 'No application ID provided';
          this.isLoading = false;
        }
      }


      loadRecruitmentDetail(id: number): void {
        this.isLoading = true;
        this.recruitmentService.getRecruitmentById(id).subscribe({
          next: (data) => {
            this.recruitment = data;
            this.isLoading = false;
            
            console.log('Recruitment applicant user_id:', this.recruitment.applicant.user_id);
            console.log('Current user userId:', this.currentUser.userId);
            
            // Verify this application belongs to the current user
            if (this.recruitment && this.recruitment.applicant) {
              // Check both possible property naming conventions (snake_case and camelCase)
              const applicantUserId = this.recruitment.applicant.user_id || this.recruitment.applicant.userId;
              const currentUserId = this.currentUser.userId || this.currentUser.user_id;
              
              console.log('Comparing applicant ID:', applicantUserId, 'with current user ID:', currentUserId);
              
              if (applicantUserId != currentUserId) { // Use loose equality to handle string/number type differences
                this.toastr.error('You do not have permission to view this application');
                this.router.navigate(['/recruitment/my-applications']);
              }
            } else {
              this.errorMessage = 'The application details are incomplete or invalid';
              console.error('Missing applicant data:', this.recruitment);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to load application details';
            console.error('Error loading recruitment details:', err);
            this.toastr.error(this.errorMessage);
          }
        });
      }
  editApplication(): void {
    if (this.recruitment) {
      this.router.navigate(['/recruitment/edit', this.recruitment.recruitmentId]);
    }
  }

  deleteApplication(): void {
    if (!this.recruitment) return;
    
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      this.recruitmentService.deleteRecruitment(this.recruitment.recruitmentId).subscribe({
        next: () => {
          this.toastr.success('Application deleted successfully');
          this.router.navigate(['/recruitment/my-applications']);
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

  canEditApplication(): boolean {
    if (!this.recruitment) return false;
    // Only allow editing applications that are still pending or under review
    return ['PENDING', 'UNDER_REVIEW'].includes(this.recruitment.status);
  }

  canDeleteApplication(): boolean {
    if (!this.recruitment) return false;
    // Only allow deleting applications that haven't been accepted yet
    return ['PENDING', 'UNDER_REVIEW', 'REJECTED'].includes(this.recruitment.status);
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}