import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { GameCreationService } from '../game-creation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { startWith, map } from 'rxjs/operators';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

@Component({
  selector: 'app-create-and-join',
  templateUrl: './create-and-join.component.html',
  styleUrls: ['./create-and-join.component.scss']
})
export class CreateAndJoinComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedGameIds: string[] = [];
  filteredOptions: Observable<string[]>;
  queuedGamesSubscription: Subscription;

  constructor(
    private gameCreationService: GameCreationService,
    private errorSnackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.gameCreationService.leaveGame();
    this.setGameIds(this.gameCreationService.queuedGames?.map(game => game.id));
    this.queuedGamesSubscription = this.gameCreationService.queuedGamesChanged.subscribe(
      (gameIds) => {
        this.setGameIds(gameIds);
        this.filteredOptions = this.getFilteredOptions();
      }
    );
  }

  ngAfterViewInit() {
    this.filteredOptions = this.getFilteredOptions();
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.queuedGamesSubscription.unsubscribe();
  }

  private getFilteredOptions(): Observable<string[]> {
    return this.joinGameIdFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(this.queuedGameIds, value))
    );
  }

  private _filter(options, value: string): string[] {
    const filterValue = value?.toLowerCase();
    return options.filter((option) => {
      return option.toLowerCase().includes(filterValue);
    });
  }

  setGameIds(gameIds: string[]) {
    this.queuedGameIds = [];
    gameIds.forEach((gameId: string) => {
      if (gameId) {
        this.queuedGameIds.push(gameId);
      }
    });
  }

  onJoinGame(joinGameForm: NgForm) {
    const gameId = joinGameForm.value.joinGameId;
    if (!this.queuedGameIds.includes(gameId)) {
      this.errorSnackBar.open(
        'Ein Spiel mit dieser ID existiert nicht!',
        null,
        {
          duration: 3000,
        }
      );
      return;
    }
    const error = this.gameCreationService.joinGameFromForm(
      gameId,
      joinGameForm.value.playerName,
      true
    );
    if (error) {
      this.errorSnackBar.open(error, null, {
        duration: 3000,
      });
      return;
    }
    joinGameForm.reset();
  }

  onCreateGame(createGameForm: NgForm) {
    const gameId = createGameForm.value.createGameId;
    if (this.queuedGameIds.includes(gameId)) {
      this.errorSnackBar.open(
        'Ein Spiel mit dieser ID existiert schon!',
        null,
        {
          duration: 3000,
        }
      );
      return;
    }
    this.gameCreationService
      .createGame(
        gameId,
        createGameForm.value.playerName
      );
    createGameForm.reset();
  }

}
