import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { DefaultLoginLayoutComponent } from '../components/default-login-layout/default-login-layout.component';
import { PrimaryInputComponent } from '../components/primary-input/primary-input.component';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';
import { AdsComponent } from './components/ads/ads.component';
import { VideoAdComponent } from './components/video-ad/video-ad.component';
import { LoadingSpinnerComponent } from './components/loading/loading-spinner.component';
import { HasFeatureDirective } from '../directives/has-feature.directive';
import { CanPipe } from '../pipes/can.pipe';

@NgModule({
  declarations: [
    DefaultLoginLayoutComponent,
    PrimaryInputComponent,
    LanguageSwitcherComponent,
    AdsComponent,
    VideoAdComponent,
    LoadingSpinnerComponent,
    HasFeatureDirective,
    CanPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    DefaultLoginLayoutComponent,
    PrimaryInputComponent,
    LanguageSwitcherComponent,
    AdsComponent,
    VideoAdComponent,
    LoadingSpinnerComponent,
    HasFeatureDirective,
    CanPipe,
  ],
})
export class SharedModule {}
