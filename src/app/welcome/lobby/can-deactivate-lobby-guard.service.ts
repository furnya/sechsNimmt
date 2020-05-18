import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LobbyComponent } from './lobby.component';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { RoomCreationService } from '../room-creation.service';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateLobbyGuard implements CanDeactivate<LobbyComponent> {

  constructor(private roomCreationService: RoomCreationService) {}

  canDeactivate(component: LobbyComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
    if (nextState.url.includes(GLOBAL_CONFIG.urlGamePath)) {
      return true;
    }
    if (
      confirm(
        'Das Spiel wirklich verlassen? Du wirst erneut beitreten müssen um mitzuspielen!'
      )
    ) {
      this.roomCreationService.leaveRoom();
      return true;
    } else {
      return false;
    }
  }
}
