import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Mean } from '../../models/mean';
import {
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';
import { KeycloakService } from '../../services/keycloak.service';
import { Router } from '@angular/router';
import { MeanRow } from '../../models/mean-row';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatFormField],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  isAdmin = false;

  displayColumns: string[] = [
    'storage',
    'serial_number',
    'licence_number',
    'type',
    'name',
    'in_out',
    'date',
    'meanNumber',
  ];

  elementData: Mean[] = [];

  dataSource = new MatTableDataSource(this.elementData);

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.keycloakService.hasRole('admin');
    this.httpService.get('/mean/getAllMeans').subscribe((data: any) => {
      console.log(data);
      this.elementData = data;
      this.dataSource = new MatTableDataSource(this.elementData);
    });
  }

  applyFilter(event: Event) {
    const eventValue = (event?.target as HTMLInputElement)?.value;
    const value = eventValue?.trim()?.toLowerCase();
    this.dataSource.filter = value;
  }

  showHistory(row: any) {
    this.router.navigate(['/history', row.meanNumber]);
  }
}
