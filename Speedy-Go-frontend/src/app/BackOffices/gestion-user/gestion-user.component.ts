import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  user_id?: number; // Change from `id` to `user_id`
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  sexe: string;
}

@Component({
  selector: 'app-gestion-user',
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css']
})
export class GestionUserComponent implements OnInit {
  users: User[] = [];
  apiUrl = 'http://localhost:8084/api/user'; // Backend API base URL

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<User[]>('http://localhost:8084/api/user').subscribe(
      (data) => {
        this.users = data.map(user => ({
          ...user,
          id: user.user_id // Map user_id to id
        }));
        console.log("Mapped users:", this.users);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  updateUser(user_id: number): void {
    this.router.navigate([`admin/update-user/${user_id}`]);  // Navigate to update page
  }
  navigateToAddUser(): void {
    this.router.navigate(['admin/add-user']);  // Navigate to Add User page
  }

  deleteUser(user: User): void {
    if (!user.user_id) {
      console.error("Cannot delete user: ID is missing.", user);
      return;
    }
  
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.http.delete(`http://localhost:8084/api/user/deleteUser/${user.user_id}`).subscribe(
        () => {
          this.users = this.users.filter(u => u.user_id !== user.user_id);
          console.log(`User ${user.first_name} ${user.last_name} deleted successfully.`);
        },
        (error) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }
  
  
  }
  
  
  

 
