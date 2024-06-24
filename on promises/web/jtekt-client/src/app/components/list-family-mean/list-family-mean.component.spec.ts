import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFamilyMeanComponent } from './list-family-mean.component';

describe('ListFamilyMeanComponent', () => {
  let component: ListFamilyMeanComponent;
  let fixture: ComponentFixture<ListFamilyMeanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFamilyMeanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListFamilyMeanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
