import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset, palette } from '@primeuix/themes';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './core/services/auth-service';

const DEFAULT_PRIMARY_COLOR = '#e60111';
const DEFAULT_SECONDARY_COLOR = '#424242';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: palette(DEFAULT_PRIMARY_COLOR),
    colorScheme: {
      light: {
        formField: {
          borderColor: '{primary.color}',
          hoverBorderColor: '{primary.color}',
          focusBorderColor: '{primary.color}',
        },
      },
    },
    extend: {
      secondary: { color: DEFAULT_SECONDARY_COLOR },
    },
  },
  components: {
    menubar: {
      item: {
        color: '{primary.color}',
        focusColor: '{primary.color}',
        activeColor: '{primary.color}',
        icon: {
          color: '{primary.color}',
          focusColor: '{primary.color}',
          activeColor: '{primary.color}',
        },
      },
      submenu: {
        icon: {
          color: '{primary.color}',
          focusColor: '{primary.color}',
          activeColor: '{primary.color}',
        },
      },
      css: ({ dt }) => `
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content:hover {
          background: ${dt('primary.color')};
          border-radius: 8px;
        }
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content .p-menubar-item-label,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-item-label,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content .p-menubar-item-icon,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-item-icon,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content .p-menubar-submenu-icon,
        .p-menubar-item.appbar-item-active:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-submenu-icon {
          color: #ffffff;
        }
      `,
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    MessageService,
    provideHttpClient(),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).loadMe())),
  ],
};
