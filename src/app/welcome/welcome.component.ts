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
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }
}
