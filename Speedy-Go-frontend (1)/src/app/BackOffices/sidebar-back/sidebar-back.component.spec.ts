import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBackComponent } from './sidebar-back.component';

describe('SidebarBackComponent', () => {
  let component: SidebarBackComponent;
  let fixture: ComponentFixture<SidebarBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarBackComponent]
    });
    fixture = TestBed.createComponent(SidebarBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
