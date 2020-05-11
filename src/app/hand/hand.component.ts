import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit {

  cards = [1,2,3,4,5,6,7,8,9,10];

  selectedCard = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(
        'https://europe-west1-sechsnimmt-33e6e.cloudfunctions.net/helloWorld'
      ).subscribe((data: string) => {
      console.log(data);
      this.selectedCard = +data;
    });
  }

  onCardSelected(id: number) {
    this.selectedCard = id;
  }

}
