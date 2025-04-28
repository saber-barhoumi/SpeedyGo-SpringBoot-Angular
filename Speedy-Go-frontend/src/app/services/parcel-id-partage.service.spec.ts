import { TestBed } from '@angular/core/testing';

import { ParcelIdPartageService } from './parcel-id-partage.service';

describe('ParcelIdPartageService', () => {
  let service: ParcelIdPartageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcelIdPartageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
