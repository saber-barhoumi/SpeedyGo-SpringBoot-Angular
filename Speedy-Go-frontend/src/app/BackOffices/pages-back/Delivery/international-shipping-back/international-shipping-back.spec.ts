import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InternationalShippingBackComponent } from './international-shipping-back';

describe('InternationalShippingComponent', () => {
  let component: InternationalShippingBackComponent;
  let fixture: ComponentFixture<InternationalShippingBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternationalShippingBackComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternationalShippingBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});