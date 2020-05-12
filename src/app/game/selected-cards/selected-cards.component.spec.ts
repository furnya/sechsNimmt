import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCardsComponent } from './selected-cards.component';

describe('SelectedCardsComponent', () => {
  let component: SelectedCardsComponent;
  let fixture: ComponentFixture<SelectedCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
