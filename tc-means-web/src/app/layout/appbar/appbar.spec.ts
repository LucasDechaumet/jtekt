import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Appbar } from './appbar';

describe('Appbar', () => {
  let component: Appbar;
  let fixture: ComponentFixture<Appbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Appbar],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Appbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
