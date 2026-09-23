import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup<LoginForm>;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      })
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  async submitEmailLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.getRawValue();

    try {
      await firstValueFrom(this.authService.login(email, password));
      this.router.navigate(['/ranking']);
    } catch (err: any) {
      const msg = err?.error?.message || this.translate.instant('AUTH.OAUTH_ERROR');
      this.errorMessage = msg;
      this.toastr.error(msg, this.translate.instant('COMMON.ERROR'));
    } finally {
      this.isLoading = false;
    }
  }

  onNavigate(): void {
    this.router.navigate(['/signup']);
  }

  private markFormAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => control.markAsTouched());
  }

  get emailError(): string | null {
    const c = this.loginForm.get('email');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED');
    if (c?.hasError('email') && c.touched) return this.translate.instant('AUTH.ERRORS.EMAIL_INVALID');
    return null;
  }

  get passwordError(): string | null {
    const c = this.loginForm.get('password');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_REQUIRED');
    if (c?.hasError('minlength') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_MIN_LENGTH');
    return null;
  }
}
