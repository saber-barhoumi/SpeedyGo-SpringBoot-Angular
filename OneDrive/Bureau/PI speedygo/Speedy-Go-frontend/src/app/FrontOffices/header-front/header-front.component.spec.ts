import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFrontComponent } from './header-front.component';

describe('HeaderFrontComponent', () => {
  let component: HeaderFrontComponent;
  let fixture: ComponentFixture<HeaderFrontComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderFrontComponent]
    });
    fixture = TestBed.createComponent(HeaderFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
