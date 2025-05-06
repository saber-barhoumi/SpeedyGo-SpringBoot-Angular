import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarpoolingCustomerComponent } from './carpooling-customer.component';

describe('CarpoolingCustomerComponent', () => {
  let component: CarpoolingCustomerComponent;
  let fixture: ComponentFixture<CarpoolingCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarpoolingCustomerComponent]
    });
    fixture = TestBed.createComponent(CarpoolingCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
