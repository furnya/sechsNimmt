import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoomCreationService } from '../room-creation.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-create-and-join',
  templateUrl: './create-and-join.component.html',
  styleUrls: ['./create-and-join.component.scss'],
})
export class CreateAndJoinComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedRoomIds: string[] = [];
  // filteredOptions: Observable<string[]>;
  filteredOptions: string[];
  queuedRoomsSubscription: Subscription;

  constructor(
    private roomCreationService: RoomCreationService,
    private errorSnackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private router: Router,
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
    this.setRoomIds(this.roomCreationService.queuedRoomIds);
    this.queuedRoomsSubscription = this.roomCreationService.queuedRoomsChanged.subscribe(
      (roomIds) => {
        this.setRoomIds(roomIds);
        this.filteredOptions = this.getFilteredOptions();
      }
    );
  }

  ngAfterViewInit() {
    this.filteredOptions = this.getFilteredOptions();
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.queuedRoomsSubscription.unsubscribe();
  }

  private getFilteredOptions(): string[] {
    return this.queuedRoomIds;
  }
  // private getFilteredOptions(): Observable<string[]> {
  //   return this.joinGameIdFormControl.valueChanges.pipe(
  //     startWith(''),
  //     map((value) => this._filter(this.queuedGameIds, value))
  //   );
  // }

  // private _filter(options, value: string): string[] {
  //   const filterValue = value?.toLowerCase();
  //   return options.filter((option) => {
  //     return option.toLowerCase().includes(filterValue);
  //   });
  // }

  setRoomIds(roomIds: string[]) {
    this.queuedRoomIds = [];
    roomIds.forEach((roomId: string) => {
      if (roomId) {
        this.queuedRoomIds.push(roomId);
      }
    });
  }

  onJoinRoom(joinRoomForm: NgForm) {
    const roomId = joinRoomForm.value.joinGameId;
    // if (!this.queuedRoomIds.includes(roomId)) {
    //   this.errorSnackBar.open(
    //     'Ein Spiel mit dieser ID existiert nicht!',
    //     null,
    //     {
    //       duration: 3000,
    //     }
    //   );
    //   return;
    // }
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
}
