import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTemplateBackComponent } from './all-template-back.component';

describe('AllTemplateBackComponent', () => {
  let component: AllTemplateBackComponent;
  let fixture: ComponentFixture<AllTemplateBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllTemplateBackComponent]
    });
    fixture = TestBed.createComponent(AllTemplateBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
