import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';

const MENU_ITEMS: MenuItem[] = [
  { label: 'Moyens', icon: 'pi pi-wrench', routerLink: ['/means'] },
  { label: 'Graphiques', icon: 'pi pi-chart-bar', routerLink: ['/charts'], state: { admin: true } },
  { label: 'Erreur', icon: 'pi pi-exclamation-triangle', routerLink: ['/error'], state: { admin: true } },
  { label: 'Utilisateurs', icon: 'pi pi-users', routerLink: ['/users'], state: { admin: true } },
];

@Component({
  selector: 'app-appbar',
  imports: [MenubarModule, ButtonModule, TooltipModule],
  templateUrl: './appbar.html',
  styleUrl: './appbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Appbar {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly logoSrc = 'assets/images/jtekt_logo.png';
  protected readonly username = computed(() => this.authService.user()?.username ?? '');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly items = computed<MenuItem[]>(() =>
    MENU_ITEMS.filter((item) => !item.state?.['admin'] || this.authService.isAdmin()).map((item) => ({
      ...item,
      styleClass: this.isActive(item.routerLink) ? 'appbar-item-active' : undefined,
    })),
  );

  private isActive(routerLink: MenuItem['routerLink']): boolean {
    const path = Array.isArray(routerLink) ? routerLink.join('/') : routerLink;
    const current = this.normalize(this.currentUrl());
    const target = this.normalize(path ?? '');
    return current === target || current.startsWith(`${target}/`);
  }

  private normalize(value: string): string {
    const withoutQuery = value.split('?')[0].split('#')[0];
    const prefixed = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
    return prefixed.length > 1 && prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
  }

  protected logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
