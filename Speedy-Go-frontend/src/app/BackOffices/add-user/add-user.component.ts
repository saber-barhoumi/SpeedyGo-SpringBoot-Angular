import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit{
  addUserForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      address: ['', [Validators.required]],
      sexe: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],  // Added field
      password: ['', [Validators.required, Validators.minLength(6)]],  // Added field
      role: ['', [Validators.required]]  // Added field
    });
  }

  onSubmit(): void {
    if (this.addUserForm.valid) {
      this.http.post('http://localhost:8084/api/auth/register', this.addUserForm.value).subscribe(
        (response) => {
          alert('User registered successfully');
          this.router.navigate(['/admin/users']);
        },
        (error) => {
          console.error('Error registering user:', error);
        }
      );
    } else {
      alert('Please fill in all fields correctly.');
    }
  }
}