import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingOrderComponent } from './shipping-order.component';

describe('ShippingOrderComponent', () => {
  let component: ShippingOrderComponent;
  let fixture: ComponentFixture<ShippingOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShippingOrderComponent]
    });
    fixture = TestBed.createComponent(ShippingOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
