import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Payment {
  paymentId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentIntentId: string | null;
  user: { userId: number; email: string } | null;
}

@Component({
  selector: 'app-edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.css']
})
export class EditPaymentComponent implements OnInit {
  paymentForm: FormGroup;
  paymentId: number;
  originalPayment: Payment | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: ['', Validators.required],
      userId: [null],
      userEmail: [null]
    });
    this.paymentId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadPayment();
  }

  loadPayment(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<Payment>(`http://localhost:8084/payment/get/${this.paymentId}`, { headers }).subscribe({
      next: (payment) => {
        this.originalPayment = payment;
        console.log('Loaded payment:', payment);
        this.paymentForm.patchValue({
          amount: payment.amount,
          paymentMethod: payment.paymentMethod || 'CREDIT_CARD',
          userId: payment.user ? payment.user.userId : null,
          userEmail: payment.user ? payment.user.email : null
        });
      },
      error: (error) => {
        console.error('Error loading payment:', error);
        this.snackBar.open('Échec du chargement du paiement', 'Fermer', { duration: 5000 });
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid && this.originalPayment) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      const updatedPayment = {
        paymentId: this.paymentId,
        amount: this.paymentForm.value.amount,
        paymentDate: this.originalPayment.paymentDate,
        paymentMethod: this.paymentForm.value.paymentMethod,
        paymentIntentId: this.originalPayment.paymentIntentId || null,
        user: this.paymentForm.value.userId ? {
          userId: this.paymentForm.value.userId,
          email: this.paymentForm.value.userEmail || null
        } : null
      };

      console.log('Submitting updated payment:', updatedPayment);

      this.http.put(`http://localhost:8084/payment/update/${this.paymentId}`, updatedPayment, { headers }).subscribe({
        next: () => {
          this.snackBar.open('Paiement mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/affiche_payment']);
        },
        error: (error) => {
          console.error('Error updating payment:', error);
          this.snackBar.open('Échec de la mise à jour du paiement', 'Fermer', { duration: 5000 });
        }
      });
    } else {
      console.warn('Form is invalid or original payment is null:', this.paymentForm.value);
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/affiche_payment']);
  }
}