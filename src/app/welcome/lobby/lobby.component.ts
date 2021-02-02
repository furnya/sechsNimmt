import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameOptions, JoinedRoom, Player } from 'src/app/models/game.model';
import { EnterNameDialogComponent } from '../enter-name-dialog/enter-name-dialog.component';
import { filterActivePlayers } from '../filter-is-active.pipe';
import { RoomCreationService } from '../room-creation.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  animations: [
    trigger('showHideHint', [
      // ...
      state(
        'open',
        style({
          top: '0',
        })
      ),
      state(
        'closed',
        style({
          top: '-10vh',
        })
      ),
      transition('open => closed', [animate('0.5s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class LobbyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cardsFormControl') cardsFormControl: ElementRef;
  queuedRoomIds: string[] = [];
  queuedRoomsSubscription: Subscription;
  joinedRoomSubscription: Subscription;
  joinedRoom: JoinedRoom = null;
  inviteLink = '';
  options: GameOptions;
  isActiveInterval: any;
  hintOpen = false;
  hint: string = null;

  toggleHint() {
    this.hintOpen = !this.hintOpen;
  }

  constructor(
    private roomCreationService: RoomCreationService,
    private router: Router,
    private route: ActivatedRoute,
    private enterNameDialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.iconRegistry.addSvgIcon(
      'copy-to-clipboard',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/content-copy.svg'
      )
    );
  }

  ngOnInit() {
    this.roomCreationService.generateRandomSequence(
      GLOBAL_CONFIG.defaultOptions.cards.value
    );
    this.isActiveInterval = setInterval(
      () => this.roomCreationService.keepPlayerActive(),
      GLOBAL_CONFIG.activePingInterval
    );
    this.options = JSON.parse(JSON.stringify(GLOBAL_CONFIG.defaultOptions));
    const roomId: string = this.route.snapshot.params?.gameId;
    const player: Player = JSON.parse(localStorage.getItem('player_' + roomId));
    if (player?.name && this.roomCreationService.joinedRoom) {
      this.joinedRoom = this.roomCreationService.joinedRoom;
      this.options = this.joinedRoom
        ? this.joinedRoom.room.options
        : this.options;
    }
    this.joinedRoomSubscription = this.roomCreationService.joinedRoomChanged.subscribe(
      (joinedRoom: JoinedRoom) => {
        this.joinedRoom = joinedRoom;
        this.options = this.joinedRoom
          ? this.joinedRoom.room.options
          : this.options;
        if (
          !this.joinedRoom?.player.isHost ||
          !this.cardsFormControl.nativeElement.value
        ) {
          this.cardsFormControl.nativeElement.value = this.options.cards.value;
          this.cdr.detectChanges();
        }
        if (this.joinedRoom && this.joinedRoom.room.started) {
          this.navigateToGame(this.joinedRoom.room.id);
        }
      }
    );
    this.roomCreationService.roomExists(roomId).subscribe((roomExists) => {
      if (!roomExists.exists || roomExists.started) {
        this.roomCreationService.joinedRoom = null;
        this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
        return;
      }
      const playerExists = this.roomCreationService
        .getRoom(roomId)
        ?.players?.find((p) => p.name === player?.name);
      if (!player || !playerExists) {
        const dialogRef = this.enterNameDialog.open(EnterNameDialogComponent, {
          data: { roomId },
          closeOnNavigation: true,
          disableClose: true,
          panelClass: 'enter-name-dialog',
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (!result) {
            this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
          }
        });
      } else {
        this.roomCreationService.joinRoomIfAlreadyIn(roomId, player.name);
      }
      this.inviteLink = window.location.toString();
    });
  }

  ngAfterViewInit() {
    this.cardsFormControl.nativeElement.value = this.joinedRoom?.room?.options
      ? this.joinedRoom.room.options.cards.value
      : null;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.joinedRoomSubscription.unsubscribe();
    clearInterval(this.isActiveInterval);
  }

  get maxPlayersPossibleValues() {
    let maxPlayers = Math.floor(
      (this.options.cards.value - this.options.rows.value) /
        this.options.rounds.value
    );
    maxPlayers = Math.min(GLOBAL_CONFIG.globalMaxPlayers, maxPlayers);
    return Array.from(Array(maxPlayers + 1).keys()).slice(1);
  }

  onCardsChanged(event) {
    let newVal = +event.target.value;
    if (newVal < 1 || newVal > 999) {
      this.cardsFormControl.nativeElement.value =
        GLOBAL_CONFIG.defaultOptions.cards.value;
      this.cdr.detectChanges();
      newVal = GLOBAL_CONFIG.defaultOptions.cards.value;
    }
    this.options.cards.value = newVal;
    this.roomCreationService.generateRandomSequence(newVal);
    this.onChangeOptions();
  }

  isCurrentPlayer(player: Player): boolean {
    return player === this.joinedRoom.player;
  }

  isCurrentPlayerName(playerName: string): boolean {
    return playerName === this.joinedRoom.player.name;
  }

  navigateToGame(gameId: string) {
    this.router.navigate([GLOBAL_CONFIG.urlGamePath, gameId]);
  }

  onChangeOptions() {
    this.roomCreationService.changeOptions(this.options);
    if (
      this.options.rows.value +
        this.options.rounds.value * this.options.maxPlayers.value >
      this.options.cards.value
    ) {
      this.hintOpen = true;
      this.hint = 'Ungültige Optionen!';
      return;
    }
    const players = filterActivePlayers(this.joinedRoom?.room?.players);
    const playerCount = players ? players.length : 0;
    if (playerCount > this.options.maxPlayers.value) {
      this.hintOpen = true;
      this.hint = 'Zu viele Spieler!';
      return true;
    }
    this.hintOpen = false;
  }

  disableStart(): boolean {
    const players = filterActivePlayers(this.joinedRoom?.room?.players);
    const playerCount = players ? players.length : 0;
    if (playerCount > this.options.maxPlayers.value) {
      return true;
    }
    if (
      this.options.rows.value +
        this.options.rounds.value * this.options.maxPlayers.value >
      this.options.cards.value
    ) {
      return true;
    }
    return false;
  }

  onStartGame() {
    if (this.joinedRoom.player.isHost) {
      this.roomCreationService.startGame();
    }
  }

  onLeaveRoom() {
    this.router.navigate([GLOBAL_CONFIG.urlWelcomePath]);
  }

  selectElementContents(showSnackbar: boolean) {
    if (showSnackbar) {
      this.snackBar.open('In die Zwischenablage kopiert!', null, {
        duration: 1000,
        panelClass: 'snackbar-center-text',
      });
    }
    const el = document.getElementById('inviteLinkInput');
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
