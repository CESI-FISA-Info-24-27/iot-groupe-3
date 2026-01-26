import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { LightService } from './light-service';

describe('LightService', () => {
  let service: LightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
