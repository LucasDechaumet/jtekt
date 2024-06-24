import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Mean } from '../../models/mean';
import { ChartModule } from 'primeng/chart';
import { SharedDataService } from '../../services/shared-data.service';
import { MeanWithinInterval } from '../../models/meanWithinInterval';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit {
  httpData: MeanWithinInterval[] = [];
  data: any;
  options: any;
  meanDurationIn: number[] = [];
  meanDurationOut: number[] = [];
  meanNameInLabels: string[] = [];
  meanTypes: string[] = [];
  selectedType: string = '';
  DatesInterval: Date[] = [];
  timeIntervalInMinutes = 0;

  documentStyle = getComputedStyle(document.documentElement);
  textColor = this.documentStyle.getPropertyValue('--text-color');
  textColorSecondary = this.documentStyle.getPropertyValue(
    '--text-color-secondary'
  );
  surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');

  constructor(
    private httpService: HttpService,
    private sharedData: SharedDataService
  ) {}

  ngOnInit() {
    this.sharedData.selectedType$.subscribe((selectedType) => {
      this.selectedType = selectedType;
      this.updateChart();
    });

    this.sharedData.selectedDate$.subscribe((datesInterval) => {
      this.timeIntervalInMinutes =
        (datesInterval[1].getTime() - datesInterval[0].getTime()) / 60000;
      this.DatesInterval = datesInterval;
      this.updateChart();
    });

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            color: this.textColor,
          },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: {
            step: 10,
            color: this.textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: this.textColorSecondary,
          },
          grid: {
            color: this.surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  updateChart() {
    if (this.selectedType) {
      this.httpService.get('/mean/getMeansWithinInterval').subscribe(
        (data: any) => {
          this.httpData = data;
          this.meanNameInLabels = []; // Clear existing labels and data
          this.meanDurationIn = [];
          this.meanDurationOut = [];

          data.forEach((mean: MeanWithinInterval) => {
            this.meanNameInLabels.push(mean.meanName);
            this.meanDurationIn.push(
              (mean.totalDurationIn * 100) / this.timeIntervalInMinutes
            );
            this.meanDurationOut.push(
              (mean.totalDurationOut * 100) / this.timeIntervalInMinutes
            );
          });

          if (this.meanNameInLabels.length > 0) {
            this.data = {
              labels: this.meanNameInLabels,
              datasets: [
                {
                  label: 'Entré',
                  backgroundColor:
                    this.documentStyle.getPropertyValue('--green-500'),
                  borderColor:
                    this.documentStyle.getPropertyValue('--green-500'),
                  data: this.meanDurationIn,
                },
                {
                  label: 'Sortie',
                  backgroundColor:
                    this.documentStyle.getPropertyValue('--red-500'),
                  borderColor: this.documentStyle.getPropertyValue('--red-500'),
                  data: this.meanDurationOut,
                },
              ],
            };
          } else {
            // Reset data if no matching means found
            this.data = {
              labels: [],
              datasets: [],
            };
          }
        },
        (error) => {
          console.error('Error:', error);
          // Handle error and reset data
          this.data = {
            labels: [],
            datasets: [],
          };
        }
      );
    } else {
      // Reset data if no type is selected
      this.data = {
        labels: [],
        datasets: [],
      };
    }
  }
}
