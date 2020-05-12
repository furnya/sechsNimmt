import { TestBed } from '@angular/core/testing';

import { GameCreationService } from './game-creation.service';

describe('GameCreationService', () => {
  let service: GameCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
