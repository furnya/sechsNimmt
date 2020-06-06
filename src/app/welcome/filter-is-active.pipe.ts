import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../models/game.model';
import { GLOBAL_CONFIG } from '../config/global-config';

export const playerIsActive = (player: Player) => {
  return (new Date().getTime() - player.isActive) < GLOBAL_CONFIG.activeTimeoutInMilliseconds;
};

export const filterActivePlayers = (players: Player[]) => {
  return players?.filter(p => playerIsActive(p));
};

@Pipe({
  name: 'filterIsActive'
})
export class FilterIsActivePipe implements PipeTransform {

  constructor() {}

  transform(players: Player[]): Player[] {
    return filterActivePlayers(players);
  }

}
