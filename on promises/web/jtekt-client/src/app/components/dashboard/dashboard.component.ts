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
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    TagModule,
    DropdownModule,
    DateFormatPipe,
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  isAdmin = false;

  elementData: Mean[] = [];
  loading: boolean = true;
  globalFilter: string = '';

  inOutOptions = [
    { label: 'Entrée', value: 'E' },
    { label: 'Sortie', value: 'S' },
  ];

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private httpService: HttpService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    this.isAdmin = this.keycloakService.hasRole('admin');

    // Fetch data from API
    this.httpService.get('/mean/getAllMeans').subscribe((data: any) => {
      this.elementData = data;
      console.log('Data:', this.elementData);
      this.loading = false; // Hide loading indicator once data is loaded
    });
  }

  getLastUsername(mean: Mean): string {
    return mean.in_out === 'E' || mean.histories.length === 0
      ? ''
      : mean.histories[mean.histories.length - 1].username || '';
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
    this.router.navigate([`/history/${rowData.meanNumber}`]);
  }

  confirmDelete(mean: Mean, event: Event) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${mean.meanNumber}?`,
      accept: () => {
        this.onDeleteMean(mean);
      },
    });
  }

  fetchData(): void {
    this.loading = true;
    this.httpService.get('/mean/getAllMeans').subscribe((data: any) => {
      this.elementData = data;
      this.loading = false;
    });
  }

  onDeleteMean(mean: Mean) {
    this.httpService.delete(`/mean/delete/${mean.meanNumber}`).subscribe(() => {
      this.fetchData();
    });
  }

  clear(table: Table) {
    table.clear();
  }
}
