import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';
import { NotFoundComponent } from './error-handling/not-found/not-found.component';
import { BoardComponent } from './game/board/board.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'game',
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
    path: '**',
    redirectTo: '/welcome',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
