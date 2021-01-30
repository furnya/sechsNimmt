import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, NgForm, NgModel } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { Game, Player } from 'src/app/models/game.model';
import { RoomCreationService } from '../room-creation.service';

@Component({
  selector: 'app-create-and-join',
  templateUrl: './create-and-join.component.html',
  styleUrls: ['./create-and-join.component.scss'],
})
export class CreateAndJoinComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('joinGameIdFormControl') joinGameIdModel: NgModel;
  queuedRoomIds: string[] = [];
  queuedRoomsSubscription: Subscription;
  gameHistory: MatTableDataSource<Game> = new MatTableDataSource([]);
  returnableGames: Game[] = [];
  returnFC = new FormControl();

  constructor(
    private roomCreationService: RoomCreationService,
    private errorSnackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      'sechsnimmt_logo',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/logo.svg'
      )
    );
  }

  ngOnInit(): void {
    this.roomCreationService.clearRoom();
    this.queuedRoomsSubscription = this.roomCreationService.queuedRoomsChanged.subscribe(
      (roomIds) => {
        this.setRoomIds(roomIds);
      }
    );
    this.getGameHistory();
  }

  ngAfterViewInit() {
    this.setRoomIds(this.roomCreationService.queuedRoomIds);
  }

  ngOnDestroy() {
    this.queuedRoomsSubscription.unsubscribe();
  }

  setRoomIds(roomIds: string[]) {
    this.queuedRoomIds = [];
    roomIds.forEach((roomId: string) => {
      if (roomId) {
        this.queuedRoomIds.push(roomId);
      }
    });
    if (!this.joinGameIdModel.control.value && this.queuedRoomIds?.length > 0) {
      this.joinGameIdModel.control.setValue(this.queuedRoomIds[0]);
      this.cdr.detectChanges();
    }
  }

  onJoinRoom(joinRoomForm: NgForm) {
    const roomId = joinRoomForm.value.joinGameId;
    const error = this.roomCreationService.joinRoomFromForm(
      roomId,
      joinRoomForm.value.playerName,
      true
    );
    if (error) {
      this.errorSnackBar.open(error, null, {
        duration: 3000,
      });
      return;
    }
    joinRoomForm.reset();
  }

  onCreateRoom(createRoomForm: NgForm) {
    const roomId = createRoomForm.value.createGameId;
    this.roomCreationService
      .createRoom(roomId, createRoomForm.value.playerName)
      .subscribe((error) => {
        if (error) {
          this.errorSnackBar.open(error, null, {
            duration: 3000,
          });
        } else {
          createRoomForm.reset();
        }
      });
  }

  clearBrowserData() {
    if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
      this.roomCreationService.clearLocalStorage();
      this.getGameHistory();
    }
  }

  getGameHistory() {
    this.roomCreationService.getGameHistory().subscribe(h => {
      h = h.map((g: Game) => {
        const players: Player[] = [];
        Object.keys(g.players).forEach(k => {
          players.push({
            ...g.players[k],
            dbKey: k
          });
        });
        g.players = players;
        return g;
      });
      this.gameHistory.data = h;
      this.returnableGames = h.filter(g => {
        return !!localStorage.getItem('player_' + g.id);
      }).reverse();
      if (this.returnableGames?.length > 0) {
        this.returnFC.setValue(this.returnableGames[0]);
      }
    });
  }

  returnToGameRoute() {
    return '/' + GLOBAL_CONFIG.urlGamePath + '/' + this.returnFC.value?.id;
  }
}
