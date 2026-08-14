import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ 
  providedIn: 'root' 
})
export class LanguageService {
  readonly availableLangs = ['pt', 'en'] as const;
  private currentLangSubject = new BehaviorSubject<string>('pt');
  
  // Observable para componentes se inscreverem
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) {
    // Inicializar com idioma salvo ou padrão
    const savedLang = localStorage.getItem('language') || 'pt';
    this.currentLangSubject.next(savedLang);
  }

  get currentLang(): string {
    return this.currentLangSubject.value;
  }

  switchTo(lang: 'pt' | 'en') {
    if (!this.availableLangs.includes(lang)) {
      console.warn(`Idioma ${lang} não é suportado`);
      return;
    }
    
    this.translate.use(lang);
    localStorage.setItem('language', lang);
    this.currentLangSubject.next(lang);
  }

  // Helper para obter flag do país
  getFlagEmoji(lang: string): string {
    switch (lang) {
      case 'pt': return '🇧🇷';
      case 'en': return '🇬🇧';
      default: return '🌍';
    }
  }

  // Helper para obter nome do idioma
  getLanguageName(lang: string): string {
    switch (lang) {
      case 'pt': return 'Português';
      case 'en': return 'English';
      default: return lang;
    }
  }
}