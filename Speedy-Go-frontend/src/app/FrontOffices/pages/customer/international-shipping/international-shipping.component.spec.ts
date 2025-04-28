import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalShippingComponent } from './international-shipping.component';

describe('InternationalShippingComponent', () => {
  let component: InternationalShippingComponent;
  let fixture: ComponentFixture<InternationalShippingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternationalShippingComponent]
    });
    fixture = TestBed.createComponent(InternationalShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
