import { Component, OnInit } from '@angular/core';
import { CarpoolingService } from 'src/app/services/delivery/carpooling/carpooling.service';
import { Carpooling } from 'src/app/models/carpooling.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-carpooling',
  templateUrl: './carpooling.component.html',
  styleUrls: ['./carpooling.component.css'],
})
export class CarpoolingComponent implements OnInit {
  isLoading: boolean = false;
  isEditing: boolean = false;
  showForm: boolean = false;
  showList: boolean = false;

  showAddCarpooling: boolean = false;
  showAllCarpoolings: boolean = false;

  carpoolings: Carpooling[] = [];
  newCarpooling: Carpooling = this.initializeCarpooling();
  editingIndex: number | null = null;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private carpoolingService: CarpoolingService) {
    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-dark-blue',
      dateInputFormat: 'YYYY-MM-DD HH:mm',
      showWeekNumbers: false,
    });
  }

  ngOnInit(): void {
    this.loadCarpoolings();
  }

  toggleAddCarpooling(): void {
    this.showAddCarpooling = !this.showAddCarpooling;
    this.showAllCarpoolings = false;
  }

  toggleList() {
    this.showList = !this.showList;
    this.showForm = false; // Cache le formulaire si on ouvre la liste
  }
  
  toggleForm() {
    this.showForm = !this.showForm;
    this.showList = false; // Cache la liste si on ouvre le formulaire
  }
  toggleShowAllCarpoolings(): void {
    this.showAllCarpoolings = !this.showAllCarpoolings;
    this.showAddCarpooling = false;
  }

  loadCarpoolings(): void {
    this.isLoading = true;
    this.carpoolingService.getAllCarpoolings().subscribe({
      next: (data) => {
        this.carpoolings = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading carpoolings:', error);
        this.isLoading = false;
      },
    });
  }

  addCarpooling(): void {
    this.isLoading = true;
    const carpoolingToSend = this.prepareCarpooling(this.newCarpooling);
    
    this.carpoolingService.addCarpooling(carpoolingToSend).subscribe({
      next: () => {
        this.loadCarpoolings();
        this.resetForm();
        this.showAddCarpooling = false;
      },
      error: (error) => {
        console.error('Error adding carpooling:', error);
        this.isLoading = false;
      },
    });
  }

  deleteCarpooling(id: number): void {
    this.carpoolingService.deleteCarpooling(id).subscribe({
      next: () => {
        this.loadCarpoolings();
      },
      error: (error) => {
        console.error('Error deleting carpooling:', error);
      },
    });
  }

  editCarpooling(carpooling: Carpooling): void {
    this.isEditing = true;
    this.editingIndex = this.carpoolings.findIndex(c => c.carpoolingId === carpooling.carpoolingId);
    this.newCarpooling = { ...carpooling };
    this.showAddCarpooling = true;
    this.showAllCarpoolings = false;
  }

  updateCarpooling(): void {
    if (!this.newCarpooling.carpoolingId) {
      console.error('Carpooling ID is undefined. Cannot update carpooling.');
      return;
    }

    this.isLoading = true;
    const carpoolingToSend = this.prepareCarpooling(this.newCarpooling);
    
    this.carpoolingService.updateCarpooling(carpoolingToSend).subscribe({
      next: () => {
        this.loadCarpoolings();
        this.resetForm();
        this.showAddCarpooling = false;
      },
      error: (error) => {
        console.error('Error updating carpooling:', error);
        this.isLoading = false;
      },
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.newCarpooling = this.initializeCarpooling();
  }

  private initializeCarpooling(): Carpooling {
    return {
      carpoolingId: undefined,
      driverName: '',
      departureLocation: '',
      destination: '',
      arrivalTime: '',
      availableSeats: 0,
      pricePerSeat: 0,
      description: '',
    };
  }

  private prepareCarpooling(carpooling: Carpooling): Carpooling {
    return {
      ...carpooling,
      arrivalTime: carpooling.arrivalTime ? new Date(carpooling.arrivalTime).toISOString() : null,
    };
  }
  
}