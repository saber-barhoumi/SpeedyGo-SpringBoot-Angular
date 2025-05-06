import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';

declare global {
  interface Window {
    initPlacesAutocomplete: () => void;
  }
}
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecificTripService } from 'src/app/FrontOffices/services/specific-trip/specific-trip.service';
import { ImageAnalysisService } from 'src/app/FrontOffices/services/image-analysis/image-analysis.service';
import { PdfService } from 'src/app/FrontOffices/services/pdf/pdf.service';

@Component({
  selector: 'app-specific-trip-form',
  templateUrl: './specific-trip-form.component.html',
  styleUrls: ['./specific-trip-form.component.css']
})
export class SpecificTripFormComponent implements OnInit {
  isSubmitting = false;
  isAnalyzing = false;
  isGeneratingPDF = false;
  apiError = '';
  
  @ViewChild('departureLocationInput', { static: false }) departureLocationInput!: ElementRef;
  @ViewChild('passThroughLocationInput', { static: false }) passThroughLocationInput!: ElementRef;
  @ViewChild('arrivalLocationInput', { static: false }) arrivalLocationInput!: ElementRef;
  @ViewChild('tripForm', { static: false }) tripForm!: NgForm;

  constructor(
    private specificTripService: SpecificTripService,
    private imageAnalysisService: ImageAnalysisService,
    private pdfService: PdfService,
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

  /**
   * Analyze the uploaded parcel image and auto-fill form fields
   */
  analyzeParcelImage(): void {
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    const file = fileInput && fileInput.files ? fileInput.files[0] : undefined;
    
    if (!file) {
      this.apiError = 'Please upload an image first';
      return;
    }
    
    this.isAnalyzing = true;
    this.apiError = '';
    
    this.imageAnalysisService.analyzeImage(file).subscribe({
      next: (response) => {
        console.log('Image analysis response:', response);
        this.isAnalyzing = false;
        
        // Update the form with the analysis results
        if (this.tripForm && this.tripForm.form) {
          this.tripForm.form.patchValue({
            parcelDescription: response.package_description || '',
            parcelLength: response.Length || 0,
            parcelWidth: response.Width || 0,
            parcelHeight: response.Height || 0
          });
        }
      },
      error: (error) => {
        console.error('Error analyzing image:', error);
        this.isAnalyzing = false;
        this.apiError = 'Failed to analyze image. Please try again or fill in the details manually.';
      }
    });
  }

  /**
   * Generate a PDF document with the trip details
   */
  generatePDF(): void {
    if (this.tripForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.tripForm.form.controls).forEach(key => {
        this.tripForm.form.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isGeneratingPDF = true;
    
    // Get the form data
    const tripData = this.tripForm.value;
    
    // Generate the PDF
    this.pdfService.generateTripPDF(tripData)
      .then(pdfBlob => {
        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Create a link element and trigger a download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `speedy-go-trip-${new Date().getTime()}.pdf`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(blobUrl);
        this.isGeneratingPDF = false;
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        this.isGeneratingPDF = false;
        // You could show an error message here
      });
  }
}