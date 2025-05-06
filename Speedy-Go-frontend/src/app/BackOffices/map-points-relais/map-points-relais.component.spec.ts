import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPointsRelaisComponent } from './map-points-relais.component';

describe('MapPointsRelaisComponent', () => {
  let component: MapPointsRelaisComponent;
  let fixture: ComponentFixture<MapPointsRelaisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapPointsRelaisComponent]
    });
    fixture = TestBed.createComponent(MapPointsRelaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
