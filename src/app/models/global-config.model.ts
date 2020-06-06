import { GameOptions } from './game.model';

export interface DbEnvironment {
    dbBase: string;
}

export interface GlobalConfig {
    baseUrl: string;
    dbQueuePath: () => string;
    dbPlayerPath: string;
    dbGamePath: () => string;
    dbGameStatePath: string;
    suffix: string;
    dbPlayerStatesPath: string;
    dbHandPath: string;
    dbMinusPointsPath: string;
    dbSelectedCardPath: string;
    urlWelcomePath: string;
    urlGamePath: string;
    urlJoinPath: string;
    maxCardsInRow: number;
    urlNotFoundPath: string;
    maxLobbyAgeInMilliseconds: number;
    maxGameAgeInMilliseconds: number;
    defaultOptions: GameOptions;
    dbOptionsPath: string;
    activeTimeoutInMilliseconds: number;
    globalMaxPlayers: number;
}
