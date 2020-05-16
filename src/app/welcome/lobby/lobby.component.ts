import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { GLOBAL_CONFIG, ENVIRONMENT } from 'src/app/config/global-config';
import { JoinedGame, Player } from 'src/app/models/game';
import { EnterNameDialogComponent } from '../enter-name-dialog/enter-name-dialog.component';
import { GameCreationService } from '../game-creation.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  @ViewChild('joinGameIdFormControl') joinGameIdFormControl: FormControl;
  queuedGameIds: string[] = [];
  filteredOptions: Observable<string[]>;
  queuedGamesSubscription: Subscription;
  joinedGameSubscription: Subscription;
  joinedGame: JoinedGame = null;
  inviteLink = '';

  constructor(
    private gameCreationService: GameCreationService,
    private router: Router,
    private route: ActivatedRoute,
    private enterNameDialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      'copy-to-clipboard',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/content-copy.svg'
      )
    );
  }

  ngOnInit() {
    const gameId: string = this.route.snapshot.params?.gameId;
    const player: Player = JSON.parse(localStorage.getItem('player_' + gameId));
    if (player?.name) {
      if (!this.gameCreationService.joinedGame) {
        this.gameCreationService.joinGameIfAlreadyIn(gameId, player.name);
      } else {
        this.joinedGame = this.gameCreationService.joinedGame;
      }
    }
    this.joinedGameSubscription = this.gameCreationService.joinedGameChanged.subscribe(
      (joinedGame: JoinedGame) => {
        this.joinedGame = joinedGame;
        if (this.joinedGame && this.joinedGame.game.started) {
          this.navigateToGame(this.joinedGame.game.id);
        }
      }
    );
    this.gameCreationService.gameExists(gameId).subscribe((game) => {
      if (!game.exists || game.started) {
        this.gameCreationService.joinedGame = null;
        this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
        return;
      }
      if (!player) {
        const dialogRef = this.enterNameDialog.open(EnterNameDialogComponent, {
          data: { gameId },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result){
            this.gameCreationService.joinGameFromForm(gameId, result, false);
          } else {
            this.router.navigate(['/' + GLOBAL_CONFIG.urlWelcomePath]);
          }
        });
      }
      this.inviteLink = window.location.toString();
    });
  }

  ngOnDestroy() {
    this.joinedGameSubscription.unsubscribe();
  }

  isCurrentPlayer(player): boolean {
    return player === this.joinedGame.player;
  }

  isCurrentPlayerName(playerName): boolean {
    return playerName === this.joinedGame.player.name;
  }

  navigateToGame(gameId: string) {
    this.router.navigate([GLOBAL_CONFIG.urlGamePath, gameId]);
  }

  onStartGame() {
    if (this.joinedGame.player.isHost) {
      this.gameCreationService.startGame();
    }
  }

  onLeaveGame() {
    this.gameCreationService.leaveGame();
  }
}
