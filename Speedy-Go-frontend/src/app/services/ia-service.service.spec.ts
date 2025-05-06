import { TestBed } from '@angular/core/testing';

import { IaServiceService } from './ia-service.service';

describe('IaServiceService', () => {
  let service: IaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
