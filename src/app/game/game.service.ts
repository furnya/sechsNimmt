import { Injectable } from '@angular/core';
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, take, takeWhile, tap } from 'rxjs/operators';
import { GLOBAL_CONFIG } from '../config/global-config';
import {
  Game,
  GameOptions,
  GameState,
  Player,
  PlayerState,
} from '../models/game.model';
import { HttpService } from '../utils/http.service';
import { playerIsActive } from '../welcome/filter-is-active.pipe';

export const NO_PLAYER_INDEX = -1;
export const NO_CARD_SELECTED = 0;
export const NO_HIGHLIGHTED_ROW = -1;

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // tslint:disable-next-line: variable-name
  private _player: Player = null;
  gameState: GameState = null;
  gameStateChanged = new Subject<GameState>();
  gameId: string = null;
  gameKey: string = null;
  gameKeySub: Subscription;
  gameStateSub: Subscription;
  playerIndex = NO_PLAYER_INDEX;
  options: GameOptions;
  selectedCardLocally = NO_CARD_SELECTED;
  randomSequence: number[] = [];

  get player() {
    return this._player;
  }

  set player(player: Player) {
    this._player = player;
  }

  setPlayerLocalStorage(player: Player, gameId: string) {
    this.player = player;
    localStorage.setItem('player_' + gameId, JSON.stringify(player));
  }

  deletePlayerLocalStorage(gameId: string) {
    this.player = null;
    localStorage.removeItem('player_' + gameId);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  constructor(
    private db: AngularFireDatabase,
    private router: Router,
    private httpService: HttpService
  ) {}

  subscribeToGameStateChanges() {
    this.player = JSON.parse(localStorage.getItem('player_' + this.gameId));
    this.gameStateSub = this.db
      .object(GLOBAL_CONFIG.dbGamePath() + '/' + this.gameKey)
      .valueChanges()
      .pipe(
        tap((game: Game) => {
          this.options = game?.options;
        }),
        map((game: Game) => game?.gameState)
      )
      .subscribe((gameState: GameState) => {
        this.gameState = gameState;
        if (this.setPlayerIndex()) {
          if (this.gameState) {
            this.gameStateChanged.next(
              JSON.parse(JSON.stringify(this.gameState))
            );
            this.checkDisableSelecting();
          } else {
            this.gameStateChanged.next(null);
          }
        }
      });
  }

  unsubscribeFromGameChanges() {
    this.gameKeySub?.unsubscribe();
    this.gameStateSub?.unsubscribe();
    this.player = null;
    this.gameKey = null;
  }

  checkDisableSelecting() {
    if (this.player?.isHost && !this.gameState?.finished) {
      if (this.gameState?.choosingCards) {
        if (!this.allCardSelected()) {
          return;
        }
        this.gameState.choosingCards = false;
        this.pushGameStateToDB();
      } else {
        if (this.anyCardSelected()) {
          return;
        }
        this.gameState.choosingCards = true;
        this.gameState.round++;
        if (this.gameState.round === this.options?.rounds.value + 1) {
          this.gameState.finished = true;
          this.increasePlayedRounds();
          this.gameState.choosingCards = false;
          this.gameState.playerStates.forEach((ps) => {
            ps.totalMinusPoints += ps.minusPoints;
          });
        }
        this.pushGameStateToDB();
      }
    }
  }

  setPlayerIndex(): boolean {
    this.playerIndex = this.gameState?.playerStates.findIndex((ps) => {
      return ps.player.name === this.player?.name;
    });
    if (this.playerIndex === NO_PLAYER_INDEX) {
      this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
      return false;
    }
    return true;
  }

  setGameKey() {
    this.gameKeySub = this.db
      .list(GLOBAL_CONFIG.dbGamePath())
      .snapshotChanges()
      .pipe(
        takeWhile(() => !this.gameKey),
        map((changes) => {
          // console.log(changes);
          let key: string = null;
          changes.forEach((change) => {
            const value: {
              id?: string;
            } = change.payload.val();
            if (value && value.id && value.id === this.gameId) {
              key = change.payload.key;
            }
          });
          return key;
        })
      )
      .subscribe((key: string) => {
        this.gameKey = key;
        if (this.gameKey) {
          this.subscribeToGameStateChanges();
        } else if (!this.player) {
          this.router.navigate(['/' + GLOBAL_CONFIG.urlNotFoundPath]);
        }
      });
  }

  startGame(gameId: string) {
    this.gameId = gameId;
    this.setGameKey();
  }

  pushNewGameState(gameId: string, options: GameOptions) {
    this.startGame(gameId);
    if (!this.gameState && this.player && this.player.isHost) {
      this.db
        .object(GLOBAL_CONFIG.dbQueuePath())
        .valueChanges()
        .pipe(take(1))
        .subscribe((games) => {
          if (!games) {
            // TODO: handle error
            return;
          }
          let players = null;
          let created = 0;
          Object.keys(games).forEach((key) => {
            if (games[key]?.id === gameId && games[key]?.players) {
              players = games[key]?.players;
              created = games[key].created;
              this.options = games[key].options;
            }
          });
          const playersClone = JSON.parse(JSON.stringify(players));
          const playerArray: Player[] = [];
          Object.keys(players).forEach((key) => {
            if (playerIsActive(players[key])) {
              playerArray.push(players[key]);
            } else {
              delete playersClone[key];
            }
          });
          let gameState = this.createNewGameState(playerArray);
          gameState = this.distributeCards(gameState);
          const game: Game = {
            id: gameId,
            players: playersClone,
            gameState,
            options,
            created,
            playedRounds: 0,
          };
          this.db.list(GLOBAL_CONFIG.dbGamePath()).push(game);
        });
    }
  }

  createNewGameState(players: Player[]): GameState {
    const playerStates: PlayerState[] = [];
    players.forEach((player) => {
      playerStates.push({
        hand: [],
        minusPoints: 0,
        totalMinusPoints: 0,
        selectedCard: NO_CARD_SELECTED,
        player,
        minusCards: [],
      });
    });
    const boardRows: number[][] = [];
    return {
      boardRows,
      playerStates,
      choosingCards: true,
      round: 1,
      finished: false,
    };
  }

  startAnotherGame() {
    if (this.player?.isHost) {
      this.gameState = this.distributeCards(this.gameState);
      this.gameState.finished = false;
      this.gameState.round = 1;
      this.gameState.choosingCards = true;
      this.pushGameStateToDB();
    }
  }

  distributeCards(gameState: GameState): GameState {
    if (!gameState) {
      return;
    }
    if (this.randomSequence?.length !== this.options?.cards.value) {
      this.randomSequence = this.generateRandomSequenceLocally(
        this.options?.cards.value
      );
    }
    gameState.playerStates?.forEach((ps) => {
      ps.minusCards = [];
      ps.minusPoints = 0;
      ps.hand = this.randomSequence.splice(0, this.options?.rounds.value);
    });
    gameState.boardRows = [];
    for (let i = 0; i < this.options?.rows.value; i++) {
      gameState.boardRows.push(this.randomSequence.splice(0, 1));
    }
    return gameState;
  }

  getHandCards(): number[] {
    if (!(this.gameState && this.player)) {
      return [];
    }
    return this.gameState.playerStates.find((s) => {
      return s.player.name === this.player.name;
    }).hand;
  }

  getSelectedCard(): number {
    if (!(this.gameState && this.player)) {
      return NO_CARD_SELECTED;
    }
    return this.gameState.playerStates.find((s) => {
      return s.player.name === this.player.name;
    }).selectedCard;
  }

  getRowCards(rowIndex: number): number[] {
    if (!this.gameState) {
      return [];
    }
    return this.gameState.boardRows[rowIndex];
  }

  pushGameStateToDB() {
    return this.db
      .object(
        GLOBAL_CONFIG.dbGamePath() +
          '/' +
          this.gameKey +
          '/' +
          GLOBAL_CONFIG.dbGameStatePath
      )
      .update(this.gameState);
  }

  pushPlayerStateToDB() {
    return this.db
      .object(
        GLOBAL_CONFIG.dbGamePath() +
          '/' +
          this.gameKey +
          '/' +
          GLOBAL_CONFIG.dbGameStatePath +
          '/' +
          GLOBAL_CONFIG.dbPlayerStatesPath +
          '/' +
          this.playerIndex
      )
      .update(this.gameState.playerStates[this.playerIndex]);
  }

  selectCard(card: number) {
    this.selectedCardLocally = card;
    this.gameState.playerStates[this.playerIndex].hand.splice(
      this.gameState.playerStates[this.playerIndex].hand.indexOf(card),
      1
    );
    this.gameState.playerStates[this.playerIndex].selectedCard = card;
    return this.pushPlayerStateToDB();
  }

  putCardInRow(rowIndex: number) {
    this.gameState.boardRows[rowIndex].push(this.getSmallestSelectedCard());
    this.gameState.playerStates[
      this.playerIndex
    ].selectedCard = NO_CARD_SELECTED;
    this.pushGameStateToDB();
  }

  calculateMinusPoints(card: number): number {
    if (card === 55) {
      return 7;
    } else if (card === -1) {
      return -1;
    } else if (card % 11 === 0) {
      return 5;
    } else if (card % 10 === 0) {
      return 3;
    } else if (card % 5 === 0) {
      return 2;
    } else {
      return 1;
    }
  }

  getMinusPoints() {
    return this.gameState?.playerStates[this.playerIndex].minusPoints;
  }

  takeRow(rowIndex: number) {
    this.gameState.playerStates[
      this.playerIndex
    ].minusPoints += this.gameState.boardRows[rowIndex].reduce(
      (pv, cv) => pv + this.calculateMinusPoints(cv),
      0
    );
    if (!this.gameState.playerStates[this.playerIndex].minusCards) {
      this.gameState.playerStates[this.playerIndex].minusCards = [];
    }
    this.gameState.playerStates[this.playerIndex].minusCards.push(
      ...this.gameState.boardRows[rowIndex]
    );
    this.gameState.boardRows[rowIndex] = [
      this.gameState.playerStates[this.playerIndex].selectedCard,
    ];
    this.gameState.playerStates[
      this.playerIndex
    ].selectedCard = NO_CARD_SELECTED;
    this.pushGameStateToDB();
  }

  isChoosingCards(): boolean {
    return this.gameState?.choosingCards;
  }

  anyCardSelected(): boolean {
    return !!this.gameState?.playerStates.find(
      (ps) => ps.selectedCard !== NO_CARD_SELECTED
    );
  }

  allCardSelected(): boolean {
    return !this.gameState?.playerStates.find(
      (ps) => ps.selectedCard === NO_CARD_SELECTED
    );
  }

  isFinished(): boolean {
    return this.gameState?.finished;
  }

  isYourTurn(): boolean {
    return (
      this.gameState?.playerStates[this.playerIndex]?.selectedCard ===
        this.getSmallestSelectedCard() && !this.gameState?.choosingCards
    );
  }

  getTurnPlayerName(): string {
    const smallestCard = this.getSmallestSelectedCard();
    return this.gameState?.playerStates.find((ps) => {
      return ps.selectedCard === smallestCard;
    })?.player.name;
  }

  canSelect(): boolean {
    return (
      this.gameState?.playerStates[this.playerIndex].selectedCard ===
        NO_CARD_SELECTED && this.gameState.choosingCards === true
    );
  }

  getSmallestSelectedCard(): number {
    const selectedCards = this.gameState?.playerStates
      .map((ps) => ps.selectedCard)
      .filter((c) => c !== NO_CARD_SELECTED);
    return selectedCards?.length > 0 ? Math.min(...selectedCards) : -1;
  }

  getHightlightedRowIndex() {
    const smallestCard = this.getSmallestSelectedCard();
    let index = NO_HIGHLIGHTED_ROW;
    if (smallestCard === -1) {
      return index;
    }
    this.gameState?.boardRows.forEach((row, i) => {
      if (index === NO_HIGHLIGHTED_ROW) {
        if (row[row.length - 1] < smallestCard) {
          index = i;
        }
      } else {
        if (row[row.length - 1] < smallestCard) {
          if (
            smallestCard -
              this.gameState.boardRows[index][
                this.gameState.boardRows[index].length - 1
              ] >
            smallestCard - row[row.length - 1]
          ) {
            index = i;
          }
        }
      }
    });
    return index;
  }

  canDropCard(): boolean {
    return this.getHightlightedRowIndex() !== NO_HIGHLIGHTED_ROW;
  }

  getGameSnapshotChanges(): Observable<SnapshotAction<unknown>[]> {
    return this.db
      .list(GLOBAL_CONFIG.dbGamePath())
      .snapshotChanges()
      .pipe(take(1));
  }

  getGamesObservable(): Observable<unknown[]> {
    return this.db
      .list(GLOBAL_CONFIG.dbGamePath())
      .valueChanges()
      .pipe(take(1));
  }

  getMinusCards(): number[] {
    return this.gameState?.playerStates[this.playerIndex].minusCards;
  }

  generateRandomSequence(cardCount: number) {
    this.httpService.getRandomSequence(1, cardCount).subscribe((sequence) => {
      this.randomSequence = sequence;
    });
  }

  generateRandomSequenceLocally(cardCount: number): number[] {
    const sequence = Array.from(Array(cardCount + 1).keys()).slice(1);
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = sequence[i];
      sequence[i] = sequence[j];
      sequence[j] = temp;
    }
    return sequence;
  }

  increasePlayedRounds() {
    this.db
      .object(GLOBAL_CONFIG.dbGamePath() + '/' + this.gameKey)
      .valueChanges()
      .pipe(take(1))
      .subscribe((game: Game) => {
        this.db.object(GLOBAL_CONFIG.dbGamePath() + '/' + this.gameKey).update({
          playedRounds: game.playedRounds + 1,
        });
      });
  }
}
