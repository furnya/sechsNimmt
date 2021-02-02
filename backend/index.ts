import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import firebase from 'firebase';
const fbApp = firebase.initializeApp({
  apiKey: 'AIzaSyARqnZKlZDaCzq6FPfbCclP-apHswTl4hI',
  authDomain: 'sechsnimmt-33e6e.firebaseapp.com',
  databaseURL: 'https://sechsnimmt-33e6e.firebaseio.com',
  projectId: 'sechsnimmt-33e6e',
  storageBucket: 'sechsnimmt-33e6e.appspot.com',
  messagingSenderId: '1014597375385',
  appId: '1:1014597375385:web:2947288eef5c8c694c2f08',
  measurementId: 'G-T7LG2CN370',
});


interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

interface DbUpdate {
  path: string;
  data: any;
}


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

fbApp.database().ref('DEV2').on('value', (v) => {
  wss.clients.forEach(client => {
    client.send(JSON.stringify(v.val()));
  })
});

wss.on('connection', (ws: ExtWebSocket) => {

  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message: string) => {
    console.log('received: %s', message);
    let messageObj = null;
    try {
      messageObj = JSON.parse(message) as DbUpdate;
    } catch (error) {
      console.error('Message is not object');
    }
    console.log(messageObj);

    if (messageObj && messageObj instanceof Object && 'path' in messageObj) {
      fbApp.database().ref(messageObj.path).update(messageObj.data).then(() => {
        ws.send('changed!');
      })
    } else {
      ws.send(`Hello, you sent -> ${message}`);
    }
  });

  ws.send('Hi there, I am a WebSocket server');
});

setInterval(() => {
  wss.clients.forEach((ws: ExtWebSocket) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping(null, false);
  });
}, 10000);

server.listen(process.env.PORT || 8080, () => {
  console.log(
    `Server started on port ${
      (server.address() as WebSocket.AddressInfo).port
    } :)`
  );
});

module.exports = server;
