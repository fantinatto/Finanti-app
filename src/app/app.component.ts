import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'finanti-app';
  year = new Date().getFullYear();

  userMenuOpen = false;
  mobileMenuOpen = false;
  indicadoresMenuOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private router: Router,
    public authService: AuthService,
  ) {
    translate.addLangs(['pt', 'en']);
    translate.setDefaultLang('pt');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/pt|en/) ? browserLang : 'pt');
  }

  ngOnInit() {
    this.authService.authState$.pipe(
      map(state => state.isAuthenticated),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.authService.signOut();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  toggleIndicadoresMenu(): void {
    this.indicadoresMenuOpen = !this.indicadoresMenuOpen;
  }

  closeIndicadoresMenu(): void {
    this.indicadoresMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.indicadoresMenuOpen = false;
  }

  get userInitial(): string {
    return this.authService.currentUser?.displayName?.charAt(0)?.toUpperCase() ?? '?';
  }

  get userName(): string {
    return this.authService.currentUser?.displayName ?? '';
  }

  get userEmail(): string {
    return this.authService.currentUser?.primaryEmail ?? '';
  }
}
