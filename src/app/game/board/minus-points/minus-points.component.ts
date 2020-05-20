import { Component, OnInit, Inject } from '@angular/core';
import { GameService } from '../../game.service';
import { PlayerState, GameState } from 'src/app/models/game.model';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-minus-points',
  templateUrl: './minus-points.component.html',
  styleUrls: ['./minus-points.component.scss'],
})
export class MinusPointsComponent implements OnInit {
  playerStates: PlayerState[] = [];

  constructor(
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
}
