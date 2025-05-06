import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificTripFormComponent } from './specific-trip-form.component';

describe('SpecificTripFormComponent', () => {
  let component: SpecificTripFormComponent;
  let fixture: ComponentFixture<SpecificTripFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecificTripFormComponent]
    });
    fixture = TestBed.createComponent(SpecificTripFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
