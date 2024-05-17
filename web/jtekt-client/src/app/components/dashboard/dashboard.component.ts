import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Mean } from '../../models/mean';
import {
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatFormField],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  displayColumns: string[] = [
    'storage',
    'serial_number',
    'licence_number',
    'type',
    'name',
    'in_out',
    'date',
    'mean_number',
  ];

  ELEMENT_DATA: Mean[] = [
    {
      storage: 1,
      serial_number: '123',
      licence_number: '123',
      type: '123',
      name: 'Lucas Dechaumet',
      in_out: 'E',
      date: '2021-09-01',
      mean_number: '123',
    },
    {
      storage: 2,
      serial_number: '456',
      licence_number: '456',
      type: '456',
      name: 'Thanh Nguyen',
      in_out: 'S',
      date: '2021-09-02',
      mean_number: '456',
    },
    {
      storage: 3,
      serial_number: '789',
      licence_number: '789',
      type: '789',
      name: 'Marie Dupont',
      in_out: 'E',
      date: '2021-09-03',
      mean_number: '789',
    },
    {
      storage: 4,
      serial_number: '101',
      licence_number: '101',
      type: '101',
      name: 'John Smith',
      in_out: 'S',
      date: '2021-09-04',
      mean_number: '101',
    },
    {
      storage: 5,
      serial_number: '112',
      licence_number: '112',
      type: '112',
      name: 'Alice Martin',
      in_out: 'E',
      date: '2021-09-05',
      mean_number: '112',
    },
    {
      storage: 6,
      serial_number: '131',
      licence_number: '131',
      type: '131',
      name: 'Bob Johnson',
      in_out: 'S',
      date: '2021-09-06',
      mean_number: '131',
    },
    {
      storage: 7,
      serial_number: '415',
      licence_number: '415',
      type: '415',
      name: 'Charlie Lee',
      in_out: 'E',
      date: '2021-09-07',
      mean_number: '415',
    },
    {
      storage: 8,
      serial_number: '161',
      licence_number: '161',
      type: '161',
      name: 'David Brown',
      in_out: 'S',
      date: '2021-09-08',
      mean_number: '161',
    },
    {
      storage: 9,
      serial_number: '718',
      licence_number: '718',
      type: '718',
      name: 'Eva Green',
      in_out: 'E',
      date: '2021-09-09',
      mean_number: '718',
    },
    {
      storage: 10,
      serial_number: '192',
      licence_number: '192',
      type: '192',
      name: 'Frank White',
      in_out: 'S',
      date: '2021-09-10',
      mean_number: '192',
    },
    {
      storage: 11,
      serial_number: '213',
      licence_number: '213',
      type: '213',
      name: 'George Black',
      in_out: 'E',
      date: '2021-09-11',
      mean_number: '213',
    },
    {
      storage: 12,
      serial_number: '242',
      licence_number: '242',
      type: '242',
      name: 'Helen Brown',
      in_out: 'S',
      date: '2021-09-12',
      mean_number: '242',
    },
    {
      storage: 13,
      serial_number: '253',
      licence_number: '253',
      type: '253',
      name: 'Ivy Wilson',
      in_out: 'E',
      date: '2021-09-13',
      mean_number: '253',
    },
    {
      storage: 14,
      serial_number: '274',
      licence_number: '274',
      type: '274',
      name: 'Jack Johnson',
      in_out: 'S',
      date: '2021-09-14',
      mean_number: '274',
    },
    {
      storage: 15,
      serial_number: '295',
      licence_number: '295',
      type: '295',
      name: 'Karen Jones',
      in_out: 'E',
      date: '2021-09-15',
      mean_number: '295',
    },
    {
      storage: 16,
      serial_number: '316',
      licence_number: '316',
      type: '316',
      name: 'Leo King',
      in_out: 'S',
      date: '2021-09-16',
      mean_number: '316',
    },
    {
      storage: 17,
      serial_number: '337',
      licence_number: '337',
      type: '337',
      name: 'Mona Queen',
      in_out: 'E',
      date: '2021-09-17',
      mean_number: '337',
    },
    {
      storage: 18,
      serial_number: '358',
      licence_number: '358',
      type: '358',
      name: 'Nina Prince',
      in_out: 'S',
      date: '2021-09-18',
      mean_number: '358',
    },
    {
      storage: 19,
      serial_number: '379',
      licence_number: '379',
      type: '379',
      name: 'Oscar Duke',
      in_out: 'E',
      date: '2021-09-19',
      mean_number: '379',
    },
    {
      storage: 20,
      serial_number: '400',
      licence_number: '400',
      type: '400',
      name: 'Paula Knight',
      in_out: 'S',
      date: '2021-09-20',
      mean_number: '400',
    },
    {
      storage: 21,
      serial_number: '421',
      licence_number: '421',
      type: '421',
      name: 'Quincy Earl',
      in_out: 'E',
      date: '2021-09-21',
      mean_number: '421',
    },
    {
      storage: 22,
      serial_number: '442',
      licence_number: '442',
      type: '442',
      name: 'Rita Frost',
      in_out: 'S',
      date: '2021-09-22',
      mean_number: '442',
    },
  ];

  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  constructor() {}

  applyFilter(event: Event) {
    const eventValue = (event?.target as HTMLInputElement)?.value;
    const value = eventValue?.trim()?.toLowerCase();
    this.dataSource.filter = value;
  }
}
