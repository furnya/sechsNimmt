import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() id: number;
  @Input() isSelected: boolean;
  @Output() cardSelected: EventEmitter<number> = new EventEmitter<number>(); 
  bullAmount = 1;

  constructor() {}

  ngOnInit(): void {
    if (this.id === 55) {
      this.bullAmount = 7;
    } else if (this.id % 11 === 0) {
      this.bullAmount = 5;
    } else if (this.id % 10 === 0) {
      this.bullAmount = 3;
    } else if (this.id % 5 === 0) {
      this.bullAmount = 2;
    }
  }

  onCardSelected() {
    this.cardSelected.emit(this.id);
  }
}
