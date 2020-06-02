import { Component, OnInit } from '@angular/core';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';
import { GameService } from '../../game.service';

@Component({
  selector: 'app-main-board',
  templateUrl: './main-board.component.html',
  styleUrls: ['./main-board.component.scss']
})
export class MainBoardComponent implements OnInit {

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  get rows() {
    const rowCount = this.gameService.options
      ? this.gameService.options.rows.value
      : GLOBAL_CONFIG.defaultOptions.rows.value;
    return Array.from(Array(rowCount).keys());
  }

}
