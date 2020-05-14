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

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/' + GLOBAL_CONFIG.urlWelcomePath,
    pathMatch: 'full',
  },
  {
    path: GLOBAL_CONFIG.urlWelcomePath,
    component: WelcomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CreateAndJoinComponent,
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
        component: NotFoundComponent,
      },
      {
        path: ':id',
        component: BoardComponent,
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
        component: CreateAndJoinComponent,
      },
      {
        path: ':gameId',
        component: LobbyComponent,
      },
    ],
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
