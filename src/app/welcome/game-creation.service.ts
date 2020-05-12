import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL_CONFIG } from '../config/global-config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameCreationService {
  constructor(private http: HttpClient) {}

  createGame(gameId: string, hostPlayerName: string): Observable<any> {
    return this.http.put(
      GLOBAL_CONFIG.baseUrl +
        GLOBAL_CONFIG.gamePath +
        '/' +
        gameId +
        GLOBAL_CONFIG.suffix,
      {
        players: [
          {
            name: hostPlayerName,
            isHost: true,
          },
        ],
      }
    );
  }

  joinGame(gameId: string, playerName: string): Observable<any> {
    return this.http.put(
      GLOBAL_CONFIG.baseUrl +
        GLOBAL_CONFIG.gamePath +
        '/' +
        gameId +
        '/players' +
        GLOBAL_CONFIG.suffix,
      {
        name: playerName,
        isHost: false,
      }
    );
  }
}
