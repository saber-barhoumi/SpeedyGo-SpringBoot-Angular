import { TestBed } from '@angular/core/testing';

import { InternationalShippingService } from './international-shipping.service';

describe('InternationalShippingService', () => {
  let service: InternationalShippingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternationalShippingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
