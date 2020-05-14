import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAndJoinComponent } from './create-and-join.component';

describe('CreateAndJoinComponent', () => {
  let component: CreateAndJoinComponent;
  let fixture: ComponentFixture<CreateAndJoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAndJoinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAndJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
