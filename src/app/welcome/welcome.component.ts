import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { startWith, map, take } from 'rxjs/operators';
import { GameCreationService } from './game-creation.service';
import { Game, Player, JoinedGame } from '../models/game';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class WelcomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedGameIds: string[] = [];
  filteredOptions: Observable<string[]>;
  queuedGamesSubscription: Subscription;
  joinedGameSubscription: Subscription;
  // tslint:disable-next-line: variable-name

  joinedGame: JoinedGame = null;

  constructor(
    private gameCreationService: GameCreationService,
    private errorSnackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.queuedGamesSubscription = this.gameCreationService.queuedGamesChanged.subscribe(
      (gameIds) => {
        this.setGameIds(gameIds);
        this.filteredOptions = this.getFilteredOptions();
      }
    );
    this.joinedGameSubscription = this.gameCreationService.joinedGameChanged.subscribe(
      (joinedGame: JoinedGame) => {
        this.joinedGame = joinedGame;
        if (this.joinedGame && this.joinedGame.game.started) {
          this.navigateToGame(this.joinedGame.game.id);
        }
      }
    );
  }

  ngAfterViewInit() {
    this.filteredOptions = this.getFilteredOptions();
    this.ref.detectChanges();
  }

  setGameIds(gameIds: string[]) {
    this.queuedGameIds = [];
    gameIds.forEach((gameId: string) => {
      if (gameId) {
        this.queuedGameIds.push(gameId);
      }
    });
  }

  ngOnDestroy() {
    this.queuedGamesSubscription.unsubscribe();
    this.joinedGameSubscription.unsubscribe();
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

  isCurrentPlayer(player): boolean {
    return player === this.joinedGame.player;
  }

  isCurrentPlayerName(playerName): boolean {
    return playerName === this.joinedGame.player.name;
  }

  onJoinGame(joinGameForm: NgForm) {
    if (!this.queuedGameIds.includes(joinGameForm.value.joinGameId)) {
      this.errorSnackBar.open(
        'Ein Spiel mit dieser ID existiert nicht!',
        null,
        {
          duration: 3000,
        }
      );
      return;
    }
    const error = this.gameCreationService.joinGame(
      joinGameForm.value.joinGameId,
      joinGameForm.value.playerName
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
      );
    createGameForm.reset();
  }

  navigateToGame(gameId: string) {
    this.router.navigate(['/game', gameId]);
  }

  onStartGame() {
    if (this.joinedGame.player.isHost) {
      this.gameCreationService.startGame();
    }
  }

  onLeaveGame() {
    this.gameCreationService.leaveGame();
  }
}
