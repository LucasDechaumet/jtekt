import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { adminGuard } from './guards/admin.guard';
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
    path: 'charts',
    component: ChartsComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: DashboardComponent },
];
