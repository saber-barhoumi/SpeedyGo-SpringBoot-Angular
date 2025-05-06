import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

interface PaymentDto {
  payment_id: number;
  amount: number;
  payment_date: number; // Epoch timestamp
  payment_method: string;
  user_id: number | null;
  user_email: string | null;
}

@Component({
  selector: 'app-affiche-payment',
  templateUrl: './affiche-payment.component.html',
  styleUrls: ['./affiche-payment.component.css']
})
export class AffichePaymentComponent implements OnInit {
  dataSource = new MatTableDataSource<PaymentDto>([]);
  loading = false;
  displayedColumns: string[] = ['payment_id', 'amount', 'payment_date', 'payment_method', 'user_id', 'user_email', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<PaymentDto[]>('http://localhost:8084/payment/getAll', { headers }).subscribe({
      next: (payments) => {
        console.log('Fetched payments:', payments);
        this.dataSource.data = payments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        const message = error.status === 403
          ? 'Accès refusé : Privilèges administrateur requis'
          : 'Échec du chargement des paiements. Veuillez réessayer plus tard.';
        this.snackBar.open(message, 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  editPayment(paymentId: number): void {
    this.router.navigate(['/admin/edit-payment', paymentId]);
  }

  deletePayment(paymentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      this.http.delete(`http://localhost:8084/payment/delete/${paymentId}`, { headers }).subscribe({
        next: () => {
          this.snackBar.open('Paiement supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadPayments(); // Refresh the table
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.snackBar.open('Échec de la suppression du paiement', 'Fermer', { duration: 5000 });
        }
      });
    }
  }
}