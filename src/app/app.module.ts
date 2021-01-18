import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ENVIRONMENT } from './config/global-config';
import { NotFoundComponent } from './error-handling/not-found/not-found.component';
import { FinishedDialogComponent } from './game/board/finished-dialog/finished-dialog.component';
import { GameModule } from './game/game.module';
import { AppMaterialModule } from './modules/app-material.module';
import { EnterNameDialogComponent } from './welcome/enter-name-dialog/enter-name-dialog.component';
import { WelcomeModule } from './welcome/welcome.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
  ],
  imports: [
    AppRoutingModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(ENVIRONMENT.firebase),
    AngularFireDatabaseModule,
    WelcomeModule,
    GameModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [FinishedDialogComponent, EnterNameDialogComponent],
})
export class AppModule {}
