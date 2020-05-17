import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinusPointsComponent } from './minus-points.component';

describe('MinusPointsComponent', () => {
  let component: MinusPointsComponent;
  let fixture: ComponentFixture<MinusPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinusPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinusPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
