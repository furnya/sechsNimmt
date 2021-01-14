import { Injectable } from '@angular/core';
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, take, takeWhile, tap } from 'rxjs/operators';
import { GLOBAL_CONFIG } from '../config/global-config';
import { Game, GameOptions, GameState, Player, PlayerState } from '../models/game.model';
import { playerIsActive } from '../welcome/filter-is-active.pipe';

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
  playerIndex = -1;
  options: GameOptions;

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

  constructor(private db: AngularFireDatabase, private router: Router) {}

  subscribeToGameStateChanges() {
    this.player = JSON.parse(localStorage.getItem('player_' + this.gameId));
    this.gameStateSub = this.db
      .object(
        GLOBAL_CONFIG.dbGamePath() + '/' + this.gameKey
      )
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
          this.gameState.choosingCards = false;
          this.gameState.playerStates.forEach(ps => {
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
    if (this.playerIndex === -1) {
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
          };
          this.db.list(GLOBAL_CONFIG.dbGamePath()).push(game);
        });
    }
  }

  createNewGameState(players: Player[]): GameState {
    const playerStates: PlayerState[] = [];
    players.forEach(player => {
      playerStates.push({
        hand: [],
        minusPoints: 0,
        totalMinusPoints: 0,
        selectedCard: 0,
        player,
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
    const cards = Array.from(Array(this.options?.cards.value + 1).keys()).slice(
      1
    );
    const playerStates: PlayerState[] = [];
    gameState.playerStates?.forEach(ps => {
      ps.hand = [];
      ps.minusPoints = 0;
      for (let j = 0; j < this.options?.rounds.value; j++) {
        const index = Math.floor(Math.random() * cards.length);
        ps.hand.push(cards[index]);
        cards.splice(index, 1);
      }
    });
    gameState.boardRows = [];
    for (let i = 0; i < this.options?.rows.value; i++) {
      gameState.boardRows.push([]);
      const index = Math.floor(Math.random() * cards.length);
      gameState.boardRows[i].push(cards[index]);
      cards.splice(index, 1);
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
      return 0;
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
    this.gameState.playerStates[this.playerIndex].hand.splice(
      this.gameState.playerStates[this.playerIndex].hand.indexOf(card),
      1
    );
    this.gameState.playerStates[this.playerIndex].selectedCard = card;
    return this.pushPlayerStateToDB();
  }

  putCardInRow(rowIndex: number) {
    this.gameState.boardRows[rowIndex].push(this.getSmallestSelectedCard());
    this.gameState.playerStates[this.playerIndex].selectedCard = 0;
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
    this.gameState.boardRows[rowIndex] = [
      this.gameState.playerStates[this.playerIndex].selectedCard,
    ];
    this.gameState.playerStates[this.playerIndex].selectedCard = 0;
    this.pushGameStateToDB();
  }

  isChoosingCards(): boolean {
    return this.gameState?.choosingCards;
  }

  anyCardSelected(): boolean {
    return !!this.gameState?.playerStates.find(ps => ps.selectedCard !== 0);
  }

  allCardSelected(): boolean {
    return !this.gameState?.playerStates.find(ps => ps.selectedCard === 0);
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
    return this.gameState?.playerStates.find(ps => {
      return ps.selectedCard === smallestCard;
    })?.player.name;
  }

  canSelect(): boolean {
    return (
      this.gameState?.playerStates[this.playerIndex].selectedCard === 0 &&
      this.gameState.choosingCards === true
    );
  }

  getSmallestSelectedCard(): number {
    let card = 105;
    this.gameState?.playerStates.forEach((ps) => {
      if (ps.selectedCard !== 0 && ps.selectedCard < card) {
        card = ps.selectedCard;
      }
    });
    return card;
  }

  getHightlightedRowIndex() {
    const smallestCard = this.getSmallestSelectedCard();
    let index = -1;
    if (smallestCard === 105) {
      return index;
    }
    this.gameState?.boardRows.forEach((row, i) => {
      if (index === -1) {
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

  getGamesObservable(): Observable<SnapshotAction<unknown>[]> {
    return this.db
      .list(GLOBAL_CONFIG.dbGamePath())
      .snapshotChanges()
      .pipe(take(1));
  }
}
