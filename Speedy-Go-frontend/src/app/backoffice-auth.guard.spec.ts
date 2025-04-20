import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { backofficeAuthGuard } from './backoffice-auth.guard';

describe('backofficeAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => backofficeAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
