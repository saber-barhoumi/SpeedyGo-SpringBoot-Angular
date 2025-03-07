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
 
  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger selon son rôle
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      const userRole = (user.role || '').toUpperCase();
      if (userRole === 'DELEVERY') {
        this.router.navigate(['/delivery']);
      } else if (userRole === 'PARTNER') {
        this.router.navigate(['/partner']);
      } else if (userRole === 'CUSTOMER') {
        this.router.navigate(['/customer']);
      } else {
        this.router.navigate(['/home']);
      }
    }

    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      birth_date: ['', [Validators.required, this.ageValidator]],
      phone_number: ['', [Validators.pattern('^\\d{8}$')]],
      address: ['', Validators.required],
      profile_picture: [''],
      sexe: ['MALE'],
      role: ['CUSTOMER'] // Valeur par défaut, modifiez si nécessaire
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur pour l'âge (doit être au moins 18 ans)
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

  // Validateur pour confirmer le mot de passe
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Copier les données du formulaire et retirer le champ confirmPassword
    const userData = { ...this.registerForm.value };
    delete userData.confirmPassword;

    this.authService.register(userData).subscribe({
      next: (response) => {
        alert('Registration successful!');
        // Récupérer et comparer le rôle en majuscules
        const role = (this.registerForm.get('role')?.value || '').toUpperCase();
        if (role === 'DELEVERY') {
          this.router.navigate(['/delivery']);
        } else if (role === 'PARTNER') {
          this.router.navigate(['/partner']);
        } else if (role === 'CUSTOMER') {
          this.router.navigate(['/customer']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Registration failed';
      }
    });
  }

  // Méthode d'aide pour marquer tous les contrôles comme touchés (pour afficher les messages d'erreur)
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
