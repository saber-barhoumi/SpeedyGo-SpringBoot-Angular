import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginclientComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginclientComponent;
  let fixture: ComponentFixture<LoginclientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginclientComponent]
    });
    fixture = TestBed.createComponent(LoginclientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
