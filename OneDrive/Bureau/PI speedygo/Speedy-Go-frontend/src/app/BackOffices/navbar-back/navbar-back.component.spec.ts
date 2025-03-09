import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarBackComponent } from './navbar-back.component';

describe('NavbarBackComponent', () => {
  let component: NavbarBackComponent;
  let fixture: ComponentFixture<NavbarBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarBackComponent]
    });
    fixture = TestBed.createComponent(NavbarBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
