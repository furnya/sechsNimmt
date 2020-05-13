import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL_CONFIG } from '../config/global-config';
import { Observable, Subject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, take, tap } from 'rxjs/operators';
import { QueuedGame, Player } from '../models/queuedGame.model';

@Injectable({
  providedIn: 'root',
})
export class GameCreationService {

  queuedGames: QueuedGame[] = [];
  queuedGamesChanged: Subject<QueuedGame[]> = new Subject<QueuedGame[]>();


  constructor(private http: HttpClient, private db: AngularFireDatabase) {
    this.getGamesObservable().subscribe(games => {
      this.queuedGames = [];
      if (!games) {
        this.queuedGamesChanged.next(this.queuedGames);
        return;
      }
      Object.keys(games).forEach(key => {
        const players: Player[] = [];
        if (games[key].players) {
          Object.keys(games[key].players).forEach(playerKey => {
            players.push({
              name: games[key].players[playerKey].name,
              isHost: games[key].players[playerKey].isHost,
              dbKey: playerKey
            });
          });
        }
        this.queuedGames.push({
          dbKey: key,
          id: games[key].id,
          players
        });
      });
      this.queuedGamesChanged.next(JSON.parse(JSON.stringify(this.queuedGames)));
    });
  }

  getGamesObservable(): Observable<any> {
    return this.db.object(GLOBAL_CONFIG.gamePath).valueChanges();
  }

  createGame(gameId: string, hostPlayerName: string): Observable<any> {
    this.db.list(GLOBAL_CONFIG.gamePath).push({
      id: gameId,
      players: [],
    });
    return this.db
      .list(GLOBAL_CONFIG.gamePath)
      .snapshotChanges()
      .pipe(
        take(1),
        map(changes => {
          let key: string;
          changes.forEach(change => {
            const value: {
              id?: string
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
          this.db.list(GLOBAL_CONFIG.gamePath + '/' + changeKey + '/players').push({
            name: hostPlayerName,
            isHost: true,
          });
        })
      );
  }

  joinGame(gameKey: string, playerName: string) {
    this.db.list(GLOBAL_CONFIG.gamePath + '/' + gameKey + '/players').push({
      name: playerName,
      isHost: false,
    });
  }
}
