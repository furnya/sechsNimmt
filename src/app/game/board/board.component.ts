import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {


  constructor(private route: ActivatedRoute, private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.startGame(this.route.snapshot.params.id);
  }

}
