import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { adminGuard } from './core/guards/admin.guard';
import { authChildGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'means',
    pathMatch: 'full',
  },
  {
    title: 'Login',
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        title: 'Moyens',
        path: 'means',
        loadComponent: () => import('./features/means/pages/means/means').then((m) => m.Means),
      },
      {
        title: 'Graphiques',
        path: 'charts',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/charts/pages/charts/charts').then((m) => m.Charts),
      },
      {
        title: 'Erreur',
        path: 'error',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/error/pages/error/error').then((m) => m.ErrorPage),
      },
      {
        title: 'Utilisateurs',
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/pages/users/users').then((m) => m.Users),
      },
    ],
  },
  {
    path: '**',
    title: 'Not Found',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
