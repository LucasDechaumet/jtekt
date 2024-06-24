import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryMeanComponent } from './history-mean.component';

describe('HistoryMeanComponent', () => {
  let component: HistoryMeanComponent;
  let fixture: ComponentFixture<HistoryMeanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryMeanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryMeanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
