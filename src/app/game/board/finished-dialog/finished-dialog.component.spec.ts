import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishedDialogComponent } from './finished-dialog.component';

describe('FinishedDialogComponent', () => {
  let component: FinishedDialogComponent;
  let fixture: ComponentFixture<FinishedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinishedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
