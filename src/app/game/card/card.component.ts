import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() id: number;
  @Input() isSelected: boolean;
  @Input() isSmallestCard = false;
  @Output() cardSelected: EventEmitter<number> = new EventEmitter<number>();
  bullAmount = 1;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
  }

  getBullAmount(): number {
    return this.gameService.calculateMinusPoints(this.id);
  }

  onCardSelected() {
    this.cardSelected.emit(this.id);
  }
}
