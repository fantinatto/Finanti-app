import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface SignupForm {
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  passwordConfirm: FormControl<string>;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  signupForm: FormGroup<SignupForm>;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.signupForm = new FormGroup({
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)]
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
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

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('passwordConfirm');
    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async submitEmailSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { displayName, email, password } = this.signupForm.getRawValue();

    try {
      await firstValueFrom(this.authService.register(displayName, email, password));
      this.toastr.success(
        this.translate.instant('AUTH.SIGNUP_TITLE'),
        this.translate.instant('COMMON.SUCCESS')
      );
      this.router.navigate(['/auth/login']);
    } catch (err: any) {
      const msg = err?.error?.message || this.translate.instant('AUTH.OAUTH_ERROR');
      this.errorMessage = msg;
      this.toastr.error(msg, this.translate.instant('COMMON.ERROR'));
    } finally {
      this.isLoading = false;
    }
  }

  submit(): void {
    this.submitEmailSignup();
  }

  navigate(): void {
    this.router.navigate(['/auth/login']);
  }

  private markFormAsTouched(): void {
    Object.values(this.signupForm.controls).forEach(control => control.markAsTouched());
  }

  get displayNameError(): string | null {
    const c = this.signupForm.get('displayName');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED');
    if (c?.hasError('minlength') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_MIN_LENGTH');
    return null;
  }

  get emailError(): string | null {
    const c = this.signupForm.get('email');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED');
    if (c?.hasError('email') && c.touched) return this.translate.instant('AUTH.ERRORS.EMAIL_INVALID');
    return null;
  }

  get passwordError(): string | null {
    const c = this.signupForm.get('password');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_REQUIRED');
    if (c?.hasError('minlength') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_MIN_LENGTH');
    return null;
  }

  get passwordConfirmError(): string | null {
    const c = this.signupForm.get('passwordConfirm');
    if (c?.hasError('required') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORD_REQUIRED');
    if (c?.hasError('passwordMismatch') && c.touched) return this.translate.instant('AUTH.ERRORS.PASSWORDS_DONT_MATCH');
    return null;
  }
}
