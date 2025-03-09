import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarpoolingComponent } from './carpooling.component';

describe('CarpoolingComponent', () => {
  let component: CarpoolingComponent;
  let fixture: ComponentFixture<CarpoolingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarpoolingComponent]
    });
    fixture = TestBed.createComponent(CarpoolingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
