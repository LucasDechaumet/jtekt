import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

const canAccessAuthenticatedRoute = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const authGuard: CanActivateFn = canAccessAuthenticatedRoute;
export const authChildGuard: CanActivateChildFn = canAccessAuthenticatedRoute;
