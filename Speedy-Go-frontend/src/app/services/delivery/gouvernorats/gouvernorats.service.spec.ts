import { TestBed } from '@angular/core/testing';

import { GouvernoratsService } from './gouvernorats.service';

describe('GouvernoratsService', () => {
  let service: GouvernoratsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GouvernoratsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
