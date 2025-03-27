import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InternationalShipping {
  id?: number;
  originCountry: string;
  destinationCountry: string;
  shippingCost: number;
  trackingNumber: string;
  weight: number;
  shippingDate: string;
  estimatedDeliveryDate: string;
  shippingStatus: string;
}