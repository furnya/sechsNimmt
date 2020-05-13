import { Injectable } from '@angular/core';
import { Player, GameState, PlayerState } from '../models/game';
import { AngularFireDatabase } from '@angular/fire/database';
import { GLOBAL_CONFIG } from '../config/global-config';
import { take, map } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';

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
    localStorage.setItem('player', JSON.stringify(player));
  }

  constructor(private db: AngularFireDatabase) {
  }

  subscribeToGameStateChanges() {
    this.player = JSON.parse(localStorage.getItem('player'));
    this.db
      .object(
        GLOBAL_CONFIG.gamePath +
          '/' +
          this.gameKey +
          '/' +
          GLOBAL_CONFIG.gameStatePath
      )
      .valueChanges()
      .subscribe((gameState: GameState) => {
        this.gameState = gameState;
        this.gameStateChanged.next(this.gameState);
        this.setPlayerIndex();
      });
  }

  setPlayerIndex() {
    this.playerIndex = this.gameState.playerStates.findIndex(ps => {
      return ps.player.name === this.player.name;
    });
  }

  setGameKey() {
    this.gameKeySub = this.db
      .list(GLOBAL_CONFIG.gamePath)
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
    if (this.player && this.player.isHost) {
      this.db
        .object(GLOBAL_CONFIG.queuePath)
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
          this.db.list(GLOBAL_CONFIG.gamePath).push({
            id: gameId,
            players,
            gameState: this.distributeCards(playerArray),
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
      for (let j = 0; j < 10; j++) {
        const index = Math.floor(Math.random() * cards.length);
        playerStates[i].hand.push(cards[index]);
        cards.splice(index, 1);
      }
      playerStates[i].player = players[i];
    }
    const boardRows: number[][] = [];
    for (let i = 0; i < 5; i++) {
      boardRows.push([]);
      const index = Math.floor(Math.random() * cards.length);
      boardRows[i].push(cards[index]);
      cards.splice(index, 1);
    }
    return {
      boardRows,
      playerStates,
    };
  }

  getHandCards(): number[] {
    if (!(this.gameState && this.player)) {
      return [];
    }
    return this.gameState.playerStates.find(s => {
      return s.player.name === this.player.name;
    }).hand;
  }

  getRowCards(rowIndex: number): number[] {
    if (!this.gameState) {
      return [];
    }
    return this.gameState.boardRows[rowIndex];
  }

  selectCard(card: number) {
    this.gameState.playerStates[this.playerIndex].hand.splice(this.gameState.playerStates[this.playerIndex].hand.indexOf(card), 1);
    this.gameState.playerStates[this.playerIndex].selectedCard = card;
    this.db.object(
      GLOBAL_CONFIG.gamePath +
        '/' +
        this.gameKey +
        '/' +
        GLOBAL_CONFIG.gameStatePath
    ).update(this.gameState);
  }
}
