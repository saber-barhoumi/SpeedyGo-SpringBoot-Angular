import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentDetailComponent } from './recruitment-detail.component';

describe('RecruitmentDetailComponent', () => {
  let component: RecruitmentDetailComponent;
  let fixture: ComponentFixture<RecruitmentDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecruitmentDetailComponent]
    });
    fixture = TestBed.createComponent(RecruitmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
