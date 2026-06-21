import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '../../../../core/services/toast-service';
import { environment } from '../../../../../environments/environment';

type UserRole = 'ADMIN' | 'USER' | 'PDA';

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface UserApiResponse {
  id: number;
  username: string;
  role: UserRole;
}

const ROLES: UserRole[] = ['ADMIN', 'USER', 'PDA'];

@Component({
  selector: 'app-users',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export class Users {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = environment.apiUrl ?? '';

  protected readonly searchTerm = signal('');
  protected readonly isFormVisible = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly skeletonRows = new Array(15).fill(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formTitle = computed(() =>
    this.editingId() ? "Modifier l'utilisateur" : 'Ajouter un utilisateur',
  );
  protected readonly passwordHint = computed(() =>
    this.editingId() ? 'Laisser vide pour conserver le mot de passe actuel' : '',
  );
  protected readonly draftUsername = signal('');
  protected readonly draftPassword = signal('');
  protected readonly draftRole = signal<UserRole>('USER');
  protected readonly roles = ROLES;
  private readonly usersData = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  protected readonly users = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.usersData();
    }

    return this.usersData().filter((user) =>
      [user.username, user.role].some((value) => value.toLowerCase().includes(query)),
    );
  });

  protected addUser(): void {
    this.isFormVisible.set(true);
    this.editingId.set(null);
    this.draftUsername.set('');
    this.draftPassword.set('');
    this.draftRole.set('USER');
  }

  protected editUser(user: User): void {
    this.isFormVisible.set(true);
    this.editingId.set(user.id);
    this.draftUsername.set(user.username);
    this.draftPassword.set('');
    this.draftRole.set(user.role);
  }

  protected deleteUser(user: User): void {
    this.confirmationService.confirm({
      header: "Supprimer l'utilisateur",
      message: `Supprimer ${user.username} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.http
          .delete<void>(`${this.apiUrl}/users/${user.id}`, { withCredentials: true })
          .subscribe({
            next: () => {
              this.toastService.success('Utilisateur supprimé', `${user.username} a été supprimé.`);
              this.loadUsers();
            },
            error: () => this.toastService.error('DELETE_USER'),
          });
      },
    });
  }

  protected cancelEdit(): void {
    this.isFormVisible.set(false);
    this.editingId.set(null);
  }

  protected saveEdit(): void {
    const id = this.editingId();

    if (!id) {
      if (!this.draftUsername().trim() || !this.draftPassword().trim()) {
        this.toastService.warn('Champs requis', "Le nom d'utilisateur et le mot de passe sont obligatoires.");
        return;
      }

      this.isSaving.set(true);
      this.http
        .post<UserApiResponse>(
          `${this.apiUrl}/users`,
          {
            username: this.draftUsername(),
            password: this.draftPassword(),
            role: this.draftRole(),
          },
          { withCredentials: true },
        )
        .subscribe({
          next: () => this.onSaved('Utilisateur ajouté'),
          error: (response) => this.onSaveError(response),
        });
      return;
    }

    this.isSaving.set(true);
    this.http
      .put<UserApiResponse>(
        `${this.apiUrl}/users/${id}`,
        {
          username: this.draftUsername(),
          password: this.draftPassword() || null,
          role: this.draftRole(),
        },
        { withCredentials: true },
      )
      .subscribe({
        next: () => this.onSaved('Utilisateur modifié'),
        error: (response) => this.onSaveError(response),
      });
  }

  private onSaved(summary: string): void {
    this.isSaving.set(false);
    this.toastService.success(summary, "L'utilisateur a été enregistré.");
    this.loadUsers();
    this.cancelEdit();
  }

  private onSaveError(response: { status?: number }): void {
    this.isSaving.set(false);
    if (response?.status === 409) {
      this.toastService.warn('Nom déjà utilisé', "Ce nom d'utilisateur existe déjà.");
      return;
    }
    this.toastService.error('SAVE_USER');
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.http
      .get<UserApiResponse[]>(`${this.apiUrl}/users`, { withCredentials: true })
      .subscribe({
        next: (users) => {
          this.usersData.set(users.map((user) => ({ ...user, id: user.id.toString() })));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
