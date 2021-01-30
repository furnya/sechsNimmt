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
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
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

  clearBrowserDara() {
    if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
      this.roomCreationService.clearLocalStorage();
    }
  }
}
