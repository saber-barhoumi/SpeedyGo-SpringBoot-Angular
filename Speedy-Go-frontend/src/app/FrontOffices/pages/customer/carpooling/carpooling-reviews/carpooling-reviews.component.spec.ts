import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarpoolingReviewsComponent } from './carpooling-reviews.component';

describe('CarpoolingReviewsComponent', () => {
  let component: CarpoolingReviewsComponent;
  let fixture: ComponentFixture<CarpoolingReviewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarpoolingReviewsComponent]
    });
    fixture = TestBed.createComponent(CarpoolingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
