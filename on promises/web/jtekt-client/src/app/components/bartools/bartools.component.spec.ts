import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BartoolsComponent } from './bartools.component';

describe('BartoolsComponent', () => {
  let component: BartoolsComponent;
  let fixture: ComponentFixture<BartoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BartoolsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BartoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
