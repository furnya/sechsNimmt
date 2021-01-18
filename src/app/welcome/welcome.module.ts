import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { AppMaterialModule } from '../modules/app-material.module';
import { CreateAndJoinComponent } from './create-and-join/create-and-join.component';
import { EnterNameDialogComponent } from './enter-name-dialog/enter-name-dialog.component';
import { FilterIsActivePipe } from './filter-is-active.pipe';
import { LobbyComponent } from './lobby/lobby.component';
import { WelcomeComponent } from './welcome.component';

@NgModule({
    declarations: [
        CreateAndJoinComponent,
        LobbyComponent,
        WelcomeComponent,
        EnterNameDialogComponent,
        FilterIsActivePipe
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        FormsModule,
        ClipboardModule,
    ]
})
export class WelcomeModule {}
