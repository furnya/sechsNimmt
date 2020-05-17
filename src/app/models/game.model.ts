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
}

export interface Game {
  id: string;
  players: Player[];
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
