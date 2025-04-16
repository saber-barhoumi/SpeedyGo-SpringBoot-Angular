import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { TripsService } from 'src/app/services/delivery/trips/trips.service';
import { GouvernoratService } from 'src/app/services/delivery/gouvernorats/gouvernorats.service';
import { Carpooling } from 'src/app/models/carpooling.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Add these imports

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
  gouvernorats: string[] = []; // Remove loadGouvernorats method
  vehicleTypes = ['compact', 'sedan', 'SUV'];
  fuelTypes = ['gasoline', 'diesel'];
  weatherTypes = ['Clear', 'Rain', 'Cloudy'];
  carpoolingForm!: FormGroup; // Use non-null assertion operator

  constructor(
    private carpoolingService: CarpoolingService,
    private fb: FormBuilder, // Use FormBuilder with injection
    private gouvernoratService: GouvernoratService,
    private tripsService: TripsService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCarpoolings();
    this.gouvernorats = this.gouvernoratService.getGouvernorats(); // Direct assignment
    this.setupFormListeners();
  }

  initForm(): void {
    this.carpoolingForm = this.fb.group({
      departureLocation: ['', Validators.required],
      destination: ['', Validators.required],
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
      next: (price) => {
        this.calculatedPrice = price;
        this.isLoading = false;
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
    this.carpoolingService.createCarpooling(carpoolingData).subscribe({
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
    // Assuming you have a way to get the current carpooling ID when editing
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

  deleteCarpooling(id: number): void {
    this.isLoading = true;
    this.carpoolingService.deleteCarpooling(id).subscribe({
      next: () => {
        this.loadCarpoolings();
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