import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffichmapComponent } from './affichmap.component';

describe('AffichmapComponent', () => {
  let component: AffichmapComponent;
  let fixture: ComponentFixture<AffichmapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffichmapComponent]
    });
    fixture = TestBed.createComponent(AffichmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
