import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { GameService } from '../../game.service';
import { PlayerState } from 'src/app/models/game.model';

@Component({
  selector: 'app-selected-cards',
  templateUrl: './selected-cards.component.html',
  styleUrls: ['./selected-cards.component.scss'],
})
export class SelectedCardsComponent implements OnInit {
  playerStates: PlayerState[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe((gameState) => {
      this.playerStates = JSON.parse(
        JSON.stringify(
          gameState.playerStates.filter((ps) => ps.selectedCard !== 0)
        )
      );
      if (this.canPlay()) {
        this.playerStates.sort((a, b) => a.selectedCard - b.selectedCard);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {}

  isCurrentPlayer(name: string): boolean {
    return name === this.gameService.player?.name;
  }

  isSmallestCard(card: number): boolean {
    return card === Math.min(...this.playerStates.map((ps) => ps.selectedCard));
  }

  canPlay(): boolean {
    return !this.gameService.isChoosingCards();
  }
}
