import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { GameService, NO_CARD_SELECTED } from '../../game.service';
import { PlayerState } from 'src/app/models/game.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-selected-cards',
  templateUrl: './selected-cards.component.html',
  styleUrls: ['./selected-cards.component.scss'],
})
export class SelectedCardsComponent implements OnInit, OnDestroy {
  playerStates: PlayerState[] = [];
  gameStateSub: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameStateSub = this.gameService.gameStateChanged.subscribe((gameState) => {
      this.playerStates = JSON.parse(
        JSON.stringify(
          gameState.playerStates.filter((ps) => ps.selectedCard !== NO_CARD_SELECTED)
        )
      );
      if (this.canPlay()) {
        this.playerStates.sort((a, b) => a.selectedCard - b.selectedCard);
      }
    });
  }

  ngOnDestroy() {
    this.gameStateSub.unsubscribe();
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

  canDrop(): boolean {
    return this.gameService.canDropCard();
  }
}
