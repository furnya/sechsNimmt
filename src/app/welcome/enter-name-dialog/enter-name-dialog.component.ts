import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

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
    @Inject(MAT_DIALOG_DATA) public data: {gameId: string},
    private router: Router
  ) {}

  confirm() {
    this.dialogRef.close(this.playerName);
  }

  onReturnToHome(): void {
    this.dialogRef.close();
    this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.nameField.nativeElement.focus();
  }
}
