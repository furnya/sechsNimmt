import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameState, PlayerState } from 'src/app/models/game.model';

@Component({
  selector: 'app-finished-dialog',
  templateUrl: './finished-dialog.component.html',
  styleUrls: ['./finished-dialog.component.scss'],
})
export class FinishedDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GameState,
    private router: Router
  ) {}

  winnerMessage: string = null;
  playerStates: PlayerState[] = [];

  ngOnInit(): void {
    this.playerStates = JSON.parse(JSON.stringify(this.data.playerStates));
    this.playerStates.sort((a, b) => a.minusPoints - b.minusPoints);
    this.setWinnerMessage();
  }

  setWinnerMessage() {
    const winners: PlayerState[] = this.playerStates.filter((ps) => {
      return (
        ps.minusPoints ===
        Math.min(
          ...this.playerStates.map((playerState) => {
            return playerState.minusPoints;
          })
        )
      );
    });
    if (winners.length === 0) {
      this.winnerMessage = 'Niemand gewinnt';
    } else if (winners.length === 1) {
      this.winnerMessage = winners[0].player.name + ' gewinnt!';
    } else if (winners.length > 1) {
      this.winnerMessage = winners
        .map((winner) => {
          return winner.player.name;
        })
        .reduce((winner, all) => {
          return winner + all + ', ';
        }, '');
      this.winnerMessage =
        this.winnerMessage.substr(0, this.winnerMessage.length - 2) +
        ' gewinnen!';
    }
  }

  onReturnToHome() {
    this.router.navigate([GLOBAL_CONFIG.urlWelcomePath]);
  }
}
