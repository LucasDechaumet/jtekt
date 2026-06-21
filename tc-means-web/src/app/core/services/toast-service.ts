import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    });
  }

  error(errorId: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur : ' + errorId,
      detail:
        'Une erreur inattendue est survenue. Veuillez vous déconnecter et vous reconnecter. ' +
        'Si le problème persiste, contactez le support.',
      sticky: true,
    });
  }

  warn(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 3000,
    });
  }

  info(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
    });
  }
}
