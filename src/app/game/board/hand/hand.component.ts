import { Component, OnInit } from '@angular/core';
import { GameService, NO_CARD_SELECTED } from '../../game.service';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { DocumentService } from 'src/app/utils/document.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards: number[] = [];
  selectedCard = NO_CARD_SELECTED;

  constructor(private gameService: GameService, private documentService: DocumentService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getHandCards()?.slice().sort((a, b) => a - b);
    });
  }

  onCardSelected(id: number) {
    if (this.selectedCard === id) {
      this.selectedCard = NO_CARD_SELECTED;
    } else {
      this.selectedCard = id;
    }
  }

  onConfirmSelection() {
    if (this.selectedCard === NO_CARD_SELECTED) {
      return;
    }
    this.gameService.selectCard(this.selectedCard);
    this.selectedCard = NO_CARD_SELECTED;
  }

  canSelect() {
    return this.gameService.canSelect();
  }

  getChooseButtonWidth() {
    return this.documentService.chooseButtonWidth * 1.2;
  }

  getChooseButtonHeight() {
    return this.documentService.chooseButtonHeight;
  }

  getChooseButtonFontSize() {
    return this.documentService.chooseButtonFontSize;
  }
}
