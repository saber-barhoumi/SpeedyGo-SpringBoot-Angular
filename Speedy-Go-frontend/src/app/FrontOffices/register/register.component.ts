import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: [localStorage.getItem('firstName') || '', Validators.required],
      lastName: [localStorage.getItem('lastName') || '', Validators.required],
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birthDate: [localStorage.getItem('birthDate') || '', [Validators.required, this.ageValidator]],
      phoneNumber: [localStorage.getItem('phoneNumber') || '', [Validators.pattern('^\\d{8}$')]],
      address: [localStorage.getItem('address') || '', Validators.required],
      profile_picture: [null, Validators.required],
      sexe: [localStorage.getItem('sexe') || 'MEN', Validators.required],
      role: [localStorage.getItem('role') || 'CUSTOMER', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ageValidator(control: any) {
        if (!control.value) {
            return { required: true };
        }

        const birthDate = new Date(control.value);
        const today = new Date();

        // La date de naissance ne doit pas être dans le futur
        if (birthDate >= today) {
            return { invalidDate: true };
        }

        // L'utilisateur doit avoir au moins 18 ans
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 18);

        if (birthDate > minAgeDate) {
            return { underage: true };
        }

        return null; // Date valide
    }


  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const formData = new FormData();
    Object.keys(this.registerForm.value).forEach(key => {
      if (key === 'profile_picture') {
        if (this.selectedFile) {
          formData.append('profile_picture', this.selectedFile, this.selectedFile.name);
        }
      } else {
        formData.append(key, this.registerForm.get(key)?.value);
      }
    });
    this.authService.register(formData).subscribe({
      next: (response) => {
        alert('Registration successful!');
        this.router.navigate(['/login']); // Navigate to login after successful registration
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed'; // Display error message
      }
    });
  }
  private markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }
}