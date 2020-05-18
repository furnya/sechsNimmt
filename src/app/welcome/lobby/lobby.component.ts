import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GLOBAL_CONFIG, ENVIRONMENT } from 'src/app/config/global-config';
import { JoinedRoom, Player, GameOptions } from 'src/app/models/game.model';
import { EnterNameDialogComponent } from '../enter-name-dialog/enter-name-dialog.component';
import { RoomCreationService } from '../room-creation.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedRoomIds: string[] = [];
  filteredOptions: Observable<string[]>;
  queuedRoomsSubscription: Subscription;
  joinedRoomSubscription: Subscription;
  joinedRoom: JoinedRoom = null;
  inviteLink = '';
  options: GameOptions;

  constructor(
    private roomCreationService: RoomCreationService,
    private router: Router,
    private route: ActivatedRoute,
    private enterNameDialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {
    this.iconRegistry.addSvgIcon(
      'copy-to-clipboard',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/content-copy.svg'
      )
    );
  }

  ngOnInit() {
    this.options = JSON.parse(JSON.stringify(GLOBAL_CONFIG.defaultOptions));
    const roomId: string = this.route.snapshot.params?.gameId;
    const player: Player = JSON.parse(localStorage.getItem('player_' + roomId));
    if (player?.name) {
      if (!this.roomCreationService.joinedRoom) {
        this.roomCreationService.joinRoomIfAlreadyIn(roomId, player.name);
      } else {
        this.joinedRoom = this.roomCreationService.joinedRoom;
      }
    }
    this.joinedRoomSubscription = this.roomCreationService.joinedRoomChanged.subscribe(
      (joinedRoom: JoinedRoom) => {
        this.joinedRoom = joinedRoom;
        this.options = this.joinedRoom
          ? this.joinedRoom.room.options
          : this.options;
        if (this.joinedRoom && this.joinedRoom.room.started) {
          this.navigateToRoom(this.joinedRoom.room.id);
        }
      }
    );
    this.roomCreationService.roomExists(roomId).subscribe((room) => {
      if (!room.exists || room.started) {
        this.roomCreationService.joinedRoom = null;
        this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
        return;
      }
      if (!player) {
        const dialogRef = this.enterNameDialog.open(EnterNameDialogComponent, {
          data: { roomId },
          closeOnNavigation: true,
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.roomCreationService.joinRoomFromForm(roomId, result, false);
          } else {
            this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
          }
        });
      }
      this.inviteLink = window.location.toString();
    });
  }

  ngOnDestroy() {
    this.joinedRoomSubscription.unsubscribe();
  }

  isCurrentPlayer(player: Player): boolean {
    return player === this.joinedRoom.player;
  }

  isCurrentPlayerName(playerName: string): boolean {
    return playerName === this.joinedRoom.player.name;
  }

  navigateToRoom(gameId: string) {
    this.router.navigate([GLOBAL_CONFIG.urlGamePath, gameId]);
  }

  onChangeOptions() {
    this.roomCreationService.changeOptions(this.options);
  }

  onStartGame() {
    if (this.joinedRoom.player.isHost) {
      this.roomCreationService.startGame();
    }
  }

  onLeaveRoom() {
    this.roomCreationService.leaveRoom();
    this.router.navigate([GLOBAL_CONFIG.urlWelcomePath]);
  }

  selectElementContents(showSnackbar: boolean) {
    if (showSnackbar) {
      this.snackBar.open(
        'In die Zwischenablage kopiert!',
        null,
        {
          duration: 1000,
          panelClass: 'snackbar-center-text'
        }
      );
    }
    var el = document.getElementById('inviteLinkInput');
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
