import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TripService } from '../trip/trip.service';

@Component({
  selector: 'app-trip-edit-dialog',
  templateUrl: './trip-edit-dialog.component.html',
  styleUrls: ['./trip-edit-dialog.component.css']
})
export class TripEditDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    public dialogRef: MatDialogRef<TripEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { trip: any }
  ) {
    this.editForm = this.fb.group({
      destination: [data.trip.destination, Validators.required],
      start_location: [data.trip.start_location, Validators.required],
      end_location: [data.trip.end_location, Validators.required],
      trip_date: [data.trip.trip_date, Validators.required],
      trip_status: [data.trip.trip_status, Validators.required]
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.tripService.updateTrip(this.data.trip.id, this.editForm.value).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating trip', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
