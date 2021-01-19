import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { GLOBAL_CONFIG } from '../config/global-config';
import { GameService } from '../game/game.service';
import {
  Game,
  GameOptions,
  JoinedRoom,
  Player,
  Room,
} from '../models/game.model';
import { filterActivePlayers } from './filter-is-active.pipe';

@Injectable({
  providedIn: 'root',
})
export class RoomCreationService {
  queuedRooms: Room[] = [];
  queuedRoomIds: string[] = [];
  queuedRoomsChanged: Subject<string[]> = new Subject<string[]>();
  joinedRoom: JoinedRoom = null;
  joinedRoomChanged: Subject<JoinedRoom> = new Subject<JoinedRoom>();

  constructor(
    private db: AngularFireDatabase,
    private gameService: GameService,
    private router: Router
  ) {
    this.getQueueObservable().subscribe((rooms) => {
      this.queuedRooms = [];
      if (!rooms) {
        this.queuedRoomsChanged.next([]);
        return;
      }
      Object.keys(rooms).forEach((key) => {
        const players: Player[] = [];
        if (rooms[key].players) {
          Object.keys(rooms[key].players).forEach((playerKey) => {
            players.push({
              name: rooms[key].players[playerKey].name,
              isHost: rooms[key].players[playerKey].isHost,
              dbKey: playerKey,
              isActive: rooms[key].players[playerKey].isActive,
            });
          });
        }
        this.queuedRooms.push({
          dbKey: key,
          id: rooms[key].id,
          started: rooms[key].started,
          players,
          created: rooms[key].created,
          options: rooms[key].options,
        });
      });
      this.queuedRoomIds = this.filterRooms(this.queuedRooms);
      this.queuedRoomsChanged.next(this.queuedRoomIds);
      if (this.joinedRoom) {
        const room = this.getRoom(this.joinedRoom.room.id);
        this.joinedRoom = {
          room,
          player: this.getPlayerFromRoom(this.joinedRoom.player.name, room),
        };
        this.joinedRoomChanged.next(this.joinedRoom);
        this.gameService.setPlayerLocalStorage(
          this.joinedRoom.player,
          this.joinedRoom.room.id
        );
      }
    });
  }

  private filterRooms(rooms: Room[]): string[] {
    const roomIds: string[] = [];
    rooms.forEach((room: Room) => {
      if (
        !room.started &&
        new Date().getTime() - room.created <
          GLOBAL_CONFIG.maxLobbyAgeInMilliseconds
      ) {
        roomIds.push(room.id);
      }
    });
    return roomIds;
  }

  getRoom(roomId: string): Room {
    let room: Room = null;
    this.queuedRooms.forEach((g) => {
      if (g.id === roomId) {
        room = g;
      }
    });
    return room;
  }

  getPlayerFromRoom(playerName: string, room: Room) {
    let player: Player = null;
    if (!room) {
      return player;
    }
    room.players.forEach((p) => {
      if (p.name === playerName) {
        player = p;
      }
    });
    return player;
  }

  getPlayer(playerName: string) {
    return this.getPlayerFromRoom(playerName, this.joinedRoom?.room);
  }

  private getRoomPlayers(roomId: string): Player[] {
    return this.queuedRooms.find((r) => r.id === roomId)?.players;
  }

  private getRoomKey(roomId: string): string {
    let roomKey: string;
    this.queuedRooms.forEach((room) => {
      if (room.id === roomId) {
        roomKey = room.dbKey;
      }
    });
    return roomKey;
  }

  getQueueObservable(): Observable<any> {
    return this.db.object(GLOBAL_CONFIG.dbQueuePath()).valueChanges();
  }

  createRoom(roomId: string, hostPlayerName: string): Observable<string> {
    if (this.queuedRoomIds.includes(roomId)) {
      return new Observable((observer) => {
        setTimeout(() => {
          observer.next('Ein Spiel mit dieser ID existiert schon!');
        }, 1);
      });
    }
    const oldRoom = this.queuedRooms.find((r) => r.id === roomId);
    return this.gameService.getGameSnapshotChanges().pipe(
      map((changes) => {
        let exists = false;
        changes.forEach((change) => {
          const value: {
            id?: string;
            created?: number;
          } = change.payload.val();
          if (value && value.id && value.id === roomId) {
            if (
              value.created &&
              new Date().getTime() - value.created <
                GLOBAL_CONFIG.maxGameAgeInMilliseconds
            ) {
              exists = true;
            } else {
              this.db
                .object(GLOBAL_CONFIG.dbGamePath() + '/' + change.payload.key)
                .remove();
            }
          }
        });
        if (exists) {
          return 'Ein Spiel mit dieser ID existiert schon!';
        }
        if (oldRoom) {
          this.db
            .object(GLOBAL_CONFIG.dbQueuePath() + '/' + oldRoom.dbKey)
            .remove()
            .then(() => {
              this.pushNewRoom(roomId, hostPlayerName);
            });
        } else {
          this.pushNewRoom(roomId, hostPlayerName);
        }
        return null;
      })
    );
  }

  private pushNewRoom(roomId: string, hostPlayerName: string) {
    const newRoom: Room = {
      id: roomId,
      players: [],
      started: false,
      created: new Date().getTime(),
      dbKey: null,
      options: JSON.parse(JSON.stringify(GLOBAL_CONFIG.defaultOptions)),
    };
    this.db.list(GLOBAL_CONFIG.dbQueuePath()).push(newRoom);
    this.db
      .list(GLOBAL_CONFIG.dbQueuePath())
      .snapshotChanges()
      .pipe(
        take(1),
        map((changes) => {
          let key: string = null;
          changes.forEach((change) => {
            const value: {
              id?: string;
            } = change.payload.val();
            if (value && value.id && value.id === roomId) {
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
            .list(
              GLOBAL_CONFIG.dbQueuePath() +
                '/' +
                changeKey +
                '/' +
                GLOBAL_CONFIG.dbPlayerPath
            )
            .push({
              name: hostPlayerName,
              isHost: true,
              isActive: new Date().getTime(),
            })
            .then(() => {
              const room = this.getRoom(roomId);
              this.joinedRoom = {
                room,
                player: this.getPlayerFromRoom(hostPlayerName, room),
              };
              this.joinedRoomChanged.next(this.joinedRoom);
              this.gameService.setPlayerLocalStorage(
                this.joinedRoom.player,
                this.joinedRoom.room.id
              );
              this.router.navigate(['/' + GLOBAL_CONFIG.urlJoinPath, roomId]);
            });
        })
      )
      .subscribe();
  }

  joinRoomIfAlreadyIn(roomId: string, playerName: string) {
    this.joinedRoom = {
      room: this.getRoom(roomId),
      player: this.getPlayerFromRoom(playerName, this.getRoom(roomId)),
    };
  }

  joinRoomFromForm(
    roomId: string,
    playerName: string,
    navigate: boolean
  ): string {
    const roomKey = this.getRoomKey(roomId);
    if (!roomKey) {
      return 'Ein Spiel mit dieser ID existiert nicht!';
    }
    if (this.getRoomPlayers(roomId)?.find((p) => p.name === playerName)) {
      return 'Ein Spieler mit diesem Namen existiert schon!';
    }
    const players = filterActivePlayers(this.getRoomPlayers(roomId));
    const playerCount = players ? players.length : 0;
    if (playerCount >= this.getRoom(roomId)?.options.maxPlayers.value) {
      return 'Dieses Spiel ist bereits voll!';
    }
    this.db
      .list(
        GLOBAL_CONFIG.dbQueuePath() +
          '/' +
          roomKey +
          '/' +
          GLOBAL_CONFIG.dbPlayerPath
      )
      .push({
        name: playerName,
        isHost: false,
        isActive: new Date().getTime(),
      })
      .then(() => {
        const room = this.getRoom(roomId);
        this.joinedRoom = {
          room,
          player: this.getPlayerFromRoom(playerName, room),
        };
        this.joinedRoomChanged.next(this.joinedRoom);
        this.gameService.setPlayerLocalStorage(
          this.joinedRoom.player,
          this.joinedRoom.room.id
        );
        if (navigate) {
          this.router.navigate(['/' + GLOBAL_CONFIG.urlJoinPath, roomId]);
        }
      });
    return null;
  }

  clearRoom() {
    this.gameService.unsubscribeFromGameChanges();
    this.gameService.gameState = null;
    this.joinedRoom = null;
    this.joinedRoomChanged.next(null);
  }

  leaveRoom() {
    this.gameService.deletePlayerLocalStorage(this.joinedRoom?.room.id);
    this.clearRoom();
  }

  startGame() {
    if (!this.joinedRoom) {
      return;
    }
    this.db
      .object(GLOBAL_CONFIG.dbQueuePath() + '/' + this.joinedRoom.room.dbKey)
      .update({ started: true });
    this.gameService.pushNewGameState(
      this.joinedRoom.room.id,
      this.joinedRoom.room.options
    );
  }

  changeOptions(options: GameOptions) {
    if (this.joinedRoom) {
      this.joinedRoom.room.options = JSON.parse(JSON.stringify(options));
      this.db
        .object(
          GLOBAL_CONFIG.dbQueuePath() +
            '/' +
            this.joinedRoom.room.dbKey +
            '/' +
            GLOBAL_CONFIG.dbOptionsPath
        )
        .update(this.joinedRoom.room.options);
    }
  }

  roomExists(
    gameId: string
  ): Observable<{
    exists: boolean;
    started: boolean;
  }> {
    return this.getQueueObservable().pipe(
      take(1),
      map((rooms) => {
        const roomKey = Object.keys(rooms).find((key) => {
          return rooms[key].id === gameId;
        });
        return {
          exists: !!roomKey,
          started: roomKey ? rooms[roomKey].started : false,
        };
      })
    );
  }

  keepPlayerActive() {
    if (
      this.joinedRoom &&
      this.joinedRoom.room.dbKey &&
      this.joinedRoom.player.dbKey
    ) {
      this.db
        .object(
          GLOBAL_CONFIG.dbQueuePath() +
            '/' +
            this.joinedRoom.room.dbKey +
            '/' +
            GLOBAL_CONFIG.dbPlayerPath +
            '/' +
            this.joinedRoom.player.dbKey
        )
        .update({
          isActive: new Date().getTime(),
        });
    }
  }

  clearLocalStorage() {
    this.gameService.clearLocalStorage();
  }

  generateRandomSequence(cardCount: number) {
    this.gameService.generateRandomSequence(cardCount);
  }

  getGameHistory(): Observable<Game[]> {
    return this.gameService
      .getGamesObservable()
      .pipe(map((obj: unknown) => {
        return obj as Game[];
      }));
  }
}
