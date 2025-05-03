import { TestBed } from '@angular/core/testing';

import { SpecificTripService } from './specific-trip.service';

describe('SpecificTripService', () => {
  let service: SpecificTripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecificTripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
