import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartRouteComponent } from './smart-route.component';

describe('SmartRouteComponent', () => {
  let component: SmartRouteComponent;
  let fixture: ComponentFixture<SmartRouteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmartRouteComponent]
    });
    fixture = TestBed.createComponent(SmartRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
