import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarMonthViewDay, CalendarView } from 'angular-calendar';  // Pas besoin de MonthViewDay ou DayView ici
import { addMonths, subMonths, startOfDay } from 'date-fns';

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

  constructor(private fb: FormBuilder) {
    this.returnForm = this.fb.group({
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required],
      retourdate: ['', Validators.required]
    });
  }

  // Méthode qui met à jour la date sélectionnée
  onDateSelected(event: { day: { date: Date } }): void {
    this.selectedDate = startOfDay(event.day.date); // Utilisation de event.day.date directement
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
      console.log('Form data:', this.returnForm.value);
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
