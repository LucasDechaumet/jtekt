import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastService } from '../../../../core/services/toast-service';
import { environment } from '../../../../../environments/environment';

type MeanState = 'Entrée' | 'Sortie';

interface MeanError {
  id: string;
  code: string;
  state: MeanState;
  borrower: string;
  date: string;
}

interface MeanApiResponse {
  id: number;
  isOut: boolean;
  updatedAt: string;
  code: string;
  borrower: string | null;
}

@Component({
  selector: 'app-error-page',
  imports: [
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    SkeletonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './error.html',
  styleUrl: './error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl ?? '';

  protected readonly searchTerm = signal('');
  protected readonly isCorrectionVisible = signal(false);
  protected readonly isCorrecting = signal(false);
  protected readonly correctingId = signal<string | null>(null);
  protected readonly draftCode = signal('');
  protected readonly isLoading = signal(false);
  protected readonly skeletonRows = new Array(15).fill(null);
  private readonly errorsData = signal<MeanError[]>([]);

  constructor() {
    this.loadErrors();
  }

  protected readonly errors = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.errorsData();
    }

    return this.errorsData().filter((error) =>
      [error.code, error.state, error.borrower, error.date].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  protected correctError(error: MeanError): void {
    this.isCorrectionVisible.set(true);
    this.correctingId.set(error.id);
    this.draftCode.set(error.code);
  }

  protected cancelCorrection(): void {
    this.isCorrectionVisible.set(false);
    this.correctingId.set(null);
  }

  protected saveCorrection(): void {
    const id = this.correctingId();
    if (!id) {
      return;
    }

    this.isCorrecting.set(true);
    this.http
      .patch<MeanApiResponse>(
        `${this.apiUrl}/means/${id}/correct`,
        { code: this.draftCode() },
        { withCredentials: true },
      )
      .subscribe({
        next: () => {
          this.isCorrecting.set(false);
          this.toastService.success('Erreur corrigée', "L'historique a été rattaché au bon moyen.");
          this.loadErrors();
          this.cancelCorrection();
        },
        error: (response) => {
          this.isCorrecting.set(false);
          if (response?.status === 404) {
            this.toastService.warn('Code introuvable', "Aucun moyen ne correspond à ce code.");
            return;
          }
          this.toastService.error('CORRECT_MEAN');
        },
      });
  }

  private loadErrors(): void {
    this.isLoading.set(true);
    this.http
      .get<MeanApiResponse[]>(`${this.apiUrl}/means/errors`, { withCredentials: true })
      .subscribe({
        next: (means) => {
          this.errorsData.set(means.map((mean) => this.mapError(mean)));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private mapError(api: MeanApiResponse): MeanError {
    return {
      id: api.id.toString(),
      code: api.code,
      state: api.isOut ? 'Sortie' : 'Entrée',
      borrower: api.borrower ?? '-',
      date: this.formatDate(new Date(api.updatedAt)),
    };
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
