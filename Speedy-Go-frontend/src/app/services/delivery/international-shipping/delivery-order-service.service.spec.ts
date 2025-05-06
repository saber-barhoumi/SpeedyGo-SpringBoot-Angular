import { TestBed } from '@angular/core/testing';

import { DeliveryOrderServiceService } from './delivery-order-service.service';

describe('DeliveryOrderServiceService', () => {
  let service: DeliveryOrderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryOrderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
