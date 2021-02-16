import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { io } from 'socket.io-client';

enum DbAction {
  Update = 'UPDATE',
  Delete = 'DELETE',
  Set = 'SET',
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  wsIncoming: Observable<MessageEvent>;
  onOpen = new Subject();
  socket;

  connect(url): Observable<MessageEvent> {
    if (!this.wsIncoming) {
      this.wsIncoming = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.wsIncoming;
  }

  private create(url) {
    const socket = io(url);
    this.socket = socket;

    const observable = new Observable((obs: Observer<MessageEvent>) => {
      socket.on('message', obs.next.bind(obs));
      socket.on('error', (e) => {
        obs.error(e);
        obs.complete();
        socket.close();
        setTimeout(() => this.connect(url), 1000);
      });
      socket.on('close', () => {
        obs.complete();
        setTimeout(() => this.connect(url), 1000);
      });
      socket.on('open', () => {
        this.onOpen.next(true);
      });
      socket.on('ping', () => {
        socket.emit('pong');
      });
      return socket.close.bind(socket);
    });
    return observable;
  }

  updateDBObject(path: string, data: any) {
    if (this.socket.connected) {
      this.socket.send(
        JSON.stringify({
          action: DbAction.Update,
          path,
          data,
        })
      );
    }
  }

  setDBObject(path: string, data: any) {
    if (this.socket.connected) {
      this.socket.send(
        JSON.stringify({
          action: DbAction.Set,
          path,
          data,
        })
      );
    }
  }

  deleteDBObject(path: string) {
    if (this.socket.connected) {
      this.socket.send(
        JSON.stringify({
          action: DbAction.Delete,
          path
        })
      );
    }
  }
}
