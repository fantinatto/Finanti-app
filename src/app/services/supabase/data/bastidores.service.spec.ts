import { TestBed } from '@angular/core/testing';

import { BastidoresService } from './bastidores.service';

describe('BastidoresService', () => {
  let service: BastidoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BastidoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
