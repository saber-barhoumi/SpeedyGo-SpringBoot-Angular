import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterFrontComponent } from './footer-front.component';

describe('FooterFrontComponent', () => {
  let component: FooterFrontComponent;
  let fixture: ComponentFixture<FooterFrontComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterFrontComponent]
    });
    fixture = TestBed.createComponent(FooterFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
