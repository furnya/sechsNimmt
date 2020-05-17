import { Component, OnInit } from '@angular/core';
import { GameService } from '../../game.service';
import { PlayerState } from 'src/app/models/game.model';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

@Component({
  selector: 'app-minus-points',
  templateUrl: './minus-points.component.html',
  styleUrls: ['./minus-points.component.scss']
})
export class MinusPointsComponent implements OnInit {

  playerStates: PlayerState[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.gameStateChanged.subscribe((gameState) => {
      this.playerStates = gameState.playerStates;
      if (this.isHideMinusPoints()) {
        this.playerStates = this.playerStates.filter(ps => ps.player.name === this.gameService.player.name);
      }
    });
  }

  isHideMinusPoints() {
    return this.gameService.options ? this.gameService.options.hideMinusPoints.value : GLOBAL_CONFIG.defaultOptions.hideMinusPoints.value;
  }

}
