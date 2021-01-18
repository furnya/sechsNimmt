import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { AppMaterialModule } from '../modules/app-material.module';
import { BoardComponent } from './board/board.component';
import { FinishedDialogComponent } from './board/finished-dialog/finished-dialog.component';
import { HandComponent } from './board/hand/hand.component';
import { MainBoardComponent } from './board/main-board/main-board.component';
import { MinusPointsComponent } from './board/minus-points/minus-points.component';
import { SelectedCardsComponent } from './board/selected-cards/selected-cards.component';
import { CardComponent } from './card/card.component';
import { GameComponent } from './game.component';
import { RowComponent } from './row/row.component';

@NgModule({
  declarations: [
    CardComponent,
    RowComponent,
    BoardComponent,
    HandComponent,
    SelectedCardsComponent,
    GameComponent,
    MainBoardComponent,
    FinishedDialogComponent,
    MinusPointsComponent,
  ],
  imports: [
    AppMaterialModule,
    AppRoutingModule,
    BrowserModule,
    DragDropModule,
  ],
})
export class GameModule {}
