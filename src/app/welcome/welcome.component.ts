import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class WelcomeComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor() {}

  ngOnInit() {
    // this.gameCreationService.leaveGame();
    // this.queuedGamesSubscription = this.gameCreationService.queuedGamesChanged.subscribe(
    //   (gameIds) => {
    //     this.setGameIds(gameIds);
    //     this.filteredOptions = this.getFilteredOptions();
    //   }
    // );
    // this.joinedGameSubscription = this.gameCreationService.joinedGameChanged.subscribe(
    //   (joinedGame: JoinedGame) => {
    //     this.joinedGame = joinedGame;
    //     if (this.joinedGame && this.joinedGame.game.started) {
    //       this.navigateToGame(this.joinedGame.game.id);
    //     }
    //   }
    // );
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    // this.queuedGamesSubscription.unsubscribe();
    // this.joinedGameSubscription.unsubscribe();
  }
}
