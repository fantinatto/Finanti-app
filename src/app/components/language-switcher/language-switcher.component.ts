import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {

  constructor(public langService: LanguageService) {}

  setLang(lang: 'pt' | 'en') {
    this.langService.switchTo(lang);
  }

  isActive(lang: string): boolean {
    return this.langService.currentLang === lang;
  }
}
