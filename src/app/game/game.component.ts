import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../utils/document.service';

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

  ngOnInit(): void {}

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
      500
    );
  }
}
