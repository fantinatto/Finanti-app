import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface ResetForm {
  password: FormControl<string>;
  passwordConfirm: FormControl<string>;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  resetForm: FormGroup<ResetForm>;
  isLoading = false;
  done = false;
  errorMessage: string | null = null;
  token: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.resetForm = new FormGroup({
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)]
      }),
      passwordConfirm: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.errorMessage = this.translate.instant('AUTH.RESET_INVALID_LINK');
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('passwordConfirm');
    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async submit(): Promise<void> {
    if (!this.token || this.resetForm.invalid) {
      Object.values(this.resetForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { password } = this.resetForm.getRawValue();

    try {
      await firstValueFrom(this.authService.resetPassword(this.token, password));
      this.done = true;
      this.toastr.success(this.translate.instant('AUTH.RESET_SUCCESS'));
    } catch (err: any) {
      this.errorMessage = err?.error?.message || this.translate.instant('AUTH.ERRORS.GENERIC');
    } finally {
      this.isLoading = false;
    }
  }

  get passwordError(): string | null {
    const c = this.resetForm.controls.password;
    if (c.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_REQUIRED');
    if (c.hasError('minlength') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_MIN_LENGTH');
    return null;
  }

  get passwordConfirmError(): string | null {
    const c = this.resetForm.controls.passwordConfirm;
    if (c.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_REQUIRED');
    if (c.hasError('passwordMismatch') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORDS_DONT_MATCH');
    return null;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
