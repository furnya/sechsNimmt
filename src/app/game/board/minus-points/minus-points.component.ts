import { Component, Inject, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameState, PlayerState } from 'src/app/models/game.model';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-minus-points',
  templateUrl: './minus-points.component.html',
  styleUrls: ['./minus-points.component.scss'],
})
export class MinusPointsComponent implements OnInit {
  playerStates: PlayerState[] = [];
  canClose = true;

  get minusCards() {
    return this.gameService?.getMinusCards();
  }

  constructor(
    private sheetRef: MatBottomSheetRef,
    private gameService: GameService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.setPlayerStates(this.gameService.gameState);
    this.gameService.gameStateChanged.subscribe((gameState) => {
      this.setPlayerStates(gameState);
    });
  }

  setPlayerStates(gameState: GameState) {
    if (!gameState || !gameState.playerStates) {
      return;
    }
    this.playerStates = gameState.playerStates;
    if (this.isHideMinusPoints()) {
      this.playerStates = this.playerStates.filter(
        (ps) => ps.player.name === this.gameService.player.name
      );
    }
  }

  isHideMinusPoints() {
    return this.gameService.options
      ? this.gameService.options.hideMinusPoints.value
      : GLOBAL_CONFIG.defaultOptions.hideMinusPoints.value;
  }

  get isShowMinusCards() {
    return this.gameService.options
      ? this.gameService.options.showMinusCards.value
      : GLOBAL_CONFIG.defaultOptions.showMinusCards.value;
  }

  onClose() {
    if (this.canClose) {
      this.sheetRef.dismiss();
    }
  }
}
