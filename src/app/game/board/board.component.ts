import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FinishedDialogComponent } from 'src/app/game/board/finished-dialog/finished-dialog.component';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  gameStateSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    public finishedGameDialog: MatDialog,
    private router: Router
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
          this.finishedGameDialog.closeAll();
          const dialogRef = this.finishedGameDialog.open(
            FinishedDialogComponent,
            {
              data: gameState,
            }
          );
          dialogRef.afterClosed().subscribe((result) => {});
        }
      }
    );
  }

  ngOnDestroy() {
    this.gameStateSub.unsubscribe();
  }
}
