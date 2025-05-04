import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyBackComponent } from './body-back.component';

describe('BodyBackComponent', () => {
  let component: BodyBackComponent;
  let fixture: ComponentFixture<BodyBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BodyBackComponent]
    });
    fixture = TestBed.createComponent(BodyBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
