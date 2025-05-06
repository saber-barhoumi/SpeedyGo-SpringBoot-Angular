import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

export interface User {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  role?: string;
  profilePictureType?: string;
}

@Component({
  selector: 'app-header-front',
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void <=> *', animate('200ms ease-in-out')),
    ]),
  ],
})
export class HeaderFrontComponent implements OnInit {
  isLoggedIn = false;
  user: User | null = null;
  showProfile = false;
  defaultProfilePicture = 'assets/default-profile.png';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        this.userService.getUserById(userId).subscribe({
          next: (userData: User) => {
            this.user = userData;
            this.user.profilePicture = this.formatProfilePicture(userData);
          },
          error: (error) => {
            console.error('Error fetching user profile:', error);
            this.user = this.authService.getUser() || null;
            if (this.user) {
              this.user.profilePicture = this.formatProfilePicture(this.user);
            }
          },
        });
      } else {
        this.user = this.authService.getUser() || null;
        if (this.user) {
          this.user.profilePicture = this.formatProfilePicture(this.user);
        }
      }
    }
  }

  formatProfilePicture(user: User): string {
    if (!user.profilePicture) {
      return this.defaultProfilePicture;
    }
    return user.profilePicture.startsWith('data:')
      ? user.profilePicture
      : `data:${user.profilePictureType || 'image/jpeg'};base64,${user.profilePicture}`;
  }

  toggleProfile(event?: Event): void {
    if (event) event.stopPropagation();
    this.showProfile = !this.showProfile;
  }

  navigateToProfile(): void {
    this.router.navigate(['/user-profile']);
    this.showProfile = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.showProfile = false;
    this.router.navigate(['/home']);
  }

  getProfileImage(): string {
    return this.user?.profilePicture || this.defaultProfilePicture;
  }

  ToTrips(): void {
    this.router.navigate(['/trips']);
  }

  ToStore(): void {
    this.router.navigate(['/storlist']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.profile-container')) {
      this.showProfile = false;
    }
  }
}