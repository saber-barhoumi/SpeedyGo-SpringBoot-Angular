import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffichePaymentComponent } from './affiche-payment.component';

describe('AffichePaymentComponent', () => {
  let component: AffichePaymentComponent;
  let fixture: ComponentFixture<AffichePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffichePaymentComponent]
    });
    fixture = TestBed.createComponent(AffichePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
