import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../app/FrontOffices/services/user/auth.service';
import { UserUpdateDTO } from '../../models/user-update.dto'; // Import the DTO

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  sexe: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8084/api/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Assuming you have an auth service
  ) {}

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateUserProfile(userId: number, userData: UserUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update/${userId}`, userData);
  }

  uploadProfilePicture(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<User>(`${this.apiUrl}/${userId}/profile-picture`, formData);
  }
}
