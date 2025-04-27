import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAdminComponent } from './register-admin.component';

describe('RegisterAdminComponent', () => {
  let component: RegisterAdminComponent;
  let fixture: ComponentFixture<RegisterAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterAdminComponent]
    });
    fixture = TestBed.createComponent(RegisterAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
