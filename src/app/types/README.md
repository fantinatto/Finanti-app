# 📄 Modelo de CV - Documentação Completa

Sistema completo de tipos TypeScript para criação de CVs profissionais seguindo o formato do LinkedIn.

## 📦 Estrutura de Arquivos

```
src/app/types/
├── cv.types.ts                  # ⚙️ Definições TypeScript (18 interfaces)
├── cv-helpers.ts                # 🛠️ Funções auxiliares e validators
├── cv-data-template.ts          # 📝 Template completo com exemplos
├── index.ts                     # 📤 Export centralizado
│
├── CV-MODEL-README.md           # 📖 Documentação principal do modelo
├── CV-EXAMPLES.md               # 💡 Exemplos práticos (4 perfis completos)
├── CV-HELPERS-GUIDE.md          # 🔧 Guia de uso dos helpers
└── README.md                    # 📚 Este arquivo (índice geral)
```

## 🚀 Quick Start

### 1. Criar seu CV

```typescript
// src/app/components/pages/cv/cv-data.ts
import { CvData } from '../../../types/cv.types';

export const CV_DATA: CvData = {
  hero: {
    name: 'Seu Nome',
    headline: 'Sua Profissão | Especialização'
  },
  
  about: {
    text: 'Sua história profissional...'
  },
  
  skills: [
    { name: 'JavaScript', endorsements: 50 },
    { name: 'TypeScript', endorsements: 35 }
  ],
  
  positions: [
    {
      title: 'Desenvolvedor Full Stack',
      company: 'Empresa XYZ',
      startDate: '2020-01',
      // ... outros campos
    }
  ]
  
  // ... outras seções
};
```

### 2. Usar no Componente

```typescript
import { Component } from '@angular/core';
import { CV_DATA } from './cv-data';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html'
})
export class CvComponent {
  data = CV_DATA;
}
```

### 3. Renderizar no Template

```html
<div class="cv-container">
  <!-- Hero -->
  <h1>{{ data.hero?.name }}</h1>
  <p>{{ data.hero?.headline }}</p>
  
  <!-- About -->
  <section *ngIf="data.about">
    <p>{{ data.about.text }}</p>
  </section>
  
  <!-- Skills -->
  <section *ngIf="data.skills">
    <div *ngFor="let skill of data.skills">
      {{ skill.name }}
      <span *ngIf="skill.endorsements">({{ skill.endorsements }})</span>
    </div>
  </section>
  
  <!-- Positions -->
  <section *ngIf="data.positions">
    <div *ngFor="let position of data.positions">
      <h3>{{ position.title }}</h3>
      <h4>{{ position.company }}</h4>
      <p>{{ position.description }}</p>
    </div>
  </section>
</div>
```

## 📋 Seções Disponíveis

| Seção | Obrigatória? | Descrição |
|-------|--------------|-----------|
| `hero` | ✅ Sim | Nome e headline profissional |
| `about` | ⚪ Não | Texto sobre você |
| `skills` | ⚪ Não | Competências com endorsements |
| `positions` | ⚪ Não | Experiência profissional |
| `education` | ⚪ Não | Formação acadêmica |
| `certifications` | ⚪ Não | Licenças e certificações |
| `projects` | ⚪ Não | Projetos destacados |
| `courses` | ⚪ Não | Cursos realizados |
| `volunteer` | ⚪ Não | Trabalho voluntário |
| `publications` | ⚪ Não | Artigos e papers |
| `patents` | ⚪ Não | Patentes |
| `awards` | ⚪ Não | Reconhecimentos e prêmios |
| `testScores` | ⚪ Não | Notas de provas |
| `languages` | ⚪ Não | Idiomas |
| `organizations` | ⚪ Não | Organizações |
| `featured` | ⚪ Não | Conteúdo em destaque |
| `contact` | ⚪ Não | Informações de contato |

## 📚 Documentação Detalhada

### 🎯 Para Começar
- **[CV-MODEL-README.md](./CV-MODEL-README.md)** - Estrutura completa de todos os campos e tipos

### 💡 Para Se Inspirar
- **[CV-EXAMPLES.md](./CV-EXAMPLES.md)** - 4 exemplos completos:
  - CV Sênior (12+ anos)
  - CV Júnior (recém-formado)
  - CV Freelancer (150+ projetos)
  - CV Acadêmico (PhD + publicações)

### 🔧 Para Desenvolver
- **[CV-HELPERS-GUIDE.md](./CV-HELPERS-GUIDE.md)** - Guia completo de funções auxiliares:
  - Validadores
  - Formatadores de data
  - Calculadores
  - Extractors
  - SEO helpers

## 🛠️ Funções Auxiliares

### Validação
```typescript
import { validateCvData } from '@/types/cv-helpers';

const validation = validateCvData(CV_DATA);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Formatação de Datas
```typescript
import { formatDateRange, formatDuration } from '@/types/cv-helpers';

formatDateRange('2020-01', '2023-12');  // 'Jan 2020 - Dez 2023'
formatDuration(14);                      // '1 ano e 2 meses'
```

### Calculadores
```typescript
import { 
  calculateTotalExperience,
  getTopSkills 
} from '@/types/cv-helpers';

const years = calculateTotalExperience(CV_DATA.positions);
const topSkills = getTopSkills(CV_DATA, 10);
```

### SEO
```typescript
import { 
  generateMetaDescription,
  generateKeywords 
} from '@/types/cv-helpers';

const description = generateMetaDescription(CV_DATA);
const keywords = generateKeywords(CV_DATA);
```

## 🎨 Interfaces Principais

### CvData (Raiz)
```typescript
interface CvData {
  hero?: { name: string; headline: string; profileImage?: string };
  about?: CvAbout;
  skills?: CvSkill[];
  positions?: CvPosition[];
  education?: CvEducation[];
  // ... 12 outras seções opcionais
}
```

### CvPosition
```typescript
interface CvPosition {
  title: string;
  company: string;
  startDate: string;                // YYYY-MM
  endDate?: string;                 // YYYY-MM ou omitir se atual
  employmentType?: string;          // Tempo integral, Freelance, etc.
  locationType?: string;            // Presencial, Remoto, Híbrido
  description?: string;
  skills?: string[];
  media?: CvMedia[];
}
```

### CvSkill
```typescript
interface CvSkill {
  name: string;
  endorsements?: number;            // Número de endorsements
}
```

Para todas as interfaces, consulte [cv.types.ts](./cv.types.ts)

## 📐 Formato de Dados

### Datas
- **Mês/Ano**: `YYYY-MM` (Ex: `2024-03`)
- **Data completa**: `YYYY-MM-DD` (Ex: `1990-05-15`)
- **Cargo atual**: Omitir `endDate`

### Referências de Usuários
Use `@username` para colaboradores, autores, inventores:
```typescript
contributors: ['@joao_silva', '@maria_santos']
authors: ['@seu_usuario', '@coautor']
```

### Mídia
```typescript
media: [
  {
    type: 'image' | 'video' | 'document' | 'link',
    url: string,
    title?: string,
    description?: string
  }
]
```

## 🔍 Casos de Uso

### Profissional Sênior
```typescript
✅ Hero + About + Skills (com endorsements)
✅ Positions (4-6 cargos com descrições detalhadas)
✅ Education + Certifications
✅ Projects (3-5 projetos principais)
✅ Awards + Featured
```

### Júnior / Recém-Formado
```typescript
✅ Hero + About
✅ Skills (foco em tecnologias aprendidas)
✅ Education (destaque para atividades extracurriculares)
✅ Projects (TCC + projetos pessoais)
✅ Courses (cursos online)
```

### Freelancer
```typescript
✅ Hero (destaque para "150+ projetos")
✅ About (foco em entrega e resultados)
✅ Skills (versatilidade)
✅ Projects (portfolio variado)
✅ TestScores (Upwork, etc)
```

### Acadêmico
```typescript
✅ Hero + About (foco em pesquisa)
✅ Positions (cargos acadêmicos)
✅ Education (todas as formações)
✅ Publications (papers em conferências)
✅ Awards (prêmios acadêmicos)
✅ Projects (projetos de pesquisa)
```

## ✨ Boas Práticas

### ✅ Faça
- Use números e métricas sempre que possível
- Destaque conquistas, não apenas responsabilidades
- Mantenha textos concisos e objetivos
- Adicione mídia quando relevante (screenshots, certificados)
- Use palavras-chave da sua área
- Revise regularmente (a cada 3-6 meses)

### ❌ Evite
- Textos muito longos e prolixos
- Listar responsabilidades sem contexto
- Informações desatualizadas
- Campos vazios ou incompletos
- Datas em formatos incorretos

## 🧪 Validação e Testes

### Validar seu CV
```typescript
import { validateCvData } from '@/types/cv-helpers';

const result = validateCvData(CV_DATA);

if (!result.valid) {
  console.error('Erros:', result.errors);
  // ['hero.name é obrigatório', 'positions[0].startDate formato inválido']
}
```

### Limpar dados antes de salvar
```typescript
import { sanitizeCvData } from '@/types/cv-helpers';

const cleanData = sanitizeCvData(CV_DATA);
// Remove null, undefined, strings vazias, arrays vazios
```

## 📦 Exportação

### JSON
```typescript
import { exportToJSON } from '@/types/cv-helpers';

const json = exportToJSON(CV_DATA);
// Salvar em arquivo ou enviar para API
```

## 🎯 Exemplos Práticos

Ver exemplos completos em [CV-EXAMPLES.md](./CV-EXAMPLES.md):
- ✨ CV Sênior com 12+ anos
- 🌱 CV Júnior recém-formado
- 💼 CV Freelancer com 150+ projetos
- 🎓 CV Acadêmico com PhD

## 🔗 Links Úteis

- **LinkedIn** - Referência para estrutura de perfis
- **cv.types.ts** - Definições TypeScript completas
- **cv-data-template.ts** - Template anotado com exemplos

## 📞 Suporte

Para dúvidas sobre implementação:
1. Consulte [CV-MODEL-README.md](./CV-MODEL-README.md) para estrutura
2. Veja [CV-EXAMPLES.md](./CV-EXAMPLES.md) para exemplos
3. Use [CV-HELPERS-GUIDE.md](./CV-HELPERS-GUIDE.md) para funções

## 🗂️ Changelog

### v1.0.0 (Novembro 2025)
- ✅ 18 interfaces TypeScript completas
- ✅ Sistema de validação integrado
- ✅ 20+ funções auxiliares
- ✅ Template completo anotado
- ✅ 4 exemplos práticos completos
- ✅ Documentação abrangente

---

**Mantido por**: Equipe de Desenvolvimento  
**Última atualização**: Novembro 2025  
**Versão**: 1.0.0
