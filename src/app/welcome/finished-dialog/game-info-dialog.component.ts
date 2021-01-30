import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Game, PlayerState } from 'src/app/models/game.model';

@Component({
  selector: 'app-game-info-dialog',
  templateUrl: './game-info-dialog.component.html',
  styleUrls: ['./game-info-dialog.component.scss'],
})
export class GameInfoDialogComponent implements OnInit, OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<GameInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Game
  ) {}

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit(): void {
    this.sort.sort({
      id: 'totalMinusPoints',
      start: 'asc',
      disableClear: false
    });
  }

  ngOnDestroy() {
  }

  getSortedPlayerStates(): MatTableDataSource<PlayerState> {
    const playerStates: PlayerState[] = JSON.parse(JSON.stringify(this.data.gameState.playerStates));
    const playerStatesDataSource: MatTableDataSource<PlayerState> = new MatTableDataSource(playerStates);
    playerStatesDataSource.sort = this.sort;
    return playerStatesDataSource;
  }
}
