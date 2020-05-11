import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss']
})
export class RowComponent implements OnInit {

  cards = [];
  
  constructor() { }
  
  ngOnInit() {
    for (let i=1; i<6; i++) {
      this.cards.push(i);
    }
  }

}
