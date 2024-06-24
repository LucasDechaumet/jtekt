import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenuModule, ToastModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  navList: MenuItem[] | undefined;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit() {
    if (this.keycloakService.hasRole('admin')) {
      this.navList = [
        {
          label: 'Outils',
          items: [
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-home',
              routerLink: 'dashboard',
            },
            {
              label: 'Graphiques',
              icon: 'pi pi-fw pi-chart-bar',
              routerLink: 'charts',
            },
          ],
        },
        {
          label: 'Profil',
          items: [
            {
              label: 'Paramètres',
              icon: 'pi pi-cog',
            },
            {
              label: 'Déconnexion',
              icon: 'pi pi-sign-out',
              command: () => {
                this.keycloakService.logout();
              },
            },
          ],
        },
      ];
    } else {
      this.navList = [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: 'dashboard',
        },
        {
          label: 'Déconnexion',
          icon: 'pi pi-sign-out',
          command: () => {
            this.keycloakService.logout();
          },
        },
      ];
    }
  }
}
