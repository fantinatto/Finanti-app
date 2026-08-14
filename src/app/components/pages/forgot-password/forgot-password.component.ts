import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface ForgotForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  forgotForm: FormGroup<ForgotForm>;
  isLoading = false;
  sent = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.forgotForm = new FormGroup({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      })
    });
  }

  async submit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.controls.email.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email } = this.forgotForm.getRawValue();

    try {
      await firstValueFrom(this.authService.forgotPassword(email));
      this.sent = true;
    } catch (err: any) {
      this.errorMessage = err?.error?.message || this.translate.instant('AUTH.ERRORS.GENERIC');
    } finally {
      this.isLoading = false;
    }
  }

  get emailError(): string | null {
    const control = this.forgotForm.controls.email;
    if (control.hasError('required') && control.touched) {
      return this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED');
    }
    if (control.hasError('email') && control.touched) {
      return this.translate.instant('AUTH.ERRORS.EMAIL_INVALID');
    }
    return null;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
