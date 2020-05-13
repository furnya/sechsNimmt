import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards = [];

  selectedCard = 2;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getHandCards();
    });
  }

  onCardSelected(id: number) {
    this.selectedCard = id;
  }

}
