import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-selected-cards',
  templateUrl: './selected-cards.component.html',
  styleUrls: ['./selected-cards.component.scss']
})
export class SelectedCardsComponent implements OnInit {

  playerNames: string[] = [];
  selectedCards: number[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.selectedCards = [];
      this.playerNames = [];
      this.gameService.gameState.playerStates.forEach(ps => {
        if (ps.selectedCard !== 0) {
          this.selectedCards.push(ps.selectedCard);
          this.playerNames.push(ps.player.name);
        }
      });
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  isCurrentPlayer(name: string): boolean {
    return name === this.gameService.player?.name;
  }

}
