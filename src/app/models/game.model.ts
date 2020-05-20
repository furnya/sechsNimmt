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
}
export interface GameOptions {
  hideMinusPoints: GameOption<boolean>;
}

export interface Player {
    name: string;
    isHost: boolean;
    dbKey: string;
    isActive: number;
}

export interface Game {
  id: string;
  players: any;
  gameState: GameState;
  options: GameOptions;
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
}

export const enum CARD_TYPE {
  handCard = 'hand',
  rowCard = 'row',
  selectedCard = 'selected',
}