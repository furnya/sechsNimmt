import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CARD_TYPE } from 'src/app/models/game.model';
import { DocumentService } from 'src/app/utils/document.service';
import { GameService } from '../game.service';

const BULL_COLOR_1 = 'white';
const BULL_COLOR_2 = '#85d9ff';
const BULL_COLOR_3 = '#ffca4b';
const BULL_COLOR_5 = '#ff6e8d';
const BULL_COLOR_7 = '#9229ae';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() id: number;
  @Input() isSelected: boolean;
  @Input() isSmallestCard = false;
  @Input() type: CARD_TYPE;
  @Output() cardSelected: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private gameService: GameService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
  }

  getBullAmount(): number[] {
    const bullAmount = this.gameService.calculateMinusPoints(this.id)
    return bullAmount === -1 ? [] : Array.from(Array(bullAmount).keys());
  }

  flexBasisBull(bullAmount: number, index: number) {
    switch (bullAmount) {
      case 1:
        return '100%';
      case 2:
        return '50%';
      case 3:
        return '33%';
      case 5:
        return '33%';
      case 7:
        return '25%';
    }
    return 'auto';
  }

  backgroundColorBull(bullAmount: number) {
    switch (bullAmount) {
      case 1:
        return BULL_COLOR_1;
      case 2:
        return BULL_COLOR_2;
      case 3:
        return BULL_COLOR_3;
      case 5:
        return BULL_COLOR_5;
      case 7:
        return BULL_COLOR_7;
    }
    return 'white';
  }

  onCardSelected() {
    this.cardSelected.emit(this.id);
  }

  getCardWidth() {
    return this.documentService.cardWidth;
  }

  getCardHeight() {
    return this.documentService.cardHeight;
  }

  getCardFontSize() {
    return this.documentService.cardFontSize;
  }
}
