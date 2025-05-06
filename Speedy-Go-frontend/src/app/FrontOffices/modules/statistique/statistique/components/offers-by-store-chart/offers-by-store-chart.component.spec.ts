import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersByStoreChartComponent } from './offers-by-store-chart.component';

describe('OffersByStoreChartComponent', () => {
  let component: OffersByStoreChartComponent;
  let fixture: ComponentFixture<OffersByStoreChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OffersByStoreChartComponent]
    });
    fixture = TestBed.createComponent(OffersByStoreChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
