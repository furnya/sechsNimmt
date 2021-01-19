export interface Room {
  dbKey: string;
  id: string;
  players: Player[];
  started: boolean;
  created: number;
  options: GameOptions;
}

export interface JoinedRoom {
  room: Room;
  player: Player;
}

export interface GameOption<T> {
  value: T;
  text: string;
  possibleValues?: T[];
}

export interface GameOptions {
  hideMinusPoints: GameOption<boolean>;
  showMinusCards: GameOption<boolean>;
  rows: GameOption<number>;
  rounds: GameOption<number>;
  maxPlayers: GameOption<number>;
  cards: GameOption<number>;
  thinkingTimeoutDisabled: GameOption<boolean>;
  maxThinkingTime: GameOption<number>;
}

export interface Player {
    name: string;
    isHost: boolean;
    dbKey: string;
    isActive: number;
}

export interface Game {
  id: string;
  created: number;
  players: any;
  gameState: GameState;
  options: GameOptions;
  playedRounds: number;
}

export interface GameState {
  boardRows: number[][];
  playerStates: PlayerState[];
  choosingCards: boolean;
  round: number;
  finished: boolean;
}

export interface PlayerState {
  player: Player;
  hand: number[];
  selectedCard: number;
  minusPoints: number;
  totalMinusPoints: number;
  minusCards: number[];
}

export const enum CARD_TYPE {
  handCard = 'hand',
  rowCard = 'row',
  selectedCard = 'selected',
}
