import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../../core/services/auth-service';
import { ToastService } from '../../../../core/services/toast-service';
import { environment } from '../../../../../environments/environment';

type MeanState = 'Entrée' | 'Sortie';

interface Mean {
  id: string;
  designation: string;
  state: MeanState;
  borrower: string;
  type: string;
  code: string;
  serieNumber: string;
  licenceNumber: string;
  storageNumber: string;
  updatedAt: string;
  createdAt: string;
}

interface ImportMeansExcelErrorResponse {
  line: number | null;
  code: string | null;
  message: string;
}

interface ImportMeansExcelResponse {
  createdCount: number;
  errors: ImportMeansExcelErrorResponse[];
}

const EXCEL_HEADERS = [
  'N° Armoire',
  'Désignation',
  'N° Série',
  'N° Licence',
  'Type',
  'Code',
  'Etat',
  'Utilisateur',
  'Date',
];

interface MeanApiResponse {
  id: number;
  isOut: boolean;
  createdAt: string;
  updatedAt: string;
  licenceNumber: string | null;
  designation: string;
  serialNumber: string | null;
  category: string | null;
  type: string | null;
  code: string;
  storageNumber: string | null;
  borrower: string | null;
  isError: boolean;
}

interface MeanHistoryEntry {
  date: string;
  borrower: string;
  state: MeanState;
}

interface MeanHistoryApiResponse {
  isOut: boolean;
  createdAt: string;
  borrower: string | null;
}

interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-means',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FileUploadModule,
    FormsModule,
    InputTextModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './means.html',
  styleUrl: './means.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class Means {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl ?? '';

  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly searchTerm = signal('');
  protected readonly isFormVisible = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formTitle = computed(() =>
    this.editingId() ? 'Modifier le moyen' : 'Ajouter un moyen',
  );
  protected readonly draftDesignation = signal('');
  protected readonly draftType = signal('');
  protected readonly draftCode = signal('');
  protected readonly draftSerieNumber = signal('');
  protected readonly draftLicenceNumber = signal('');
  protected readonly draftStorageNumber = signal('');
  protected readonly isImportVisible = signal(false);
  protected readonly isImporting = signal(false);
  protected readonly isExporting = signal(false);
  protected readonly importErrors = signal<string[]>([]);
  protected readonly selectedExcelFile = signal<File | null>(null);
  protected readonly selectedMeans = signal<Mean[]>([]);
  protected readonly isMeansLoading = signal(false);
  protected readonly skeletonRows = new Array(15).fill(null);
  protected readonly isHistoryVisible = signal(false);
  protected readonly isHistoryLoading = signal(false);
  protected readonly historyTitle = signal('');
  protected readonly historyEntries = signal<MeanHistoryEntry[]>([]);
  protected readonly historyTotal = signal(0);
  private readonly historyMeanId = signal<string | null>(null);
  private readonly meansData = signal<Mean[]>([]);

  constructor() {
    this.loadMeans();
  }

  protected readonly means = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.meansData();
    }

    return this.meansData().filter((mean) =>
      [
        mean.designation,
        mean.state,
        mean.borrower,
        mean.type,
        mean.code,
        mean.serieNumber,
        mean.licenceNumber,
        mean.storageNumber,
        mean.updatedAt,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  });

  protected editMean(mean: Mean): void {
    if (!this.isAdmin()) {
      return;
    }

    this.isFormVisible.set(true);
    this.editingId.set(mean.id);
    this.draftDesignation.set(mean.designation);
    this.draftType.set(mean.type);
    this.draftCode.set(mean.code);
    this.draftSerieNumber.set(mean.serieNumber);
    this.draftLicenceNumber.set(mean.licenceNumber);
    this.draftStorageNumber.set(mean.storageNumber);
  }

  protected deleteMean(mean: Mean): void {
    if (!this.isAdmin()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Supprimer le moyen',
      message: `Supprimer ${mean.designation} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.http
          .delete<void>(`${this.apiUrl}/means/${mean.id}`, { withCredentials: true })
          .subscribe({
            next: () => {
              this.toastService.success('Moyen supprimé', `${mean.designation} a été supprimé.`);
              this.loadMeans();
            },
            error: () => this.toastService.error('DELETE_MEAN'),
          });
      },
    });
  }

  protected addMean(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.isFormVisible.set(true);
    this.editingId.set(null);
    this.draftDesignation.set('');
    this.draftType.set('');
    this.draftCode.set('');
    this.draftSerieNumber.set('');
    this.draftLicenceNumber.set('');
    this.draftStorageNumber.set('');
  }

  protected importMeansExcel(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.isImportVisible.set(true);
    this.importErrors.set([]);
    this.selectedExcelFile.set(null);
  }

  protected closeImport(): void {
    this.isImportVisible.set(false);
    this.importErrors.set([]);
    this.selectedExcelFile.set(null);
  }

  protected downloadExcelTemplate(): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      EXCEL_HEADERS,
      [
        'Armoire 01',
        'Pont roulant A1',
        'ME-240001',
        'Standard',
        'Levage',
        'MOY-001',
        'E',
        'Lucas Dechaumet',
        '04/06/2026 14:32',
      ],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Moyens');
    XLSX.writeFile(workbook, 'modele-import-moyens.xlsx');
  }

  protected onExcelSelected(event: FileSelectEvent): void {
    const file = event.files?.[0];
    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['xls', 'xlsx'].includes(extension)) {
      this.importErrors.set(['Le fichier doit être au format .xlsx ou .xls.']);
      this.selectedExcelFile.set(null);
      return;
    }

    this.selectedExcelFile.set(file);
    this.importErrors.set([]);
  }

  protected importValidatedMeans(): void {
    const file = this.selectedExcelFile();
    if (!file) {
      this.importErrors.set(['Sélectionnez un fichier Excel.']);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.isImporting.set(true);
    this.http
      .post<ImportMeansExcelResponse>(`${this.apiUrl}/means/excel`, formData, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.isImporting.set(false);
          const errors = response.errors.map((error) => {
            const line = error.line ? `Ligne ${error.line}` : 'Fichier';
            const code = error.code ? ` (${error.code})` : '';
            return `${line}${code}: ${error.message}`;
          });

          this.importErrors.set(errors);
          if (errors.length) {
            this.toastService.warn(
              'Import partiel',
              `${response.createdCount} moyen(s) importé(s). Corrigez les lignes en erreur.`,
            );
            return;
          }

          this.toastService.success('Import terminé', `${response.createdCount} moyen(s) importé(s).`);
          this.loadMeans();
          this.closeImport();
        },
        error: () => {
          this.isImporting.set(false);
          this.toastService.error('IMPORT_EXCEL');
        },
      });
  }

  protected extractMeans(): void {
    if (!this.isAdmin()) {
      return;
    }

    const selectedMeans = this.selectedMeans();
    if (!selectedMeans.length) {
      this.toastService.warn('Sélection requise', 'Sélectionnez au moins un moyen à exporter.');
      return;
    }

    const codes = selectedMeans.map((mean) => mean.code);
    this.isExporting.set(true);
    this.http
      .post(`${this.apiUrl}/means/excel/export`, codes, {
        withCredentials: true,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          this.isExporting.set(false);
          this.downloadBlob(blob, 'extraction-moyens.xlsx');
        },
        error: () => {
          this.isExporting.set(false);
          this.toastService.error('EXPORT_EXCEL');
        },
      });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected openHistory(mean: Mean): void {
    this.historyMeanId.set(mean.id);
    this.historyTitle.set(`${mean.designation} (${mean.code})`);
    this.historyEntries.set([]);
    this.historyTotal.set(0);
    this.isHistoryVisible.set(true);
  }

  protected loadHistory(event: TableLazyLoadEvent): void {
    const meanId = this.historyMeanId();
    if (!meanId) {
      return;
    }

    const size = event.rows ?? 25;
    const page = Math.floor((event.first ?? 0) / size);
    const params = new HttpParams().set('page', page).set('size', size);

    this.isHistoryLoading.set(true);
    this.http
      .get<PageResponse<MeanHistoryApiResponse>>(`${this.apiUrl}/means/${meanId}/history`, {
        params,
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.historyEntries.set(
            response.content.map((entry) => ({
              date: this.formatDate(new Date(entry.createdAt)),
              borrower: entry.borrower ?? '-',
              state: entry.isOut ? 'Sortie' : 'Entrée',
            })),
          );
          this.historyTotal.set(response.page.totalElements);
          this.isHistoryLoading.set(false);
        },
        error: () => {
          this.isHistoryLoading.set(false);
          this.toastService.error('GET_HISTORY');
        },
      });
  }

  protected closeHistory(): void {
    this.isHistoryVisible.set(false);
    this.historyMeanId.set(null);
  }

  protected cancelEdit(): void {
    this.isFormVisible.set(false);
    this.editingId.set(null);
  }

  protected saveEdit(): void {
    if (!this.isAdmin()) {
      return;
    }

    const id = this.editingId();
    if (!id) {
      const payload = {
        isOut: false,
        isError: false,
        borrower: null,
        category: null,
        designation: this.draftDesignation(),
        type: this.draftType(),
        code: this.draftCode(),
        serialNumber: this.draftSerieNumber(),
        licenceNumber: this.draftLicenceNumber(),
        storageNumber: this.draftStorageNumber(),
      };
      this.http
        .post<MeanApiResponse>(`${this.apiUrl}/means`, payload, { withCredentials: true })
        .subscribe({
          next: () => {
            this.toastService.success('Moyen ajouté', 'Le moyen a été créé.');
            this.loadMeans();
            this.cancelEdit();
          },
          error: () => this.toastService.error('CREATE_MEAN'),
        });
      return;
    }

    const existing = this.meansData().find((item) => item.id === id);
    const payload = {
      isOut: existing?.state === 'Sortie',
      isError: false,
      borrower: existing && existing.borrower !== '-' ? existing.borrower : null,
      category: null,
      designation: this.draftDesignation(),
      type: this.draftType(),
      code: this.draftCode(),
      serialNumber: this.draftSerieNumber(),
      licenceNumber: this.draftLicenceNumber(),
      storageNumber: this.draftStorageNumber(),
    };
    this.http
      .put<MeanApiResponse>(`${this.apiUrl}/means/${id}`, payload, { withCredentials: true })
      .subscribe({
        next: () => {
          this.toastService.success('Moyen modifié', 'Le moyen a été mis à jour.');
          this.loadMeans();
          this.cancelEdit();
        },
        error: () => this.toastService.error('UPDATE_MEAN'),
      });
  }

  private loadMeans(): void {
    this.isMeansLoading.set(true);
    this.http
      .get<MeanApiResponse[]>(`${this.apiUrl}/means`, { withCredentials: true })
      .subscribe({
        next: (means) => {
          this.meansData.set(means.map((m) => this.mapMean(m)));
          this.isMeansLoading.set(false);
        },
        error: () => this.isMeansLoading.set(false),
      });
  }

  private mapMean(api: MeanApiResponse): Mean {
    return {
      id: api.id.toString(),
      designation: api.designation,
      state: api.isOut ? 'Sortie' : 'Entrée',
      borrower: api.isOut ? api.borrower ?? '-' : '-',
      type: api.type ?? '-',
      code: api.code,
      serieNumber: api.serialNumber ?? '-',
      licenceNumber: api.licenceNumber ?? '-',
      storageNumber: api.storageNumber ?? '-',
      updatedAt: this.formatDate(new Date(api.updatedAt)),
      createdAt: this.formatDate(new Date(api.createdAt)),
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
