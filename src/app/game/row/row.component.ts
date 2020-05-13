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
  canBeSelected = false;
  dropList: number[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.canBeSelected = this.rowIndex < 3;
    this.gameService.gameStateChanged.subscribe(() => {
      this.cards = this.gameService.getRowCards(this.rowIndex);
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
      console.log('dropped');
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
}
