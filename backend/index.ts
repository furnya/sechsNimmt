// [START sechsnimmt_backend_app]

import * as express from 'express';
import * as http from 'http';
// import * as WebSocket from 'ws';
import firebase from 'firebase';
import * as socketio from 'socket.io';
import * as path from 'path';

const fbApp = firebase.initializeApp({
  authDomain: 'sechsnimmt-33e6e.firebaseapp.com',
  databaseURL: 'https://sechsnimmt-33e6e.firebaseio.com',
  projectId: 'sechsnimmt-33e6e',
  storageBucket: 'sechsnimmt-33e6e.appspot.com',
  messagingSenderId: '1014597375385',
  appId: '1:1014597375385:web:2947288eef5c8c694c2f08',
  measurementId: 'G-T7LG2CN370',
});

enum DbAction {
  Update = 'UPDATE',
  Delete = 'DELETE',
  Set = 'SET'
}

export interface DbRequest {
  action: DbAction;
  path: string;
  data?: any;
}


const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

const aliveMap = new Map<any, boolean>();

fbApp.database().ref('DEV2').on('value', (v) => {
  io.emit('message', JSON.stringify(v.val()));
});

io.on('connection', (socket) => {

  aliveMap.set(socket, true);

  socket.on('pong', () => {
    aliveMap.set(socket, true);
  });

  socket.on('message', (message: string) => {
    console.log('received: %s', message);
    let messageObj = null;
    try {
      messageObj = JSON.parse(message) as DbRequest;
    } catch (error) {
      console.error('Message is not object');
    }

    if (messageObj && messageObj instanceof Object && 'path' in messageObj) {
      switch(messageObj.action) {
        case DbAction.Update:
          fbApp.database().ref(messageObj.path).update(messageObj.data).then(() => {
            socket.send('updated!');
          });
          break;
        case DbAction.Delete:
          fbApp.database().ref(messageObj.path).remove().then(() => {
            socket.send('deleted!');
          });
          break;
        case DbAction.Set:
          fbApp.database().ref(messageObj.path).set(messageObj.data).then(() => {
            socket.send('set!');
          });
          break;
        default:
          socket.send('action not supported!');
      }
    } else {
      socket.send(`Hello, you sent -> ${message}`);
    }
  });

  socket.send('Hi there, I am a WebSocket server');
});

setInterval(() => {
  io.sockets.sockets.forEach((socket) => {
      if (!aliveMap.get(socket)) {
        socket.disconnect(true);
        return;
      }
      aliveMap.set(socket, false);
      socket.emit('ping');
  });
}, 10000);

app.get("/", (req: any, res: any) => {
  res.send("http works");
});

server.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server started on port ${process.env.PORT || 8080} :)`
  );
});

// [END sechsnimmt_backend_app]

module.exports = server;
