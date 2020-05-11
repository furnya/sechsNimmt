import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards = [1,2,3,4,5,6,7,8,9,10];

  selectedCard = 2;

  constructor() { }

  ngOnInit(): void {
  }

  onCardSelected(id: number) {
    this.selectedCard = id;
  }

}
