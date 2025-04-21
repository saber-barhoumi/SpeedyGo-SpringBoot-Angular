// FrontOffices/pages/delivery/carpooling/carpooling.component.ts
import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { TripsService } from 'src/app/services/delivery/trips/trips.service';
import { GouvernoratService } from 'src/app/services/delivery/gouvernorats/gouvernorats.service';
import { Carpooling } from 'src/app/models/carpooling.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css']
})
export class CarpoolingComponent implements OnInit {
  carpoolings: Carpooling[] = [];
  isLoading = false;
  isEditing = false;
  showForm = false;
  calculatedPrice: number | null = null;

  // Dropdown options
  gouvernorats: string[] = [];
  vehicleTypes = ['compact', 'sedan', 'SUV'];
  fuelTypes = ['gasoline', 'diesel'];
  weatherTypes = ['Clear', 'Rain', 'Cloudy'];
  carpoolingForm!: FormGroup;

  constructor(
    private carpoolingService: CarpoolingService,
    private fb: FormBuilder,
    private gouvernoratService: GouvernoratService,
    private tripsService: TripsService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCarpoolings();
    this.gouvernorats = this.gouvernoratService.getGouvernorats();
    this.setupFormListeners();
  }

  initForm(): void {
    // Get current date/time and add 1 hour to set default start time
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours() + 1);
    
    this.carpoolingForm = this.fb.group({
      departureLocation: ['', Validators.required],
      destination: ['', Validators.required],
      startTime: [defaultStartTime.toISOString().slice(0, 16), Validators.required], // Add startTime with default value
      distanceKm: [{ value: '', disabled: true }, Validators.required],
      durationMinutes: [{ value: '', disabled: true }, Validators.required],
      vehicleType: ['', Validators.required],
      fuelType: ['', Validators.required],
      availableSeats: [1, [
        Validators.required, 
        Validators.min(1), 
        Validators.max(4)
      ]],
      description: [''],
      wifi: [0],
      airConditioning: [0],
      weatherType: ['Clear']
    });
  }

  setupFormListeners(): void {
    this.gouvernorats = this.gouvernoratService.getGouvernorats();

    // Listen for changes in departure and destination
    this.carpoolingForm.get('departureLocation')?.valueChanges.subscribe(() => {
      this.updateTripDetails();
    });

    this.carpoolingForm.get('destination')?.valueChanges.subscribe(() => {
      this.updateTripDetails();
    });
  }

  updateTripDetails(): void {
    const departure = this.carpoolingForm.get('departureLocation')?.value;
    const destination = this.carpoolingForm.get('destination')?.value;

    if (departure && destination) {
      this.tripsService.findTripByLocations(departure, destination).subscribe({
        next: (trip) => {
          this.carpoolingForm.patchValue({
            distanceKm: trip.distance_km,
            durationMinutes: trip.duration_minutes
          });
        },
        error: (error) => {
          console.error('Error fetching trip details', error);
        }
      });
    }
  }

  editCarpooling(carpooling: Carpooling): void {
    this.isEditing = true;
    this.showForm = true;
    
    // Enable the form controls that are normally disabled
    this.carpoolingForm.get('distanceKm')?.enable();
    this.carpoolingForm.get('durationMinutes')?.enable();
    
    // Set the carpooling ID for updating
    if (!this.carpoolingForm.contains('carpoolingId')) {
      this.carpoolingForm.addControl('carpoolingId', this.fb.control(carpooling.carpoolingId));
    } else {
      this.carpoolingForm.get('carpoolingId')?.setValue(carpooling.carpoolingId);
    }
    
    // Format the start time for the datetime-local input
    let startTimeFormatted = '';
    if (carpooling.startTime) {
      const startTime = new Date(carpooling.startTime);
      startTimeFormatted = startTime.toISOString().slice(0, 16);
    }
    
    // Populate the form with the carpooling data
    this.carpoolingForm.patchValue({
      departureLocation: carpooling.departureLocation,
      destination: carpooling.destination,
      startTime: startTimeFormatted,
      distanceKm: carpooling.distanceKm,
      durationMinutes: carpooling.durationMinutes,
      vehicleType: carpooling.vehicleType,
      fuelType: carpooling.fuelType,
      availableSeats: carpooling.availableSeats,
      wifi: carpooling.wifi || 0,
      airConditioning: carpooling.airConditioning || 0,
      weatherType: carpooling.weatherType || 'Clear',
      description: carpooling.description || ''
    });
    
    // Set the calculated price
    this.calculatedPrice = carpooling.pricePerSeat;
    
    // After form is populated, disable the read-only fields again
    this.carpoolingForm.get('distanceKm')?.disable();
    this.carpoolingForm.get('durationMinutes')?.disable();
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadCarpoolings(): void {
    this.isLoading = true;
    this.carpoolingService.getAllCarpoolings().subscribe({
      next: (data) => {
        this.carpoolings = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading carpoolings', error);
        this.isLoading = false;
      }
    });
  }

  calculatePrice(): void {
    this.isLoading = true;
    const carpoolingData = this.carpoolingForm.getRawValue();
    
    this.carpoolingService.calculatePrice(carpoolingData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Check if response is an object with price
        if (response && typeof response === 'object' && 'price' in response) {
          // Update form with distance and duration if provided
          if ('distanceKm' in response && response.distanceKm) {
            this.carpoolingForm.get('distanceKm')?.setValue(response.distanceKm);
          }
          
          if ('durationMinutes' in response && response.durationMinutes) {
            this.carpoolingForm.get('durationMinutes')?.setValue(response.durationMinutes);
          }
          
          // Set the price as a number
          this.calculatedPrice = parseFloat(response.price);
        } else {
          // If response is just the price directly
          this.calculatedPrice = typeof response === 'number' ? response : parseFloat(response);
        }
      },
      error: (error) => {
        console.error('Error calculating price', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.carpoolingForm.invalid) {
      return;
    }

    this.isLoading = true;
    const carpoolingData = this.carpoolingForm.getRawValue();

    if (this.isEditing) {
      // Update existing carpooling
      this.updateCarpooling(carpoolingData);
    } else {
      // Create new carpooling
      this.createCarpooling(carpoolingData);
    }
  }

  createCarpooling(carpoolingData: Carpooling): void {
    // Add the calculated price to the carpooling data
    carpoolingData.pricePerSeat = this.calculatedPrice as number;
    
    // Ensure all required fields are present and properly formatted
    const formData = {
      departureLocation: carpoolingData.departureLocation,
      destination: carpoolingData.destination,
      distanceKm: Number(carpoolingData.distanceKm),
      durationMinutes: Number(carpoolingData.durationMinutes),
      vehicleType: carpoolingData.vehicleType,
      fuelType: carpoolingData.fuelType,
      availableSeats: Number(carpoolingData.availableSeats),
      pricePerSeat: this.calculatedPrice,
      startTime: typeof carpoolingData.startTime === 'string' ? 
                 new Date(carpoolingData.startTime).toISOString() : 
                 carpoolingData.startTime,
      wifi: carpoolingData.wifi ? 1 : 0,
      airConditioning: carpoolingData.airConditioning ? 1 : 0,
      description: carpoolingData.description || '',
      weatherType: carpoolingData.weatherType || 'Clear'
    };
    
    console.log('Sending carpooling data:', formData);
    
    this.carpoolingService.createCarpooling(formData as Carpooling).subscribe({
      next: () => {
        this.loadCarpoolings();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating carpooling', error);
        this.isLoading = false;
      }
    });
  }

  updateCarpooling(carpoolingData: Carpooling): void {
    // Add the calculated price to the carpooling data
    carpoolingData.pricePerSeat = this.calculatedPrice as number;
    
    const currentCarpoolingId = this.carpoolingForm.get('carpoolingId')?.value;
    
    this.carpoolingService.updateCarpooling(currentCarpoolingId, carpoolingData).subscribe({
      next: () => {
        this.loadCarpoolings();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error updating carpooling', error);
        this.isLoading = false;
      }
    });
  }

  deleteCarpooling(id: number | undefined): void {
    if (!id) {
      console.error('Cannot delete carpooling: No carpooling ID provided');
      return;
    }
  
    this.isLoading = true;
    this.carpoolingService.deleteCarpooling(id).subscribe({
      next: () => {
        this.loadCarpoolings();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting carpooling', error);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.carpoolingForm.reset();
    this.isEditing = false;
    this.showForm = false;
    this.calculatedPrice = null;
    this.initForm();
  }
}