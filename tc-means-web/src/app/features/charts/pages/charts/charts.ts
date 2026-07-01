import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { TreeSelectModule } from 'primeng/treeselect';
import { ChartData, ChartOptions } from 'chart.js';
import 'chart.js/auto';
import { environment } from '../../../../../environments/environment';

interface MeanDuration {
  id: string;
  code: string;
  designation: string;
  type: string;
  serialNumber: string;
  daysIn: number;
  daysOut: number;
}

interface MeanDurationApiResponse {
  id: number;
  code: string;
  designation: string;
  type: string | null;
  serialNumber: string | null;
  daysIn: number;
  daysOut: number;
}

const NO_TYPE = 'Sans type';

function toEndOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

@Component({
  selector: 'app-charts',
  imports: [ChartModule, DatePickerModule, FormsModule, TreeSelectModule],
  templateUrl: './charts.html',
  styleUrl: './charts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Charts {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl ?? '';

  protected readonly selectedNodes = signal<TreeNode[]>([]);
  protected readonly dateRange = signal<Date[]>([]);
  private readonly meansData = signal<MeanDuration[]>([]);

  protected readonly meanTree = computed(() => this.buildMeanTree(this.meansData()));

  constructor() {
    effect(() => {
      const [start, end] = this.dateRange();
      this.loadDurations(start ?? null, end ?? null);
    });
  }

  protected readonly chartData = computed<ChartData<'bar'>>(() => {
    const means = this.selectedMeans();

    return {
      labels: means.map((mean) => `${mean.code} - ${mean.designation}`),
      datasets: [
        {
          label: 'Entrée',
          data: means.map((mean) => mean.daysIn),
          backgroundColor: '#22c55e',
          borderRadius: 4,
        },
        {
          label: 'Sortie',
          data: means.map((mean) => mean.daysOut),
          backgroundColor: '#b91c1c',
          borderRadius: 4,
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartOptions<'bar'>>(() => {
    const displayedValues = this.chartData().datasets.flatMap((dataset) =>
      dataset.data.map((value) => Number(value)),
    );
    const maxDisplayedDuration = Math.max(1, ...displayedValues);

    return {
      indexAxis: 'y',
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.formattedValue} j`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          min: 0,
          max: maxDisplayedDuration,
          title: {
            display: true,
            text: 'Durée (jours)',
          },
        },
        y: {
          ticks: {
            mirror: true,
            autoSkip: false,
            color: '#ffffff',
            showLabelBackdrop: true,
            backdropColor: '#000000',
            backdropPadding: 4,
            font: {
              weight: 700,
            },
            padding: 8,
            z: 1,
          },
        },
      },
    };
  });

  private loadDurations(start: Date | null, end: Date | null): void {
    let params = new HttpParams();
    if (start) {
      params = params.set('from', start.toISOString());
    }
    if (end) {
      params = params.set('to', toEndOfDay(end).toISOString());
    }

    this.http
      .get<MeanDurationApiResponse[]>(`${this.apiUrl}/means/stats/durations`, {
        params,
        withCredentials: true,
      })
      .subscribe((means) =>
        this.meansData.set(
          means.map((mean) => ({
            id: mean.id.toString(),
            code: mean.code,
            designation: mean.designation,
            type: mean.type ?? NO_TYPE,
            serialNumber: mean.serialNumber ?? mean.code,
            daysIn: mean.daysIn,
            daysOut: mean.daysOut,
          })),
        ),
      );
  }

  private selectedMeans(): MeanDuration[] {
    const selectedIds = new Set(this.selectedNodes().flatMap((node) => this.extractMeanIds(node)));
    return this.meansData().filter((mean) => selectedIds.has(mean.id));
  }

  private extractMeanIds(node: TreeNode): string[] {
    if (node.children?.length) {
      return node.children.flatMap((child) => this.extractMeanIds(child));
    }

    return node.data?.nodeType === 'mean' ? [node.data.id] : [];
  }

  private buildMeanTree(means: MeanDuration[]): TreeNode[] {
    const types = new Map<string, MeanDuration[]>();
    means.forEach((mean) => {
      const typeMeans = types.get(mean.type) ?? [];
      typeMeans.push(mean);
      types.set(mean.type, typeMeans);
    });

    return Array.from(types.entries()).map(([type, typeMeans]) => ({
      key: type,
      label: type,
      data: { nodeType: 'type', type },
      children: typeMeans.map((mean) => ({
        key: mean.id,
        label: `${mean.code} - ${mean.designation}`,
        data: { nodeType: 'mean', id: mean.id },
      })),
    }));
  }
}
