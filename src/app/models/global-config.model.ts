import { GameOptions } from './game.model';

export interface GlobalConfig {
    baseUrl: string;
    dbQueuePath: string;
    dbPlayerPath: string;
    dbGamePath: string;
    dbGameStatePath: string;
    suffix: string;
    cardAmount: number;
    dbPlayerStatesPath: string;
    dbHandPath: string;
    dbMinusPointsPath: string;
    dbSelectedCardPath: string;
    urlWelcomePath: string;
    urlGamePath: string;
    urlJoinPath: string;
    rounds: number;
    rows: number;
    maxCardsInRow: number;
    urlNotFoundPath: string;
    maxLobbyAgeInMilliseconds: number;
    maxGameAgeInMilliseconds: number;
    defaultOptions: GameOptions;
    dbOptionsPath: string;
    activeTimeoutInMilliseconds: number;
}
