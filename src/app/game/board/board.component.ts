import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FinishedDialogComponent } from 'src/app/game/board/finished-dialog/finished-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {

  gameStateSub: Subscription;

  constructor(private route: ActivatedRoute, private gameService: GameService, public finishedGameDialog: MatDialog) { }

  ngOnInit(): void {
    this.gameService.startGame(this.route.snapshot.params.id);
    this.gameStateSub = this.gameService.gameStateChanged.subscribe(gameState => {
      if (this.gameService.playerIndex !== -1 && gameState?.finished) {
        const dialogRef = this.finishedGameDialog.open(FinishedDialogComponent, {
          data: gameState
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    });
  }

  ngOnDestroy() {
    this.gameStateSub.unsubscribe();
  }

}
