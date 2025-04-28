import { Component, OnInit } from '@angular/core';
import { InternationalShippingService, InternationalShipping } from 'src/app/services/international-shipping/international-shipping.service';

@Component({
  selector: 'app-international-shipping',
  templateUrl: './international-shipping.component.html',
  styleUrls: ['./international-shipping.component.css']
})
export class InternationalShippingComponent implements OnInit {
  shipments: InternationalShipping[] = [];
  newShipment: InternationalShipping = {
    originCountry: '',
    destinationCountry: '',
    shippingCost: 0,
    trackingNumber: '',
    weight: 0,
    shippingDate: '',
    estimatedDeliveryDate: '',
    shippingStatus: ''
  };

  isAdding: boolean = true; // True: Adding, False: Editing
  selectedShipment: InternationalShipping | null = null;

  constructor(private shippingService: InternationalShippingService) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.shippingService.getAll().subscribe(data => {
      this.shipments = data;
    });
  }

  addShipment(): void {
    this.shippingService.add(this.newShipment).subscribe(() => {
      this.loadShipments();
      this.resetForm();
    });
  }

  deleteShipment(id: number | undefined): void {
    if (id) {
      this.shippingService.delete(id).subscribe(() => {
        this.loadShipments();
      });
    }
  }

  editShipment(shipment: InternationalShipping): void {
    this.isAdding = false;
    this.selectedShipment = { ...shipment };
    this.newShipment = { ...shipment }; // Load data into the form
  }

  updateExistingShipment(): void {
    if (this.selectedShipment?.id) {
      this.shippingService.update(this.selectedShipment.id, this.newShipment).subscribe(() => {
        this.loadShipments();
        this.resetForm();
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.newShipment = {
      originCountry: '',
      destinationCountry: '',
      shippingCost: 0,
      trackingNumber: '',
      weight: 0,
      shippingDate: '',
      estimatedDeliveryDate: '',
      shippingStatus: ''
    };
    this.isAdding = true;
    this.selectedShipment = null;
  }
}