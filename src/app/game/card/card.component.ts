import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CARD_TYPE } from 'src/app/models/game.model';
import { DocumentService } from 'src/app/utils/document.service';
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
        return 'white';
      case 2:
        return '#85d9ff';
      case 3:
        return '#ffca4b';
      case 5:
        return '#ff6e8d';
      case 7:
        return '#9229ae';
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
