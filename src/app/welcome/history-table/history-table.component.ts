import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Game } from 'src/app/models/game.model';
import { GameInfoDialogComponent } from '../finished-dialog/game-info-dialog.component';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.scss']
})
export class HistoryTableComponent implements OnInit, OnDestroy, AfterContentChecked {
  @Input() games: MatTableDataSource<Game>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private cdr: ChangeDetectorRef, private infoDialog: MatDialog) {}

  ngOnInit(): void {
    this.games.sort = this.sort;
    const tempSort = this.games.sortData;
    this.games.sortData = (data, sort) => {
      if (sort.active === 'id') {
        return data.sort((a, b) => sort.direction === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
      } else {
        return tempSort(data, sort);
      }
    };
    this.sort.sort({
      id: 'created',
      start: 'desc',
      disableClear: true,
    });
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {}

  openInfoDialog(game: Game) {
    this.infoDialog.open(GameInfoDialogComponent, {
      data: game,
      panelClass: 'game-info-dialog'
    });
  }
}
