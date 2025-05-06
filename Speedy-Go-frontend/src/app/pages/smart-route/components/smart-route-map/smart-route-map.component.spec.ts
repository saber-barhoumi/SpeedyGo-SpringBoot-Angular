import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartRouteMapComponent } from './smart-route-map.component';

describe('SmartRouteMapComponent', () => {
  let component: SmartRouteMapComponent;
  let fixture: ComponentFixture<SmartRouteMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmartRouteMapComponent]
    });
    fixture = TestBed.createComponent(SmartRouteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
