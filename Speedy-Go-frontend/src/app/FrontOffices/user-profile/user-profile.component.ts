import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/services/user/user.service';
import { UserUpdateDTO } from 'src/app/models/user-update.dto';
import { AuthService } from '../../FrontOffices/services/user/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isProfileCardVisible = false;
  isEditMode = false;
  editedUser: UserUpdateDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    sexe: '',
    role: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const userId = this.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (data) => {
          this.user = data;
          this.resetEditForm();
        },
        error: (error) => {
          this.toastr.error('Failed to fetch user data');
          console.error('Error fetching user data:', error);
        }
      });
    }
  }

  private getUserId(): number | null {
    try {
      // Implement your method to get current user ID
      const storedUserId = localStorage.getItem('userId');
      return storedUserId ? parseInt(storedUserId, 10) : null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  resetEditForm(): void {
    if (this.user) {
      this.editedUser = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        phoneNumber: this.user.phoneNumber || '',
        address: this.user.address || '',
        sexe: this.user.sexe || '',
        role: this.user.role || ''
      };
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.resetEditForm();
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.user?.userId) {
        this.userService.uploadProfilePicture(this.user.userId, file).subscribe({
          next: (updatedUser) => {
            this.user = updatedUser;
            this.toastr.success('Profile picture updated');
          },
          error: () => {
            this.toastr.error('Failed to upload profile picture');
          }
        });
      }
    }
  }

  saveProfile(): void {
    if (this.user?.userId) {
      this.userService.updateUserProfile(this.user.userId, this.editedUser).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isEditMode = false;
          this.toastr.success('Profile updated successfully');
        },
        error: () => {
          this.toastr.error('Failed to update profile');
        }
      });
    }
  }

  // Optional: Default image fallback method
  getProfileImage(): string {
    return this.user?.profilePicture || 'assets/default-avatar.png';
  }
}