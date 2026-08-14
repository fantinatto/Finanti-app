import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { LegalRoutingModule } from './legal-routing.module';

import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { TermsComponent } from '../terms/terms.component';
import { ContactComponent } from '../contact/contact.component';

@NgModule({
  declarations: [
    PrivacyPolicyComponent,
    TermsComponent,
    ContactComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LegalRoutingModule,
  ],
})
export class LegalModule {}
