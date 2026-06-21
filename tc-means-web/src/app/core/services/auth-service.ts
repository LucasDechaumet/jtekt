import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { LoginRequest } from '../../features/auth/models/login-request';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'USER' | 'PDA';

export interface AuthMeResponse {
  username: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl ?? '';
  private readonly currentUser = signal<AuthMeResponse | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  login(body: LoginRequest): Observable<AuthMeResponse> {
    return this.http
      .post<void>(this.endpoint('/auth/login'), body, { withCredentials: true })
      .pipe(switchMap(() => this.me()));
  }

  me(): Observable<AuthMeResponse> {
    return this.http
      .get<AuthMeResponse>(this.endpoint('/auth/me'), { withCredentials: true })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  loadMe(): Observable<AuthMeResponse | null> {
    return this.me().pipe(
      catchError(() => {
        this.clearMe();
        return of(null);
      }),
    );
  }

  clearMe(): void {
    this.currentUser.set(null);
  }

  logout(): Observable<void> {
    return this.http.post<void>(this.endpoint('/auth/logout'), {}, { withCredentials: true }).pipe(
      catchError(() => of(undefined)),
      tap(() => this.clearMe()),
      map(() => undefined),
    );
  }

  private endpoint(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}
