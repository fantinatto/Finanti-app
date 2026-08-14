# 🗺️ Mapa Visual da Estrutura do CV

Visualização hierárquica completa do modelo de CV.

```
CvData (Raiz)
│
├── 🎯 hero (OBRIGATÓRIO)
│   ├── name: string
│   ├── headline: string
│   └── profileImage?: string
│
├── 📝 about?
│   └── text: string
│
├── 🎯 skills? []
│   ├── name: string
│   └── endorsements?: number
│
├── 💼 positions? []
│   ├── title: string
│   ├── employmentType?: string ("Tempo integral", "Freelance", etc.)
│   ├── company: string
│   ├── startDate: string (YYYY-MM)
│   ├── endDate?: string (YYYY-MM)
│   ├── location?: string
│   ├── locationType?: string ("Presencial", "Remoto", "Híbrido")
│   ├── description?: string
│   ├── profileHeadline?: string
│   ├── skills?: string[]
│   └── media?: CvMedia[]
│
├── 🎓 education? []
│   ├── institution: string
│   ├── degree: string ("Bacharelado", "Mestrado", etc.)
│   ├── fieldOfStudy: string
│   ├── startDate: string (YYYY-MM)
│   ├── endDate?: string (YYYY-MM)
│   ├── grade?: string
│   ├── activities?: string[]
│   ├── skills?: string[]
│   └── media?: CvMedia[]
│
├── 🏆 certifications? []
│   ├── name: string
│   ├── issuingOrganization: string
│   ├── issueDate?: string (YYYY-MM)
│   ├── expirationDate?: string (YYYY-MM)
│   ├── credentialId?: string
│   └── credentialUrl?: string
│
├── 🚀 projects? []
│   ├── name: string
│   ├── description?: string
│   ├── skills?: string[]
│   ├── media?: CvMedia[]
│   ├── startDate?: string (YYYY-MM)
│   ├── endDate?: string (YYYY-MM)
│   ├── contributors?: string[] (@username)
│   └── associatedWith?: string
│
├── 📚 courses? []
│   ├── name: string
│   ├── number?: string
│   ├── associatedWith?: string
│   └── completionDate?: string (YYYY-MM)
│
├── 🤝 volunteer? []
│   ├── organization: string
│   ├── role: string
│   ├── cause?: string
│   ├── startDate?: string (YYYY-MM)
│   ├── endDate?: string (YYYY-MM)
│   ├── description?: string
│   └── media?: CvMedia[]
│
├── 📄 publications? []
│   ├── title: string
│   ├── publisher?: string
│   ├── publicationDate?: string (YYYY-MM)
│   ├── authors?: string[] (@username)
│   ├── url?: string
│   └── description?: string
│
├── 💡 patents? []
│   ├── title: string
│   ├── patentNumber?: string
│   ├── inventors?: string[] (@username)
│   ├── status?: "issued" | "pending"
│   ├── issueDate?: string (YYYY-MM)
│   ├── url?: string
│   └── description?: string
│
├── 🥇 awards? []
│   ├── title: string
│   ├── associatedWith?: string
│   ├── issuer?: string
│   ├── issueDate?: string (YYYY-MM)
│   ├── description?: string
│   └── media?: CvMedia[]
│
├── 📊 testScores? []
│   ├── title: string
│   ├── associatedWith?: string
│   ├── score?: string
│   ├── testDate?: string (YYYY-MM)
│   └── description?: string
│
├── 🌍 languages? []
│   ├── language: string
│   ├── proficiency: string
│   └── duolingoScore?: number
│
├── 🏢 organizations? []
│   ├── name: string
│   ├── position?: string
│   ├── associatedWith?: string
│   ├── startDate?: string (YYYY-MM)
│   ├── endDate?: string (YYYY-MM)
│   ├── description?: string
│   └── achievements?: string[]
│
├── ⭐ featured? [] (Bastidores)
│   ├── type: "post" | "article" | "link" | "media"
│   ├── title: string
│   ├── url?: string
│   ├── description?: string
│   ├── media?: CvMedia
│   └── date?: string (YYYY-MM)
│
└── 📧 contact?
    ├── profileUrl?: string
    ├── email?: string
    ├── phone?: string
    ├── phoneType?: string
    ├── address?: string
    ├── birthday?: string (YYYY-MM-DD)
    ├── website?: string
    └── instantMessaging?: []
        ├── platform: string
        └── handle: string
```

## 🔧 Tipo Auxiliar: CvMedia

```
CvMedia
├── type: "image" | "video" | "document" | "link"
├── url: string
├── title?: string
└── description?: string
```

## 📊 Estatísticas do Modelo

| Métrica | Valor |
|---------|-------|
| Total de Interfaces | 18 |
| Campos Obrigatórios | 2 (hero.name, hero.headline) |
| Seções Opcionais | 17 |
| Campos com Array | 15 |
| Campos com Enum | 3 |
| Campos com Username | 3 |
| Campos com Mídia | 5 |

## 🎨 Fluxo de Dados

```
┌─────────────────────────────────────────────────┐
│         cv-data.ts (Seus Dados)                 │
│                                                 │
│  export const CV_DATA: CvData = {               │
│    hero: { ... },                               │
│    about: { ... },                              │
│    skills: [ ... ],                             │
│    ...                                          │
│  }                                              │
└────────────────┬────────────────────────────────┘
                 │
                 │ import
                 ▼
┌─────────────────────────────────────────────────┐
│      cv.component.ts (Componente)               │
│                                                 │
│  export class CvComponent {                     │
│    data = CV_DATA;                              │
│                                                 │
│    // Helpers                                   │
│    totalYears = calculateTotalExperience(...)   │
│    topSkills = getTopSkills(...)                │
│  }                                              │
└────────────────┬────────────────────────────────┘
                 │
                 │ render
                 ▼
┌─────────────────────────────────────────────────┐
│      cv.component.html (Template)               │
│                                                 │
│  <div *ngIf="data.hero">                        │
│    <h1>{{ data.hero.name }}</h1>                │
│  </div>                                         │
│                                                 │
│  <div *ngIf="data.positions">                   │
│    <div *ngFor="let pos of data.positions">     │
│      ...                                        │
│    </div>                                       │
│  </div>                                         │
└─────────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida dos Dados

```
1. Criação
   cv-data.ts → Definir dados seguindo cv.types.ts

2. Validação
   validateCvData(CV_DATA) → Verificar estrutura

3. Sanitização
   sanitizeCvData(CV_DATA) → Limpar campos vazios

4. Renderização
   cv.component.html → Exibir com *ngIf condicional

5. SEO
   generateMetaDescription() → Meta tags
   generateKeywords() → Keywords

6. Export
   exportToJSON() → Backup/API
```

## 📈 Níveis de Complexidade

### Mínimo Viável (Iniciante)
```
✅ hero
✅ about
✅ skills (3-5 items)
```

### Padrão (Intermediário)
```
✅ hero
✅ about
✅ skills (8-12 items)
✅ positions (2-4 items)
✅ education (1-2 items)
✅ contact
```

### Completo (Avançado)
```
✅ hero
✅ about
✅ skills (10-15 items)
✅ positions (4-6 items)
✅ education (1-3 items)
✅ certifications (3-5 items)
✅ projects (3-5 items)
✅ courses (5-10 items)
✅ languages
✅ contact
```

### LinkedIn Full (Profissional)
```
✅ Todas as 18 seções preenchidas
✅ Mídia em positions, projects, awards
✅ Contributors em projects
✅ Endorsements em skills
✅ Featured content
```

## 🎯 Prioridades por Seção

| Prioridade | Seção | Essencial para |
|------------|-------|----------------|
| 🔴 Alta | hero, about, skills | Todos os perfis |
| 🟡 Média | positions, education, contact | Profissionais |
| 🟢 Baixa | certifications, projects, courses | Diferenciação |
| ⚪ Opcional | volunteer, publications, awards | Extras |
| ⚫ Raro | patents, testScores, organizations | Específico |

## 🗂️ Organização Recomendada

### Ordem de Exibição no CV
```
1. Hero (Topo fixo)
2. About (Primeira impressão)
3. Skills (Principais competências)
4. Positions (Experiência cronológica)
5. Education (Formação)
6. Certifications (Certificados)
7. Projects (Portfolio)
8. Featured (Destaque especial)
9. Awards (Reconhecimentos)
10. Publications (Se aplicável)
11. Courses (Desenvolvimento)
12. Volunteer (Engajamento)
13. Languages (Internacional)
14. Contact (Final/Sidebar)
```

## 💾 Tamanho Estimado dos Dados

| Perfil | Campos Preenchidos | JSON Size | Load Time |
|--------|-------------------|-----------|-----------|
| Mínimo | 3 seções | ~1 KB | Instantâneo |
| Padrão | 6 seções | ~5 KB | Instantâneo |
| Completo | 10 seções | ~15 KB | < 50ms |
| Full LinkedIn | 18 seções + mídia | ~50 KB | < 100ms |

## 🔍 Índice de Campos Searchable

Campos recomendados para busca/filtro:

```typescript
Searchable Fields:
├── hero.name
├── hero.headline
├── skills[].name
├── positions[].title
├── positions[].company
├── positions[].skills[]
├── education[].institution
├── education[].fieldOfStudy
├── certifications[].name
└── projects[].name
```

---

**Última atualização**: Novembro 2025
