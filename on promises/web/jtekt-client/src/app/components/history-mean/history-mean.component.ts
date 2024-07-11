import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { History } from '../../models/mean';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-history-mean',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    TagModule,
    DropdownModule,
    DateFormatPipe,
  ],
  templateUrl: './history-mean.component.html',
  styleUrl: './history-mean.component.css',
})
export class HistoryMeanComponent implements OnInit {
  inOutOptions = [
    { label: 'Entrée', value: 'E' },
    { label: 'Sortie', value: 'S' },
  ];

  elementData: History[] = [];
  loading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    const meanNumber = this.activatedRoute.snapshot.params['meanNumber'];
    this.httpService
      .get(`/mean/getMeanByMeanNumber/${meanNumber}`)
      .subscribe((data: any) => {
        this.elementData = data.histories;
        console.log('Data:', this.elementData);
        this.loading = false;
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

  clear(table: Table) {
    table.clear();
  }
}
