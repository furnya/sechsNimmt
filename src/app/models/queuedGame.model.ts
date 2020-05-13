export interface QueuedGame {
  dbKey: string;
  id: string;
  players: Player[];
}

export interface Player {
    name: string;
    isHost: boolean;
    dbKey: string;
}
