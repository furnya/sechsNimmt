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

const YOUR_TURN_PUT_HINT = 'Du bist am Zug. Lege deine Karte an!';
const YOUR_TURN_TAKE_HINT = 'Du bist am Zug. Wähle eine Reihe aus!';
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
  resizeTimeout: any;

  toggleHint() {
    this.hintOpen = !this.hintOpen;
  }

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    public finishedGameDialog: MatDialog,
    private router: Router,
    private minusPointsBottomSheet: MatBottomSheet,
    private cdr: ChangeDetectorRef,
    private documentService: DocumentService
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
        }
        if (gameState.choosingCards && this.gameService.getSelectedCard() === 0) {
          this.hintOpen = true;
          this.hint = CHOOSE_HINT;
        } else if (this.gameService.isYourTurn()) {
          this.hintOpen = true;
          if (this.canTakeRow()) {
            this.hint = YOUR_TURN_TAKE_HINT;
          } else {
            this.hint = YOUR_TURN_PUT_HINT;
          }
        } else {
          this.hintOpen = false;
        }
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.cdr.detectChanges();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    this.resizeTimeout = setTimeout(() => this.documentService.recalculateSize(), 500);
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
