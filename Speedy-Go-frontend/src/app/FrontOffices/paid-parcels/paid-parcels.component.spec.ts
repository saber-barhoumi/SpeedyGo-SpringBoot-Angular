import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidParcelsComponent } from './paid-parcels.component';

describe('PaidParcelsComponent', () => {
  let component: PaidParcelsComponent;
  let fixture: ComponentFixture<PaidParcelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaidParcelsComponent]
    });
    fixture = TestBed.createComponent(PaidParcelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
