import { Component, OnInit } from '@angular/core';
import { GLOBAL_CONFIG } from 'src/app/config/global-config';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  urlWelcomePath: string;

  constructor() { }

  ngOnInit(): void {
    this.urlWelcomePath = GLOBAL_CONFIG.urlWelcomePath;
  }

}
