import { Component, OnInit, Input } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { GameService } from '../game.service';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss'],
})
export class RowComponent implements OnInit {
  @Input() rowIndex: number;
  cards: number[] = [];
  dropList: number[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getRowCards(this.rowIndex);
    });
  }

  canBeSelected(): boolean {
    return this.gameService.getHightlightedRowIndex() === -1 && !this.gameService.isChoosingCards();
  }

  isYourTurn(): boolean {
    return this.gameService.isYourTurn();
  }

  canDrop(): boolean {
    return this.gameService.getHightlightedRowIndex() === this.rowIndex && !this.gameService.isChoosingCards();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      if (this.cards.length >= 5) {
        this.onTakeRow();
        return;
      }
      const card = +event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.dropList = [];
      this.gameService.putCardInRow(card, this.rowIndex);
    }
  }

  onTakeRow() {
    this.gameService.takeRow(this.rowIndex);
  }
}
