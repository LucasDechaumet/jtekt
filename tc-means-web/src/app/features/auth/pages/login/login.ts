import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { LoginRequest } from '../../models/login-request';
import { ToastService } from '../../../../core/services/toast-service';

const DEFAULT_LOGIN_LOGO = 'assets/images/jtekt_logo.png';
const DEFAULT_LOGIN_BACKGROUND = 'assets/images/jtekt_background.webp';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    FluidModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected readonly logoLogin = signal(DEFAULT_LOGIN_LOGO);
  protected readonly imageLogin = signal(DEFAULT_LOGIN_BACKGROUND);
  protected readonly appName = 'Tc Means';
  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly loginRequest: LoginRequest = {
    username: '',
    password: '',
  };

  login(): void {
    this.isLoading.set(true);
    this.authService.login(this.loginRequest).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/means']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.message === 'bad_credentials') {
          this.toastService.warn('Connexion échouée', "Nom d'utilisateur ou mot de passe invalide.");
        } else if (err.error?.message === 'account_expired') {
          this.toastService.warn('Connexion échouée', 'Votre compte a expiré.');
        } else {
          this.toastService.error(err.error?.errorId ?? 'inconnu');
        }
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword.update((value) => !value);
  }
}
