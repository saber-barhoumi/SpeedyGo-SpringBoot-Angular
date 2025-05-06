import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentFormComponent } from './recruitment-form.component';

describe('RecruitmentFormComponent', () => {
  let component: RecruitmentFormComponent;
  let fixture: ComponentFixture<RecruitmentFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecruitmentFormComponent]
    });
    fixture = TestBed.createComponent(RecruitmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
