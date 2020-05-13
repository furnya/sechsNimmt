import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { startWith, map, take } from 'rxjs/operators';
import { GameCreationService } from './game-creation.service';
import { QueuedGame, Player } from '../models/queuedGame.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WelcomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedGames: QueuedGame[] = [];
  queuedGameIds: string[] = [];
  filteredOptions: Observable<string[]>;
  queuedGamesSubscription: Subscription;
  // tslint:disable-next-line: variable-name

  currentPlayerName: string = null;
  currentPlayer: Player = null;
  currentGameId: string = null;
  players: Player[] = [];

  constructor(
    private gameCreationService: GameCreationService,
    private errorSnackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.queuedGamesSubscription = this.gameCreationService.queuedGamesChanged.subscribe(
      (games) => {
        this.setGames(games);
        this.filteredOptions = this.getFilteredOptions();
      }
    );
  }

  ngAfterViewInit() {
    this.filteredOptions = this.getFilteredOptions();
    this.ref.detectChanges();
  }

  setGames(games: QueuedGame[]) {
    this.queuedGames = games;
    this.queuedGameIds = [];
    games.forEach((game) => {
      if (game.id) {
        this.queuedGameIds.push(game.id);
      }
    });
    if (this.currentGameId) {
      this.players = this.getGamePlayers(this.currentGameId);
    }
    if (this.currentPlayerName) {
      this.currentPlayer = this.getPlayer(this.currentPlayerName);
    }
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

  private getGameKey(gameId: string): string {
    let gameKey: string;
    this.queuedGames.forEach((game) => {
      if (game.id === gameId) {
        gameKey = game.dbKey;
      }
    });
    return gameKey;
  }

  getPlayer(playerName: string) {
    let player: Player = null;
    this.players.forEach((p) => {
      if (p.name === playerName) {
        player = p;
      }
    });
    return player;
  }

  private getGamePlayers(gameId: string): Player[] {
    let players: Player[] = [];
    this.queuedGames.forEach((game) => {
      if (game.id === gameId) {
        players = game.players;
      }
    });
    return players;
  }

  isCurrentPlayer(player): boolean {
    return player === this.currentPlayer;
  }

  isCurrentPlayerName(playerName): boolean {
    return playerName === this.currentPlayerName;
  }

  onJoinGame(joinGameForm: NgForm) {
    const gameKey = this.getGameKey(joinGameForm.value.joinGameId);
    if (!gameKey) {
      this.errorSnackBar.open(
        'Ein Spiel mit dieser ID existiert nicht!',
        null,
        {
          duration: 3000,
        }
      );
      return;
    }
    this.gameCreationService.joinGame(gameKey, joinGameForm.value.playerName);
    this.currentPlayerName = joinGameForm.value.playerName;
    this.currentGameId = joinGameForm.value.joinGameId;
    joinGameForm.reset();
  }

  onCreateGame(createGameForm: NgForm) {
    if (this.queuedGameIds.includes(createGameForm.value.createGameId)) {
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
        createGameForm.value.createGameId,
        createGameForm.value.playerName
      )
      .subscribe(() => {
        this.currentPlayerName = createGameForm.value.playerName;
        this.currentGameId = createGameForm.value.createGameId;
        createGameForm.reset();
        this.players = this.getGamePlayers(this.currentGameId);
        this.currentPlayer = this.getPlayer(this.currentPlayerName);
      });
  }

  onStartGame() {
    if (this.currentPlayer.isHost) {
      this.router.navigate(['/game']);
    }
  }

  onLeaveGame() {
    this.currentPlayer = null;
    this.currentPlayerName = null;
    this.players = [];
    this.currentGameId = null;
  }
}
