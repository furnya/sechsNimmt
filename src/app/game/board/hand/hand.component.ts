import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { DocumentService } from 'src/app/utils/document.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards: number[] = [];
  selectedCard = 0;

  constructor(private gameService: GameService, private documentService: DocumentService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getHandCards()?.slice().sort((a, b) => a - b);
    });
  }

  onCardSelected(id: number) {
    if (this.selectedCard === id) {
      this.selectedCard = 0;
    } else {
      this.selectedCard = id;
    }
  }

  onConfirmSelection() {
    if (this.selectedCard === 0) {
      return;
    }
    this.gameService.selectCard(this.selectedCard);
    this.selectedCard = 0;
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
