import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

enum DbAction {
  Update = 'UPDATE',
  Delete = 'DELETE',
  Set = 'SET'
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  wsIncoming: Observable<MessageEvent>;
  onOpen = new Subject();
  ws: WebSocket;

  constructor() {}

  connect(url): Observable<MessageEvent> {
    if (!this.wsIncoming) {
      this.wsIncoming = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.wsIncoming;
  }

  private create(url): Observable<MessageEvent> {
    const ws = new WebSocket(url);
    this.ws = ws;

    const observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = (e) => {
        obs.error(e);
        obs.complete();
        ws.close();
        setTimeout(() => this.connect(url), 1000);
      };
      ws.onclose = () => {
        obs.complete();
        setTimeout(() => this.connect(url), 1000);
      };
      ws.onopen = () => {
        this.onOpen.next(true);
      };
      return ws.close.bind(ws);
    });
    return observable;
  }

  updateDBObject(path: string, data: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: DbAction.Update,
          path,
          data,
        })
      );
    }
  }

  setDBObject(path: string, data: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: DbAction.Set,
          path,
          data,
        })
      );
    }
  }

  deleteDBObject(path: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: DbAction.Delete,
          path
        })
      );
    }
  }
}
