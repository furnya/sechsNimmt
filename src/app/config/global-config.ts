import { GlobalConfig } from '../models/global-config.model';

export const ENVIRONMENT = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyARqnZKlZDaCzq6FPfbCclP-apHswTl4hI',
    authDomain: 'sechsnimmt-33e6e.firebaseapp.com',
    databaseURL: 'https://sechsnimmt-33e6e.firebaseio.com',
    projectId: 'sechsnimmt-33e6e',
    storageBucket: 'sechsnimmt-33e6e.appspot.com',
    messagingSenderId: '1014597375385',
    appId: '1:1014597375385:web:2947288eef5c8c694c2f08',
    measurementId: 'G-T7LG2CN370',
  },
};

export const GLOBAL_CONFIG: GlobalConfig = {
  baseUrl: 'https://sechsnimmt-33e6e.firebaseio.com/',
  dbQueuePath: 'queue',
  dbGamePath: 'games',
  dbPlayerPath: 'players',
  suffix: '.json',
  cardAmount: 104,
  dbGameStatePath: 'gameState',
  dbPlayerStatesPath: 'playerStates',
  dbHandPath: 'hand',
  dbMinusPointsPath: 'minusPoints',
  dbSelectedCardPath: 'selectedCard',
  urlGamePath: 'game',
  urlWelcomePath: 'welcome',
  urlJoinPath: 'join',
  rounds: 1,
  rows: 5
};
