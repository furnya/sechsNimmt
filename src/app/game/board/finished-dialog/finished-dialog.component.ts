import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameState, PlayerState } from 'src/app/models/game.model';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-finished-dialog',
  templateUrl: './finished-dialog.component.html',
  styleUrls: ['./finished-dialog.component.scss'],
})
export class FinishedDialogComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<FinishedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameState,
    private router: Router,
    private gameService: GameService
  ) {
  }


  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

  get isHost() {
    return this.gameService.player?.isHost;
  }

  getSortedPlayerStates(): PlayerState[] {
    const playerStates = JSON.parse(JSON.stringify(this.data.playerStates));
    return playerStates?.sort((a: PlayerState, b: PlayerState) => a.minusPoints - b.minusPoints);
  }

  getWinnerMessage() {
    const playerStates = JSON.parse(JSON.stringify(this.data.playerStates));
    const winners: PlayerState[] = playerStates.filter((ps) => {
      return (
        ps.minusPoints ===
        Math.min(
          ...playerStates.map((playerState) => {
            return playerState.minusPoints;
          })
        )
      );
    });
    if (winners.length === 0) {
      return 'Niemand gewinnt';
    } else if (winners.length === 1) {
      return winners[0].player.name + ' gewinnt!';
    } else if (winners.length > 1) {
      let winnerMessage = winners
        .map((winner) => {
          return winner.player.name;
        })
        .reduce((winner, all) => {
          return winner + all + ', ';
        }, '');
      winnerMessage =
        winnerMessage.substr(0, winnerMessage.length - 2) +
        ' gewinnen!';
      return winnerMessage;
    }
  }

  onStartNewGame() {
    this.gameService.startAnotherGame();
  }

  onReturnToHome() {
    if (confirm('Dieses Spiel wirklich verlassen?')) {
      this.dialogRef.close();
      this.router.navigate([GLOBAL_CONFIG.urlWelcomePath]);
    }
  }
}
