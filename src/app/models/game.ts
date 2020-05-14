export interface Game {
  dbKey: string;
  id: string;
  players: Player[];
  started: boolean;
}

export interface JoinedGame {
  game: Game;
  player: Player;
}

export interface Player {
    name: string;
    isHost: boolean;
    dbKey: string;
}

export interface GameState {
  boardRows: number[][];
  playerStates: PlayerState[];
  choosingCards: boolean;
}

export interface PlayerState {
  player: Player;
  hand: number[];
  selectedCard: number;
  minusPoints: number;
}
