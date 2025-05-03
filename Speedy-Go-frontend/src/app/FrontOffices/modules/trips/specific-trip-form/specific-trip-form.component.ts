import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';

declare global {
  interface Window {
    initPlacesAutocomplete: () => void;
  }
}
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';

@Component({
  selector: 'app-specific-trip-form',
  templateUrl: './specific-trip-form.component.html',
  styleUrls: ['./specific-trip-form.component.css']
})
export class SpecificTripFormComponent implements OnInit {
  isSubmitting = false;
  
  @ViewChild('departureLocationInput', { static: false }) departureLocationInput!: ElementRef;
  @ViewChild('passThroughLocationInput', { static: false }) passThroughLocationInput!: ElementRef;
  @ViewChild('arrivalLocationInput', { static: false }) arrivalLocationInput!: ElementRef;
  @ViewChild('tripForm', { static: false }) tripForm!: NgForm;

  constructor(
    private specificTripService: SpecificTripService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (!window.google || !window.google.maps) {
      this.loadGoogleMapsScript();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupPlacesAutocomplete();
    }, 500);
  }

  loadGoogleMapsScript() {
    const googleMapsApiKey = 'AIzaSyBQyBRLDvdrrGQk3NT8Sm9c5lX7Nizvj24';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initPlacesAutocomplete`;
    script.async = true;
    script.defer = true;
    
    window['initPlacesAutocomplete'] = () => {
      this.setupPlacesAutocomplete();
    };
    
    document.head.appendChild(script);
  }

  setupPlacesAutocomplete() {
    if (this.departureLocationInput && this.departureLocationInput.nativeElement) {
      const departureAutocomplete = new google.maps.places.Autocomplete(
        this.departureLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      departureAutocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = departureAutocomplete.getPlace();
          if (place && place.formatted_address) {
            this.departureLocationInput.nativeElement.value = place.formatted_address;
            
            if (this.tripForm && this.tripForm.form) {
              this.tripForm.form.patchValue({
                departureLocation: place.formatted_address
              });
              
              const control = this.tripForm.form.get('departureLocation');
              if (control) {
                control.markAsDirty();
                control.markAsTouched();
              }
            }
          }
        });
      });
    }

    if (this.passThroughLocationInput && this.passThroughLocationInput.nativeElement) {
      const passThroughAutocomplete = new google.maps.places.Autocomplete(
        this.passThroughLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      passThroughAutocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = passThroughAutocomplete.getPlace();
          if (place && place.formatted_address) {
            this.passThroughLocationInput.nativeElement.value = place.formatted_address;
            
            if (this.tripForm && this.tripForm.form) {
              this.tripForm.form.patchValue({
                passThroughLocation: place.formatted_address
              });
              
              const control = this.tripForm.form.get('passThroughLocation');
              if (control) {
                control.markAsDirty();
                control.markAsTouched();
              }
            }
          }
        });
      });
    }

    if (this.arrivalLocationInput && this.arrivalLocationInput.nativeElement) {
      const arrivalAutocomplete = new google.maps.places.Autocomplete(
        this.arrivalLocationInput.nativeElement,
        { types: ['geocode'] }
      );
      
      arrivalAutocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = arrivalAutocomplete.getPlace();
          if (place && place.formatted_address) {
            this.arrivalLocationInput.nativeElement.value = place.formatted_address;
            
            if (this.tripForm && this.tripForm.form) {
              this.tripForm.form.patchValue({
                arrivalLocation: place.formatted_address
              });
              
              const control = this.tripForm.form.get('arrivalLocation');
              if (control) {
                control.markAsDirty();
                control.markAsTouched();
              }
            }
          }
        });
      });
    }
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.isSubmitting = true;
      
      const tripData = form.value;
      console.log('Submitting form with data:', tripData);
      
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      const file = fileInput && fileInput.files ? fileInput.files[0] : undefined;
      
      this.specificTripService.createTripLegacy(tripData, file).subscribe({
        next: (response) => {
          console.log('Trip created successfully', response);
          this.isSubmitting = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error creating trip', error);
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('Form is invalid:', form.errors);
    }
  }
}
