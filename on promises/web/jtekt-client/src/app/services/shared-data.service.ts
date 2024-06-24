import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private meanTypesSource = new BehaviorSubject<string[]>([]);
  meanTypes$ = this.meanTypesSource.asObservable();

  private selectedTypeSource = new BehaviorSubject<string>('');
  selectedType$ = this.selectedTypeSource.asObservable();

  private selectedDateSource = new BehaviorSubject<Date[]>(new Array<Date>());
  selectedDate$ = this.selectedDateSource.asObservable();

  constructor() {}

  setSelectedDate(selectedDate: Date[]) {
    this.selectedDateSource.next(selectedDate);
  }

  setMeanTypes(meanTypes: string[]) {
    this.meanTypesSource.next(meanTypes);
  }

  setSelectedType(selectedType: string) {
    this.selectedTypeSource.next(selectedType);
  }
}
