import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { DocumentService } from '../utils/document.service';

const RESIZE_TIMEOUT_MS = 500

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {

  resizeTimeout: any;
  loading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.loading = true;
    this.cdr.detectChanges();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    this.resizeTimeout = setTimeout(
      () => {
        this.documentService.recalculateSize();
        this.loading = false;
      },
      RESIZE_TIMEOUT_MS
    );
  }
}
