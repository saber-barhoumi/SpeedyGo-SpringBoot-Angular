import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarMonthViewDay, CalendarView } from 'angular-calendar';  
import { addMonths, subMonths, startOfDay } from 'date-fns';
import { ReturnService } from 'src/app/services/return.service'; 

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

  constructor(private fb: FormBuilder, private returnService: ReturnService) {
    this.returnForm = this.fb.group({
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required],
      retourdate: ['', Validators.required],
      retourstatus: ['PENDING'] // Ajout du statut par défaut ici
    });
  }

  // Méthode qui met à jour la date sélectionnée
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
        },
        error: (err: any) => { 
          console.error('Erreur lors de l\'ajout du retour :', err);
        }
      });
    }
  }

  onDayClick(day: CalendarMonthViewDay): void {
    const date = day.date;
    const isSunday = date.getDay() === 0;
  
    if (isSunday) {
      console.warn('Dimanche sélection désactivée');
      return; // ignore le clic
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
