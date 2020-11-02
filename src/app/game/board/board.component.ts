import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FinishedDialogComponent } from 'src/app/game/board/finished-dialog/finished-dialog.component';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MinusPointsComponent } from './minus-points/minus-points.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DocumentService } from 'src/app/utils/document.service';
import { timeout } from 'rxjs/operators';

const YOUR_TURN_PUT_HINT = 'Du bist am Zug. Lege deine Karte an!';
const YOUR_TURN_TAKE_HINT = 'Du bist am Zug. Wähle eine Reihe aus!';
const NOT_YOUR_TURN_HINT = ' ist am Zug.';
const CHOOSE_HINT = 'Wähle eine Karte aus!';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  animations: [
    trigger('showHideHint', [
      // ...
      state('open', style({
        top: '0'
      })),
      state('closed', style({
        top: '-10vh'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  gameStateSub: Subscription;
  dialogRef: MatDialogRef<FinishedDialogComponent, any> = null;
  dialogOpen = false;
  hintOpen = false;
  hint: string = null;
  showTimeout = false;
  timeout;
  timeoutInterval;
  timeLeft = 0;
  get timeLeftString() {
    return Math.floor(this.timeLeft / 60) + ':' + (this.timeLeft % 60 < 10 ? '0' + this.timeLeft % 60 : this.timeLeft % 60);
  }
  shouldSelectRandomCard = false;

  toggleHint() {
    this.hintOpen = !this.hintOpen;
  }

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
                panelClass: 'finished-dialog'
              }
            );
            this.dialogRef.afterClosed().subscribe((result) => {
              this.dialogOpen = false;
              this.dialogRef = null;
            });
          }
        } else {
          this.finishedGameDialog.closeAll();
        }
        if (gameState.choosingCards && this.gameService.getSelectedCard() === 0) {
          this.hintOpen = true;
          this.hint = CHOOSE_HINT;
          if (this.shouldSelectRandomCard) {
            const cardIndex = Math.floor(Math.random() * this.gameService.getHandCards().length);
            this.gameService.selectCard(this.gameService.getHandCards()[cardIndex]);
          } else if (!this.timeout && !this.gameService.options.thinkingTimeoutDisabled.value) {
            this.showTimeout = true;
            this.timeLeft = this.gameService.options.maxThinkingTime.value;
            this.timeoutInterval = setInterval(() => {
              this.timeLeft--;
            }, 1000);
            this.timeout = setTimeout(() => {
              this.shouldSelectRandomCard = true;
              this.showTimeout = false;
              clearInterval(this.timeoutInterval);
              const cardIndex = Math.floor(Math.random() * this.gameService.getHandCards().length);
              this.gameService.selectCard(this.gameService.getHandCards()[cardIndex]).then(() => {
                this.shouldSelectRandomCard = true;
              });
            }, this.gameService.options.maxThinkingTime.value * 1000);
          }
        } else {
          if (!this.gameService.options.thinkingTimeoutDisabled.value) {
            this.shouldSelectRandomCard = false;
            this.showTimeout = false;
            clearInterval(this.timeoutInterval);
            clearTimeout(this.timeout);
            this.timeout = null;
          }
          if (this.gameService.isYourTurn()) {
            this.hintOpen = true;
            if (this.canTakeRow()) {
              this.hint = YOUR_TURN_TAKE_HINT;
            } else {
              this.hint = YOUR_TURN_PUT_HINT;
            }
          } else if (!gameState.choosingCards && this.gameService.getTurnPlayerName()) {
            this.hintOpen = true;
            this.hint = this.gameService.getTurnPlayerName() + NOT_YOUR_TURN_HINT;
          } else {
            this.hintOpen = false;
          }
        }
      }
    );
  }

  canTakeRow(): boolean {
    return (
      this.gameService.getHightlightedRowIndex() === -1 &&
      !this.gameService.isChoosingCards()
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
