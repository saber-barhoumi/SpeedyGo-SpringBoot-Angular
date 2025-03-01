import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  sexe: string;
}

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  userId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      sexe: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUserDetails();
  }

  private loadUserDetails(): void {
    this.http.get<User>(`http://localhost:8084/api/user/getUser/${this.userId}`).subscribe(
      (user) => {
        this.updateForm.patchValue({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phoneNumber: user.phone_number,
          address: user.address,
          sexe: user.sexe
        });
      },
      (error) => {
        console.error('Error loading user:', error);
      }
    );
  }

  updateUser(): void {
    const updatedUser: User = {
      ...this.updateForm.value,
      user_id: this.userId
    };

    this.http.put(`http://localhost:8084/api/user/updateUser/${this.userId}`, updatedUser).subscribe(
      () => {
        this.router.navigate(['/admin/users']);
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }
}
