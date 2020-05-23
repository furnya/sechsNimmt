import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { GameService } from '../game.service';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameState } from 'src/app/models/game.model';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/utils/document.service';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss'],
})
export class RowComponent implements OnInit, OnDestroy {
  @Input() rowIndex: number;
  cards: number[] = [];
  dropList: number[] = [];
  selectedCardDragLists: string[] = [];
  gameStateSub: Subscription;

  constructor(
    private gameService: GameService,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.gameStateSub = this.gameService.gameStateChanged.subscribe(
      (gamestate: GameState) => {
        this.cards = this.gameService.getRowCards(this.rowIndex);
        this.selectedCardDragLists = gamestate.playerStates
          .filter((ps) => ps.selectedCard !== 0)
          .map((ps) => 'selectedCardDropList_' + ps.player.name);
      }
    );
  }

  ngOnDestroy() {
    this.gameStateSub.unsubscribe();
  }

  canBeSelected(): boolean {
    return (
      this.gameService.getHightlightedRowIndex() === -1 &&
      !this.gameService.isChoosingCards() &&
      this.gameService.anyCardSelected()
    );
  }

  isYourTurn(): boolean {
    return this.gameService.isYourTurn();
  }

  canDrop(): boolean {
    return (
      this.gameService.getHightlightedRowIndex() === this.rowIndex &&
      !this.gameService.isChoosingCards()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container) {
      if (this.cards.length >= GLOBAL_CONFIG.maxCardsInRow) {
        this.onTakeRow();
        return;
      }
      this.dropList = [];
      this.gameService.putCardInRow(this.rowIndex);
    }
  }

  onTakeRow() {
    this.gameService.takeRow(this.rowIndex);
  }

  getDropListWidth() {
    return this.documentService.cardWidth + (document.body.getBoundingClientRect().width / 100) - 2;
  }

  getChooseButtonWidth() {
    return this.documentService.chooseButtonWidth;
  }

  getChooseButtonHeight() {
    return this.documentService.chooseButtonHeight;
  }

  getChooseButtonFontSize() {
    return this.documentService.chooseButtonFontSize;
  }
}
