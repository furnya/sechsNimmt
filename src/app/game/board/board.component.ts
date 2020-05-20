import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FinishedDialogComponent } from 'src/app/game/board/finished-dialog/finished-dialog.component';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MinusPointsComponent } from './minus-points/minus-points.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  gameStateSub: Subscription;
  dialogRef: MatDialogRef<FinishedDialogComponent, any> = null;
  dialogOpen = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    public finishedGameDialog: MatDialog,
    private router: Router,
    private minusPointsBottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    const player = JSON.parse(
      localStorage.getItem('player_' + this.route.snapshot.params.id)
    );
    if (!player) {
      this.router.navigate(['/' + GLOBAL_CONFIG.urlNotFoundPath]);
    }
    this.gameService.startGame(this.route.snapshot.params.id);
    this.gameStateSub = this.gameService.gameStateChanged.subscribe(
      (gameState) => {
        if (this.gameService.playerIndex !== -1 && gameState?.finished) {
          if (this.dialogOpen) {
            this.dialogRef.componentInstance.data = gameState;
          } else {
            this.dialogOpen = true;
            this.dialogRef = this.finishedGameDialog.open(
              FinishedDialogComponent,
              {
                data: gameState,
                disableClose: true,
              }
            );
            this.dialogRef.afterClosed().subscribe((result) => {
              this.dialogOpen = false;
              this.dialogRef = null;
            });
          }
        }
      }
    );
  }

  get minusPoints() {
    return this.gameService.getMinusPoints();
  }

  ngOnDestroy() {
    this.gameStateSub.unsubscribe();
  }

  openAllMinusPoints() {
    this.minusPointsBottomSheet.open(MinusPointsComponent,
      {
        panelClass: 'minus-points-sheet-container'
      });
  }
}
