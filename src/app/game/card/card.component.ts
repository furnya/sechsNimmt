import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GameService } from '../game.service';
import { CARD_TYPE } from 'src/app/models/game.model';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() id: number;
  @Input() isSelected: boolean;
  @Input() isSmallestCard = false;
  @Input() type: CARD_TYPE;
  @Output() cardSelected: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private gameService: GameService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
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

  ngOnInit(): void {
  }

  getBullAmount(): number[] {
    const bullAmount = this.gameService.calculateMinusPoints(this.id)
    return bullAmount === -1 ? [] : Array.from(Array(bullAmount).keys());
  }

  flexBasisBull(bullAmount: number, index: number) {
    switch (bullAmount) {
      case 1:
        return '100%';
      case 2:
        return '50%';
      case 3:
        return '33%';
      case 5:
        return '33%';
      case 7:
        return '25%';
    }
    return 'auto';
  }

  backgroundColorBull(bullAmount: number) {
    switch (bullAmount) {
      case 1:
        return 'white';
      case 2:
        return '#85d9ff';
      case 3:
        return '#ffca4b';
      case 5:
        return '#ff3f69';
      case 7:
        return '#9229ae';
    }
    return 'white';
  }

  onCardSelected() {
    this.cardSelected.emit(this.id);
  }
}
