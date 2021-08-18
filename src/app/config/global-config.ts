import { GlobalConfig, DbEnvironment } from '../models/global-config.model';

export const ENVIRONMENT = {
  production: false,
  firebase: {
    authDomain: 'sechsnimmt-33e6e.firebaseapp.com',
    databaseURL: 'https://sechsnimmt-33e6e.firebaseio.com',
    projectId: 'sechsnimmt-33e6e',
    storageBucket: 'sechsnimmt-33e6e.appspot.com',
    messagingSenderId: '1014597375385',
    appId: '1:1014597375385:web:2947288eef5c8c694c2f08',
    measurementId: 'G-T7LG2CN370',
  },
};

export let DB_ENVIRONMENT: DbEnvironment = {
  dbBase: 'PROD'
};

export const GLOBAL_CONFIG: GlobalConfig = {
  baseUrl: 'https://www.sechsnimmt.de',
  dbQueuePath(){return DB_ENVIRONMENT.dbBase + '/' + 'queue'; },
  dbGamePath(){return DB_ENVIRONMENT.dbBase + '/' + 'games'; },
  dbPlayerPath: 'players',
  suffix: '.json',
  dbGameStatePath: 'gameState',
  dbPlayerStatesPath: 'playerStates',
  dbHandPath: 'hand',
  dbMinusPointsPath: 'minusPoints',
  dbSelectedCardPath: 'selectedCard',
  urlGamePath: 'game',
  urlWelcomePath: 'welcome',
  urlJoinPath: 'join',
  maxCardsInRow: 5,
  urlNotFoundPath: 'not-found',
  dbOptionsPath: 'options',
  maxLobbyAgeInMilliseconds: 3600000,
  maxGameAgeInMilliseconds: 3600000 * 24,
  activeTimeoutInMilliseconds: 10000,
  activePingInterval: 1000,
  globalMaxPlayers: 10,
  defaultOptions: {
    hideMinusPoints: {
      value: false,
      text: 'Minuspunkte anderer Spieler ausblenden'
    },
    rounds: {
      value: 10,
      text: 'Anzahl Runden',
      possibleValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    rows: {
      value: 4,
      text: 'Anzahl Reihen',
      possibleValues: [1, 2, 3, 4, 5]
    },
    maxPlayers: {
      value: 10,
      text: 'Maximale Spieler'
    },
    cards: {
      value: 104,
      text: 'Anzahl Karten'
    },
    maxThinkingTime: {
      value: 60,
      text: 'Maximale Zeit zum Nachdenken',
      possibleValues: [10, 20, 30, 60, 90, 120, 180]
    },
    thinkingTimeoutDisabled: {
      value: true,
      text: 'Unendlich Zeit zum Nachdenken'
    },
    showMinusCards: {
      value: true,
      text: 'Genommene Karten anzeigen'
    }
  },
};
