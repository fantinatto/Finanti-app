import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { TermsComponent } from '../terms/terms.component';
import { ContactComponent } from '../contact/contact.component';

const routes: Routes = [
  { path: 'privacidade', component: PrivacyPolicyComponent },
  { path: 'termos', component: TermsComponent },
  { path: 'contato', component: ContactComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule {}
