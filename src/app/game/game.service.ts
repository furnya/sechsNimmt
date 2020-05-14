import { Injectable } from '@angular/core';
import { Player, GameState, PlayerState } from '../models/game';
import { AngularFireDatabase } from '@angular/fire/database';
import { GLOBAL_CONFIG } from '../config/global-config';
import { take, map } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { Router } from '@angular/router';

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
  playerIndex = -1;

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
    this.db
      .object(
        GLOBAL_CONFIG.dbGamePath +
          '/' +
          this.gameKey +
          '/' +
          GLOBAL_CONFIG.dbGameStatePath
      )
      .valueChanges()
      .subscribe((gameState: GameState) => {
        this.gameState = gameState;
        if (this.setPlayerIndex()) {
          this.gameStateChanged.next(this.gameState);
          this.checkDisableSelecting();
        }
      });
  }

  checkDisableSelecting() {
    if (this.player?.isHost && !this.gameState?.finished) {
      if (this.gameState?.choosingCards) {
        let t = false;
        this.gameState.playerStates.forEach((ps) => {
          if (ps.selectedCard === 0) {
            t = true;
          }
        });
        if (t) {
          return;
        }
        this.gameState.choosingCards = false;
        this.pushGameStateToDB();
      } else {
        let t = true;
        this.gameState.playerStates.forEach((ps) => {
          if (ps.selectedCard !== 0) {
            t = false;
          }
        });
        if (!t) {
          return;
        }
        this.gameState.choosingCards = true;
        this.gameState.round++;
        if (this.gameState.round === GLOBAL_CONFIG.rounds + 1) {
          this.gameState.finished = true;
          this.gameState.choosingCards = false;
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
      .list(GLOBAL_CONFIG.dbGamePath)
      .snapshotChanges()
      .pipe(
        map((changes) => {
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
        // console.log('Setting key to: ' + key);
        this.gameKey = key;
        if (this.gameKey) {
          this.gameKeySub.unsubscribe();
          this.subscribeToGameStateChanges();
        }
      });
  }

  startGame(gameId: string) {
    this.gameId = gameId;
    this.setGameKey();
    if (!this.gameState && this.player && this.player.isHost) {
      this.db
        .object(GLOBAL_CONFIG.dbQueuePath)
        .valueChanges()
        .pipe(take(1))
        .subscribe((games) => {
          if (!games) {
            // TODO: handle error
            return;
          }
          let players = null;
          Object.keys(games).forEach((key) => {
            if (games[key]?.id === gameId && games[key]?.players) {
              players = games[key]?.players;
            }
          });
          const playerArray: Player[] = [];
          Object.keys(players).forEach((key) => {
            playerArray.push(players[key]);
          });
          const gameState = this.distributeCards(playerArray);
          this.db.list(GLOBAL_CONFIG.dbGamePath).push({
            id: gameId,
            players,
            gameState,
          });
        });
    }
  }

  distributeCards(players: Player[]): GameState {
    const cards = Array.from(Array(GLOBAL_CONFIG.cardAmount + 1).keys()).slice(
      1
    );
    const playerStates: PlayerState[] = [];
    for (let i = 0; i < players.length; i++) {
      playerStates.push({
        hand: [],
        minusPoints: 0,
        selectedCard: 0,
        player: null,
      });
      for (let j = 0; j < GLOBAL_CONFIG.rounds; j++) {
        const index = Math.floor(Math.random() * cards.length);
        playerStates[i].hand.push(cards[index]);
        cards.splice(index, 1);
      }
      playerStates[i].player = players[i];
    }
    const boardRows: number[][] = [];
    for (let i = 0; i < GLOBAL_CONFIG.rows; i++) {
      boardRows.push([]);
      const index = Math.floor(Math.random() * cards.length);
      boardRows[i].push(cards[index]);
      cards.splice(index, 1);
    }
    return {
      boardRows,
      playerStates,
      choosingCards: true,
      round: 1,
      finished: false,
    };
  }

  getHandCards(): number[] {
    if (!(this.gameState && this.player)) {
      return [];
    }
    return this.gameState.playerStates.find((s) => {
      return s.player.name === this.player.name;
    }).hand;
  }

  getRowCards(rowIndex: number): number[] {
    if (!this.gameState) {
      return [];
    }
    return this.gameState.boardRows[rowIndex];
  }

  pushGameStateToDB() {
    this.db
      .object(
        GLOBAL_CONFIG.dbGamePath +
          '/' +
          this.gameKey +
          '/' +
          GLOBAL_CONFIG.dbGameStatePath
      )
      .update(this.gameState);
  }

  selectCard(card: number) {
    this.gameState.playerStates[this.playerIndex].hand.splice(
      this.gameState.playerStates[this.playerIndex].hand.indexOf(card),
      1
    );
    this.gameState.playerStates[this.playerIndex].selectedCard = card;
    this.pushGameStateToDB();
  }

  putCardInRow(card: number, rowIndex: number) {
    this.gameState.playerStates[this.playerIndex].selectedCard = 0;
    this.gameState.boardRows[rowIndex].push(card);
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

  isFinished(): boolean {
    return this.gameState?.finished;
  }

  isYourTurn(): boolean {
    return (
      this.gameState?.playerStates[this.playerIndex]?.selectedCard ===
      this.getSmallestSelectedCard()
    );
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
}
