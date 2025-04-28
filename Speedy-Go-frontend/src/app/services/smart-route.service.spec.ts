import { TestBed } from '@angular/core/testing';

import { SmartRouteService } from './smart-route.service';

describe('SmartRouteService', () => {
  let service: SmartRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
