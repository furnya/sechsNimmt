import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';
import { NotFoundComponent } from './error-handling/not-found/not-found.component';
import { BoardComponent } from './game/board/board.component';
import { GLOBAL_CONFIG } from './config/global-config';
import { CreateAndJoinComponent } from './welcome/create-and-join/create-and-join.component';
import { LobbyComponent } from './welcome/lobby/lobby.component';
import { CanDeactivateLobbyGuard } from './welcome/lobby/can-deactivate-lobby-guard.service';
import { ImpressumComponent } from './welcome/impressum/impressum.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/' + GLOBAL_CONFIG.urlWelcomePath,
    pathMatch: 'full'
  },
  {
    path: GLOBAL_CONFIG.urlWelcomePath,
    component: WelcomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CreateAndJoinComponent
      }
    ]
  },
  {
    path: GLOBAL_CONFIG.urlGamePath,
    component: GameComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/' + GLOBAL_CONFIG.urlNotFoundPath
      },
      {
        path: ':id',
        component: BoardComponent
      },
    ],
  },
  {
    path: GLOBAL_CONFIG.urlJoinPath,
    component: WelcomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CreateAndJoinComponent
      },
      {
        path: ':gameId',
        component: LobbyComponent,
        canDeactivate: [CanDeactivateLobbyGuard]
      },
    ],
  },
  {
    path: GLOBAL_CONFIG.urlNotFoundPath,
    component: NotFoundComponent
  },
  {
    path: 'impressum',
    component: ImpressumComponent
  },
  {
    path: '**',
    redirectTo: '/' + GLOBAL_CONFIG.urlWelcomePath,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
