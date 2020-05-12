import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';

const appRoutes: Routes = [
    {
      path: '',
      redirectTo: '/welcome',
      pathMatch: 'full'
    },
    {
      path: 'welcome',
      component: WelcomeComponent,
    },
    {
      path: 'game',
      component: GameComponent,
    }
  ];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {

}
