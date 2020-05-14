import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { GLOBAL_CONFIG } from '../config/global-config';
import { GameService } from '../game/game.service';
import { Game, JoinedGame, Player } from '../models/game';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GameCreationService {
  queuedGames: Game[] = [];
  queuedGamesChanged: Subject<string[]> = new Subject<string[]>();
  joinedGame: JoinedGame = null;
  joinedGameChanged: Subject<JoinedGame> = new Subject<JoinedGame>();

  constructor(
    private db: AngularFireDatabase,
    private gameService: GameService,
    private router: Router
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
        this.gameService.setPlayerLocalStorage(this.joinedGame.player, this.joinedGame.game.id);
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
    return this.db.object(GLOBAL_CONFIG.dbQueuePath).valueChanges();
  }

  createGame(gameId: string, hostPlayerName: string) {
    this.db.list(GLOBAL_CONFIG.dbQueuePath).push({
      id: gameId,
      players: [],
      started: false,
    });
    this.db
      .list(GLOBAL_CONFIG.dbQueuePath)
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
            .list(GLOBAL_CONFIG.dbQueuePath + '/' + changeKey + '/' + GLOBAL_CONFIG.dbPlayerPath)
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
              this.gameService.setPlayerLocalStorage(this.joinedGame.player, this.joinedGame.game.id);
              this.router.navigate(['/' + GLOBAL_CONFIG.urlJoinPath, gameId]);
            });
        })
      )
      .subscribe();
  }

  joinGameIfAlreadyIn(gameId: string, playerName: string) {
    this.joinedGame = {
      game: {
        id: gameId,
        dbKey: null,
        players: [],
        started: false
      },
      player: {
        name: playerName,
        dbKey: null,
        isHost: false
      }
    };
  }

  joinGameFromForm(gameId: string, playerName: string, navigate: boolean): string {
    const gameKey = this.getGameKey(gameId);
    if (!gameKey) {
      return 'Ein Spiel mit dieser ID existiert nicht!';
    }
    this.db
      .list(GLOBAL_CONFIG.dbQueuePath + '/' + gameKey + '/' + GLOBAL_CONFIG.dbPlayerPath)
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
        this.gameService.setPlayerLocalStorage(this.joinedGame.player, this.joinedGame.game.id);
        if (navigate) {
          this.router.navigate(['/' + GLOBAL_CONFIG.urlJoinPath, gameId]);
        }
      });
    return null;
  }

  leaveGame() {
    this.gameService.deletePlayerLocalStorage(this.joinedGame?.game.id);
    this.gameService.gameState = null;
    this.joinedGame = null;
    this.joinedGameChanged.next(null);
  }

  startGame() {
    if (!this.joinedGame) {
      return;
    }
    this.db
      .object(GLOBAL_CONFIG.dbQueuePath + '/' + this.joinedGame.game.dbKey)
      .update({ started: true });
  }
}
