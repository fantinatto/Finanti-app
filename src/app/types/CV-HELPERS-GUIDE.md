# Guia de Uso dos Helpers de CV

Este documento demonstra como usar as funções auxiliares para trabalhar com dados de CV.

## 📦 Importação

```typescript
import {
  // Validators
  validateCvData,
  isValidMonthDate,
  isValidFullDate,
  
  // Date Formatters
  formatMonthDate,
  formatDateRange,
  calculateDurationInMonths,
  formatDuration,
  
  // Data Calculators
  calculateTotalExperience,
  getTopSkills,
  getAllTechnologies,
  
  // Data Extractors
  getCurrentPosition,
  getHighestEducation,
  getActiveCertifications,
  
  // SEO Helpers
  generateMetaDescription,
  generateKeywords,
  
  // Export Utilities
  exportToJSON,
  sanitizeCvData
} from '@/types/cv-helpers';
```

## 🔍 Validators

### validateCvData()
Valida estrutura completa do CV.

```typescript
import { CV_DATA } from './cv-data';
import { validateCvData } from '@/types/cv-helpers';

const validation = validateCvData(CV_DATA);

if (!validation.valid) {
  console.error('Erros encontrados:', validation.errors);
  // ['hero.name é obrigatório', 'positions[0].startDate formato inválido']
} else {
  console.log('CV válido! ✅');
}
```

### isValidMonthDate()
Valida formato YYYY-MM.

```typescript
isValidMonthDate('2024-03');  // true
isValidMonthDate('2024-13');  // false (mês inválido)
isValidMonthDate('24-03');    // false (ano com 2 dígitos)
```

### isValidFullDate()
Valida formato YYYY-MM-DD.

```typescript
isValidFullDate('2024-03-15');  // true
isValidFullDate('2024-02-30');  // false (data inexistente)
```

## 📅 Date Formatters

### formatMonthDate()
Formata data para exibição.

```typescript
formatMonthDate('2024-03', 'pt');  // 'Mar 2024'
formatMonthDate('2024-03', 'en');  // 'Mar 2024'
formatMonthDate('2024-12', 'pt');  // 'Dez 2024'
```

### formatDateRange()
Formata período de datas.

```typescript
// Com data de término
formatDateRange('2020-01', '2023-12', 'pt');  // 'Jan 2020 - Dez 2023'
formatDateRange('2020-01', '2023-12', 'en');  // 'Jan 2020 - Dec 2023'

// Sem data de término (atual)
formatDateRange('2020-01', undefined, 'pt');  // 'Jan 2020 - Atual'
formatDateRange('2020-01', undefined, 'en');  // 'Jan 2020 - Present'
```

### calculateDurationInMonths()
Calcula duração em meses.

```typescript
calculateDurationInMonths('2020-01', '2021-01');  // 13 meses
calculateDurationInMonths('2020-01', '2020-12');  // 12 meses
calculateDurationInMonths('2024-01');             // Até hoje
```

### formatDuration()
Formata duração em texto.

```typescript
formatDuration(1, 'pt');   // '1 mês'
formatDuration(12, 'pt');  // '1 ano'
formatDuration(14, 'pt');  // '1 ano e 2 meses'
formatDuration(30, 'pt');  // '2 anos e 6 meses'

formatDuration(14, 'en');  // '1 year and 2 months'
```

## 🧮 Data Calculators

### calculateTotalExperience()
Calcula anos totais de experiência.

```typescript
const years = calculateTotalExperience(CV_DATA.positions!);
console.log(`${years}+ anos de experiência`);  // '11+ anos de experiência'
```

**Uso no componente:**
```typescript
@Component({
  selector: 'app-cv',
  template: `
    <div class="stat-item">
      <span class="stat-value">{{ totalExperience }}+</span>
      <span class="stat-label">Anos de experiência</span>
    </div>
  `
})
export class CvComponent {
  data = CV_DATA;
  totalExperience = calculateTotalExperience(this.data.positions || []);
}
```

### getTopSkills()
Retorna skills ordenadas por endorsements.

```typescript
const topSkills = getTopSkills(CV_DATA, 5);
// [
//   { name: 'SAP ABAP', endorsements: 45 },
//   { name: 'SAP S/4HANA', endorsements: 38 },
//   { name: 'SAP CPI', endorsements: 32 },
//   { name: 'SAP Fiori', endorsements: 28 },
//   { name: 'SAPUI5', endorsements: 25 }
// ]
```

**Uso no componente:**
```typescript
@Component({
  template: `
    <div class="top-skills">
      <span *ngFor="let skill of topSkills" class="skill-badge">
        {{ skill.name }}
        <span class="endorsements">{{ skill.endorsements }}</span>
      </span>
    </div>
  `
})
export class SkillsComponent {
  topSkills = getTopSkills(CV_DATA, 10);
}
```

### getAllTechnologies()
Lista todas as tecnologias únicas.

```typescript
const allTechs = getAllTechnologies(CV_DATA.positions!);
// ['ABAP', 'Angular', 'AWS', 'Azure', 'CPI', 'Docker', ...]
```

## 📊 Data Extractors

### getCurrentPosition()
Extrai cargo atual.

```typescript
const currentJob = getCurrentPosition(CV_DATA);

if (currentJob) {
  console.log(`${currentJob.title} @ ${currentJob.company}`);
  // 'Consultor SAP ABAP Especialista @ Cast Group'
}
```

**Uso no componente:**
```typescript
@Component({
  template: `
    <div *ngIf="currentPosition" class="current-job">
      <h3>{{ currentPosition.title }}</h3>
      <p>{{ currentPosition.company }}</p>
    </div>
  `
})
export class HeroComponent {
  currentPosition = getCurrentPosition(CV_DATA);
}
```

### getHighestEducation()
Extrai formação mais alta.

```typescript
const education = getHighestEducation(CV_DATA);

if (education) {
  console.log(`${education.degree} em ${education.fieldOfStudy}`);
  // 'Bacharelado em Engenharia de Computação'
}
```

### getActiveCertifications()
Lista certificações não expiradas.

```typescript
const activeCerts = getActiveCertifications(CV_DATA);
console.log(`${activeCerts.length} certificações ativas`);
```

## 🔎 SEO Helpers

### generateMetaDescription()
Gera description para meta tags.

```typescript
const metaDescription = generateMetaDescription(CV_DATA);
// 'Consultor SAP ABAP Especialista | S/4HANA & Integrações | 11+ anos | 
//  Consultor SAP ABAP Especialista @ Cast Group | 11+ anos de experiência'
```

**Uso no componente:**
```typescript
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cv'
})
export class CvComponent implements OnInit {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit() {
    const description = generateMetaDescription(CV_DATA);
    
    this.title.setTitle(`${CV_DATA.hero?.name} - CV Profissional`);
    this.meta.updateTag({ name: 'description', content: description });
  }
}
```

### generateKeywords()
Gera keywords para SEO.

```typescript
const keywords = generateKeywords(CV_DATA);
// ['Vinícius Fantinatto', 'SAP ABAP', 'S/4HANA', 'Angular', 'CPI', ...]
```

**Uso no componente:**
```typescript
ngOnInit() {
  const keywords = generateKeywords(CV_DATA);
  this.meta.updateTag({ 
    name: 'keywords', 
    content: keywords.join(', ') 
  });
}
```

## 💾 Export Utilities

### exportToJSON()
Exporta CV em JSON formatado.

```typescript
const jsonCV = exportToJSON(CV_DATA);
console.log(jsonCV);
// JSON formatado com indentação
```

**Botão de download:**
```typescript
downloadCV() {
  const json = exportToJSON(CV_DATA);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cv-data.json';
  a.click();
  
  window.URL.revokeObjectURL(url);
}
```

### sanitizeCvData()
Remove campos vazios antes de salvar.

```typescript
const cleanData = sanitizeCvData(CV_DATA);
// Remove null, undefined, strings vazias, arrays vazios
```

## 🎯 Exemplos Completos

### Componente de Timeline com Duração

```typescript
@Component({
  selector: 'app-timeline',
  template: `
    <div *ngFor="let position of positions" class="timeline-item">
      <h3>{{ position.title }}</h3>
      <p>{{ position.company }}</p>
      <span class="date-range">
        {{ formatDateRange(position.startDate, position.endDate) }}
      </span>
      <span class="duration">
        ({{ getDuration(position) }})
      </span>
    </div>
  `
})
export class TimelineComponent {
  positions = CV_DATA.positions || [];
  
  formatDateRange = formatDateRange;
  
  getDuration(position: CvPosition): string {
    const months = calculateDurationInMonths(
      position.startDate,
      position.endDate
    );
    return formatDuration(months, 'pt');
  }
}
```

### Dashboard de Estatísticas

```typescript
@Component({
  selector: 'app-stats-dashboard',
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="value">{{ totalYears }}+</span>
        <span class="label">Anos de Experiência</span>
      </div>
      
      <div class="stat-card">
        <span class="value">{{ totalProjects }}</span>
        <span class="label">Projetos</span>
      </div>
      
      <div class="stat-card">
        <span class="value">{{ activeCerts }}</span>
        <span class="label">Certificações Ativas</span>
      </div>
      
      <div class="stat-card">
        <span class="value">{{ topSkillsCount }}</span>
        <span class="label">Skills Principais</span>
      </div>
    </div>
  `
})
export class StatsDashboardComponent {
  data = CV_DATA;
  
  totalYears = calculateTotalExperience(this.data.positions || []);
  totalProjects = this.data.projects?.length || 0;
  activeCerts = getActiveCertifications(this.data).length;
  topSkillsCount = getTopSkills(this.data, 10).length;
}
```

### Validação no Submit de Formulário

```typescript
@Component({
  selector: 'app-cv-form'
})
export class CvFormComponent {
  cvForm: FormGroup;
  
  onSubmit() {
    const formData: CvData = this.cvForm.value;
    
    // Validar antes de salvar
    const validation = validateCvData(formData);
    
    if (!validation.valid) {
      this.showErrors(validation.errors);
      return;
    }
    
    // Limpar dados antes de salvar
    const cleanData = sanitizeCvData(formData);
    
    // Salvar no backend
    this.cvService.save(cleanData).subscribe(
      () => this.showSuccess(),
      error => this.showError(error)
    );
  }
  
  showErrors(errors: string[]) {
    errors.forEach(error => {
      this.toastr.error(error, 'Erro de Validação');
    });
  }
}
```

## 🧪 Testes

### Teste de Validação

```typescript
describe('CV Validators', () => {
  it('should validate correct date format', () => {
    expect(isValidMonthDate('2024-03')).toBe(true);
    expect(isValidMonthDate('2024-13')).toBe(false);
  });
  
  it('should calculate duration correctly', () => {
    const duration = calculateDurationInMonths('2020-01', '2021-01');
    expect(duration).toBe(13);
  });
  
  it('should validate CV data structure', () => {
    const mockData: CvData = {
      hero: {
        name: 'Test User',
        headline: 'Developer'
      }
    };
    
    const result = validateCvData(mockData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

---

**Última atualização**: Novembro 2025
