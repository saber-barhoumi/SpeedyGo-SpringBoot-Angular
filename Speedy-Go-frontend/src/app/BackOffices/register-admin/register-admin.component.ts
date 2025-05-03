import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.css']
})
export class RegisterAdminComponent {
  registerForm: FormGroup;
  submitted = false;
  errorMessage = '';
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      birth_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone_number: ['', Validators.required],
      address: ['', Validators.required],
      sexe: ['', Validators.required],
      newsletter: [false],
      role: ['ADMIN']
    });
  }

  get f() { return this.registerForm.controls as { [key: string]: any }; }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  register(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    const formData = new FormData();
    // Ajouter tous les champs du formulaire au FormData
    for (const key in this.registerForm.value) {
      if (this.registerForm.value.hasOwnProperty(key)) {
        formData.append(key, this.registerForm.value[key]);
      }
    }
    // Ajouter le fichier s'il existe
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        alert('Registration successful!');
        this.router.navigate(['/loginAdmin']);
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Registration failed. Try again.';
      }
    });
  }
}
