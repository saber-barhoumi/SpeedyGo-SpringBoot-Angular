import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterBackComponent } from './footer-back.component';

describe('FooterBackComponent', () => {
  let component: FooterBackComponent;
  let fixture: ComponentFixture<FooterBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterBackComponent]
    });
    fixture = TestBed.createComponent(FooterBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
