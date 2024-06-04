import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { adminGuard } from './guards/admin.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HistoryMeanComponent } from './components/history-mean/history-mean.component';
import { ChartsComponent } from './components/charts/charts.component';

export const routes: Routes = [
  {
    path: 'history/:meanNumber',
    component: HistoryMeanComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'toolbar',
    component: ToolbarComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'charts',
    component: ChartsComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
