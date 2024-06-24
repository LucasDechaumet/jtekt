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
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, TableModule, TagModule, DropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  isAdmin = false;

  elementData: Mean[] = [];
  loading: boolean = true;
  globalFilter: string = '';

  inOutOptions = [
    { label: 'In', value: 'In' },
    { label: 'Out', value: 'Out' },
  ];

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    this.isAdmin = this.keycloakService.hasRole('admin');

    // Fetch data from API
    this.httpService.get('/mean/getAllMeans').subscribe((data: any) => {
      this.elementData = data;
      this.loading = false; // Hide loading indicator once data is loaded
    });
  }

  getInOutSeverity(inOut: string): 'success' | 'danger' | undefined {
    switch (inOut) {
      case 'E':
        return 'success';
      case 'S':
        return 'danger';
      default:
        return undefined;
    }
  }

  onRowSelect(rowData: any) {
    console.log('Selected Row Data:', rowData);
    // Optionally, you can log specific fields like ID
    console.log('Selected Row ID:', rowData.id);
    // Perform other actions based on selected row data
  }

  clear(table: Table) {
    table.clear();
  }
}
