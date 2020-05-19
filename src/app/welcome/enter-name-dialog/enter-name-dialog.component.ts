import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { RoomCreationService } from '../room-creation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-enter-name-dialog',
  templateUrl: './enter-name-dialog.component.html',
  styleUrls: ['./enter-name-dialog.component.scss'],
})
export class EnterNameDialogComponent implements OnInit, AfterViewInit {

  playerName: string = null;
  @ViewChild('nameField') nameField: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<EnterNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {roomId: string},
    private router: Router,
    private roomCreationService: RoomCreationService,
    private errorSnackBar: MatSnackBar
  ) {}

  confirm() {
    const error = this.roomCreationService.joinRoomFromForm(
      this.data.roomId,
      this.playerName,
      false
    );
    if (error) {
      this.errorSnackBar.open(error, null, {
        duration: 3000,
      });
      return;
    }
    this.dialogRef.close(true);
  }

  onReturnToHome(): void {
    this.dialogRef.close(false);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
