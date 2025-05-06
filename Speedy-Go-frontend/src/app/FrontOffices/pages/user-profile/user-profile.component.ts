import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isProfileCardVisible = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Fetch the logged-in user's ID (e.g., from a service or local storage)
    const userId = 1; // Replace with the actual user ID
    this.fetchUserData(userId);
  }

  fetchUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      data => this.user = data,
      error => console.error('Error fetching user data:', error)
    );
  }

  toggleProfileCard(): void {
    this.isProfileCardVisible = !this.isProfileCardVisible;
  }
}