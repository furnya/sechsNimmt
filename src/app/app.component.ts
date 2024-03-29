import { registerLocaleData } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DB_ENVIRONMENT } from './config/global-config';
import localeDE from '@angular/common/locales/de';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      'sechsnimmt_logo',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/logo.svg'
      )
    );
    this.iconRegistry.addSvgIcon(
      'bull',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/ochse_gerade.svg'
      )
    );
    this.iconRegistry.addSvgIcon(
      'bull_background',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/ochse_gerade_background.svg'
      )
    );
  }

  ngOnInit() {
    if (!environment.production) {
      DB_ENVIRONMENT.dbBase = 'DEV';
    }
    registerLocaleData(localeDE, 'de');
  }
}
