import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private _cardWidth: number;
  private _cardHeight: number;
  private _cardFontSize: number;
  private _chooseButtonWidth: number;
  private _chooseButtonHeight: number;
  private _chooseButtonFontSize: number;

  constructor() {
    this.recalculateSize();
  }

  get cardWidth() {
    return this._cardWidth;
  }

  get cardHeight() {
    return this._cardHeight;
  }

  get cardFontSize() {
    return this._cardFontSize;
  }

  get chooseButtonWidth() {
    return this._chooseButtonWidth;
  }

  get chooseButtonHeight() {
    return this._chooseButtonHeight;
  }

  get chooseButtonFontSize() {
    return this._chooseButtonFontSize;
  }
  
  recalculateSize() {
    const rect = document.body.getBoundingClientRect(); 
    this._cardWidth = Math.min(9/100 * rect.height, 5/100 * rect.width);
    this._cardHeight = Math.min(12/100 * rect.height, 8/100 * rect.width);
    this._cardFontSize = Math.min(4/100 * rect.height, 8/100 * rect.width, 43);
    this._chooseButtonHeight = 0.5 * this._cardHeight;
    this._chooseButtonWidth = 1.0 * this._cardWidth;
    this._chooseButtonFontSize = Math.min(0.3 * this._chooseButtonHeight, 0.3 * this._chooseButtonWidth);
  }
}

