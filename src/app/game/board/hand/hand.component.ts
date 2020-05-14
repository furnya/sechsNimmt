import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards: number[] = [];
  selectedCard = 0;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getHandCards();
    });
  }

  onCardSelected(id: number) {
    this.selectedCard = id;
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

  get minusPoints() {
    return this.gameService.getMinusPoints();
  }

}
