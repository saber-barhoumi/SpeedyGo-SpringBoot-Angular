import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarMonthViewDay, CalendarView } from 'angular-calendar';  
import { addMonths, subMonths, startOfDay } from 'date-fns';
import { ReturnService } from 'src/app/services/return.service'; 
import { Router } from '@angular/router'; // ✅ Ajout
import Swal from 'sweetalert2';


@Component({
  selector: 'app-returnform',
  templateUrl: './returnform.component.html',
  styleUrls: ['./returnform.component.css']
})
export class ReturnFormComponent {
  returnForm: FormGroup;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  selectedDate: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private returnService: ReturnService,
    private router: Router // ✅ Injection
  ) {
    this.returnForm = this.fb.group({
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required],
      retourdate: ['', Validators.required],
      retourstatus: ['PENDING']
    });
  }

  onDateSelected(event: { day: { date: Date } }): void {
    this.selectedDate = startOfDay(event.day.date);
    this.returnForm.patchValue({ retourdate: this.selectedDate });
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  prevMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  onSubmit(): void {
    if (this.returnForm.valid) {
      const formData = this.returnForm.value;
      console.log('Form data:', formData);
  
      this.returnService.createReturn(formData).subscribe({
        next: (response: any) => { 
          console.log('Retour ajouté avec succès', response);
          this.returnForm.reset();
  
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Retour ajouté avec succès !',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/customer']); // ✅ Redirection après confirmation
          });
        },
        error: (err: any) => { 
          console.error('Erreur lors de l\'ajout du retour :', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de l\'ajout du retour.'
          });
        }
      });
    }
  }
  

  onDayClick(day: CalendarMonthViewDay): void {
    const date = day.date;
    const isSunday = date.getDay() === 0;
  
    if (isSunday) {
      console.warn('Dimanche sélection désactivée');
      return;
    }
  
    this.selectedDate = date;
    this.returnForm.patchValue({ retourdate: this.selectedDate });
  }

  dayModifier: (day: CalendarMonthViewDay) => void = (day) => {
    if (day.date.getDay() === 0) {
      day.cssClass = 'cal-disabled-day';
    }
  };
}
