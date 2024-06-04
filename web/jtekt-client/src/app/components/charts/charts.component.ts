import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { Mean } from '../../models/mean';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit {
  barChartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
        },
        title: {
          display: true,
          text: 'Pourcentage (%)',
        },
      },
      y: {
        ticks: {
          autoSkip: false,
        },
        max: 10,
      },
    },
    plugins: {},
  };
  barChartLabels: string[] = [];
  barChartData: ChartDataset[] = [
    {
      data: [], // Initialiser avec un tableau vide
      label: 'Pourcentage',
    },
  ];
  barChartType: ChartType = 'bar';

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.httpService.get('/mean/getAllMeans').subscribe((data: any) => {
      const newBarChartLabels: string[] = [];
      const newBarChartData: number[] = [];
      let count: number = 0;
      data.forEach((mean: Mean) => {
        count++;
        newBarChartLabels.push(mean.name);
        newBarChartData.push(mean.storage);
      });
      console.log(count);
      // Mettre à jour les propriétés du composant
      this.barChartLabels = newBarChartLabels;
      this.barChartData[0].data = newBarChartData;
    });
  }
}
