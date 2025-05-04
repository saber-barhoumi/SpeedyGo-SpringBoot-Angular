import { TestBed } from '@angular/core/testing';

import { RecruitmentService } from './recruitment.service';

describe('RecruitmentService', () => {
  let service: RecruitmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecruitmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
