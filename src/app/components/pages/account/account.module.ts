import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';

import { AccountSettingsComponent } from '../account-settings/account-settings.component';

@NgModule({
  declarations: [
    AccountSettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AccountRoutingModule,
  ],
})
export class AccountModule {}
