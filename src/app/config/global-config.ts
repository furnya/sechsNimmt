import { GlobalConfig } from '../models/global-config.model';

export const ENVIRONMENT = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyARqnZKlZDaCzq6FPfbCclP-apHswTl4hI',
    // authDomain: '<your-project-authdomain>',
    databaseURL: 'https://sechsnimmt-33e6e.firebaseio.com/',
    projectId: 'sechsnimmt-33e6e',
    // storageBucket: '<your-storage-bucket>',
    // messagingSenderId: '<your-messaging-sender-id>',
  },
};

export const GLOBAL_CONFIG: GlobalConfig = {
  baseUrl: 'https://sechsnimmt-33e6e.firebaseio.com/',
  gamePath: '/games',
  suffix: '.json',
};
