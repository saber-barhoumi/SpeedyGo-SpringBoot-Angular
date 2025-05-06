import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReturnService } from 'src/app/services/return.service';
import { Returns } from 'src/app/models/return';
import { CalendarView, CalendarMonthViewDay } from 'angular-calendar';
import { addMonths, subMonths } from 'date-fns';

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
    private returnService: ReturnService
  ) {
    this.returnForm = this.fb.group({
      retourstatus: ['', Validators.required],
      reason_description: ['', Validators.required],
      retourtype: ['', Validators.required],
      returnDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.returnForm.valid) {
      const returnData: Returns = this.returnForm.value;
      this.returnService.addReturn(returnData).subscribe({
        next: (response) => {
          console.log('Retour ajouté :', response);
          this.returnForm.reset();
        },
        error: (error) => {
          console.error('Erreur lors de l’ajout :', error);
        }
      });
    }
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  prevMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  onDateSelected(day: CalendarMonthViewDay<any>): void {
    this.selectedDate = day.date;
    this.returnForm.patchValue({ returnDate: this.selectedDate });
  }
}
