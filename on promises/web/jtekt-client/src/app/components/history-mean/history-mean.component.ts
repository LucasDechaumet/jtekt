import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { History } from '../../models/mean';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-history-mean',
  standalone: true,
  imports: [MatTableModule, MatFormField],
  templateUrl: './history-mean.component.html',
  styleUrl: './history-mean.component.css',
})
export class HistoryMeanComponent implements OnInit {
  displayColumns: string[] = ['username', 'created_at', 'in_out'];

  elementData: History[] = [];

  dataSource = new MatTableDataSource(this.elementData);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    const meanNumber = this.activatedRoute.snapshot.params['meanNumber'];
    this.httpService
      .get(`/mean/getMeanByMeanNumber/${meanNumber}`)
      .subscribe((data: any) => {
        console.log(data);
        this.elementData = data.histories;
        this.dataSource = new MatTableDataSource(this.elementData);
      });
  }
}
