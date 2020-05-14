import { Component, OnInit } from '@angular/core';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

@Component({
  selector: 'app-main-board',
  templateUrl: './main-board.component.html',
  styleUrls: ['./main-board.component.scss']
})
export class MainBoardComponent implements OnInit {

  constructor() { }

  rows: number[] = [];

  ngOnInit(): void {
    this.rows = Array.from(Array(GLOBAL_CONFIG.rows).keys());
  }

}
