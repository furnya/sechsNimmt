import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL_CONFIG } from '../config/global-config';
import { Observable, Subject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, take, tap } from 'rxjs/operators';
import { Game, Player, JoinedGame } from '../models/game';
import { GameService } from '../game/game.service';

@Injectable({
  providedIn: 'root',
})
export class GameCreationService {
  queuedGames: Game[] = [];
  queuedGamesChanged: Subject<string[]> = new Subject<string[]>();
  joinedGame: JoinedGame = null;
  joinedGameChanged: Subject<JoinedGame> = new Subject<JoinedGame>();

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private gameService: GameService
  ) {
    this.getQueueObservable().subscribe((games) => {
      this.queuedGames = [];
      if (!games) {
        this.queuedGamesChanged.next([]);
        return;
      }
      Object.keys(games).forEach((key) => {
        const players: Player[] = [];
        if (games[key].players) {
          Object.keys(games[key].players).forEach((playerKey) => {
            players.push({
              name: games[key].players[playerKey].name,
              isHost: games[key].players[playerKey].isHost,
              dbKey: playerKey,
            });
          });
        }
        this.queuedGames.push({
          dbKey: key,
          id: games[key].id,
          started: games[key].started,
          players,
        });
      });
      this.queuedGamesChanged.next(this.getGameIds(this.queuedGames));
      if (this.joinedGame) {
        const game = this.getGame(this.joinedGame.game.id);
        this.joinedGame = {
          game,
          player: this.getPlayerFromGame(this.joinedGame.player.name, game),
        };
        this.joinedGameChanged.next(this.joinedGame);
        this.gameService.player = this.joinedGame.player;
      }
    });
  }

  private getGameIds(games: Game[]) {
    const gameIds: string[] = [];
    games.forEach((game: Game) => {
      gameIds.push(game.id);
    });
    return gameIds;
  }

  private getGame(gameId: string) {
    let game: Game = null;
    this.queuedGames.forEach((g) => {
      if (g.id === gameId) {
        game = g;
      }
    });
    return game;
  }

  getPlayerFromGame(playerName: string, game: Game) {
    let player: Player = null;
    if (!game) {
      return player;
    }
    game.players.forEach((p) => {
      if (p.name === playerName) {
        player = p;
      }
    });
    return player;
  }

  getPlayer(playerName: string) {
    return this.getPlayerFromGame(playerName, this.joinedGame?.game);
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

  private getGameKey(gameId: string): string {
    let gameKey: string;
    this.queuedGames.forEach((game) => {
      if (game.id === gameId) {
        gameKey = game.dbKey;
      }
    });
    return gameKey;
  }

  getQueueObservable(): Observable<any> {
    return this.db.object(GLOBAL_CONFIG.queuePath).valueChanges();
  }

  createGame(gameId: string, hostPlayerName: string) {
    this.db.list(GLOBAL_CONFIG.queuePath).push({
      id: gameId,
      players: [],
      started: false,
    });
    this.db
      .list(GLOBAL_CONFIG.queuePath)
      .snapshotChanges()
      .pipe(
        take(1),
        map((changes) => {
          let key: string = null;
          changes.forEach((change) => {
            const value: {
              id?: string;
            } = change.payload.val();
            if (value && value.id && value.id === gameId) {
              key = change.payload.key;
            }
          });
          return key;
        }),
        tap((changeKey) => {
          if (!changeKey) {
            return;
          }
          this.db
            .list(GLOBAL_CONFIG.queuePath + '/' + changeKey + '/players')
            .push({
              name: hostPlayerName,
              isHost: true,
            })
            .then(() => {
              const game = this.getGame(gameId);
              this.joinedGame = {
                game,
                player: this.getPlayerFromGame(hostPlayerName, game),
              };
              this.joinedGameChanged.next(this.joinedGame);
              this.gameService.player = this.joinedGame.player;
            });
        })
      )
      .subscribe();
  }

  joinGame(gameId: string, playerName: string): string {
    const gameKey = this.getGameKey(gameId);
    if (!gameKey) {
      return 'Ein Spiel mit dieser ID existiert nicht!';
    }
    this.db
      .list(GLOBAL_CONFIG.queuePath + '/' + gameKey + '/players')
      .push({
        name: playerName,
        isHost: false,
      })
      .then(() => {
        const game = this.getGame(gameId);
        this.joinedGame = {
          game,
          player: this.getPlayerFromGame(playerName, game),
        };
        this.joinedGameChanged.next(this.joinedGame);
        this.gameService.player = this.joinedGame.player;
      });
    return null;
  }

  leaveGame() {
    this.joinedGame = null;
    this.joinedGameChanged.next(null);
    this.gameService.player = null;
  }

  startGame() {
    if (!this.joinedGame) {
      return;
    }
    this.db
      .object(GLOBAL_CONFIG.queuePath + '/' + this.joinedGame.game.dbKey)
      .update({ started: true });
  }
}
