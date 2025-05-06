import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPaidParcelsComponent } from './all-paid-parcels.component';

describe('AllPaidParcelsComponent', () => {
  let component: AllPaidParcelsComponent;
  let fixture: ComponentFixture<AllPaidParcelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllPaidParcelsComponent]
    });
    fixture = TestBed.createComponent(AllPaidParcelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
