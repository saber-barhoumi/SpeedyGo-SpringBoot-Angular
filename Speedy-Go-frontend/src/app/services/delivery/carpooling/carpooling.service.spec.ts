import { TestBed } from '@angular/core/testing';

import { CarpoolingService } from './carpooling.service';

describe('CarpoolingService', () => {
  let service: CarpoolingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarpoolingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
