import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { GameCreationService } from './game-creation.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  joinGameIdFormControl = new FormControl();
  queuedGames: string[] = ['1234', '2345', '5678'];
  filteredOptions: Observable<string[]>;

  currentPlayer = 'Lino';
  players: string[] = ['Lino', 'Leonie', 'Simone', 'Henry'];

  constructor(private gameCreationService: GameCreationService) { }

  ngOnInit() {
    this.filteredOptions = this.joinGameIdFormControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.queuedGames.filter(option => option.toLowerCase().includes(filterValue));
  }

  onJoinGame(joinGameForm: NgForm) {
    this.gameCreationService.joinGame(joinGameForm.value.joinGameId, joinGameForm.value.playerName).subscribe(data => {
      console.log(data);
    });
  }

  onCreateGame(createGameForm: NgForm) {
    this.gameCreationService.createGame(createGameForm.value.createGameId, createGameForm.value.playerName).subscribe(data => {
      console.log(data);
    });
  }

}
