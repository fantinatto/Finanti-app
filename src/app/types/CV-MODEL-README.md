# Modelo de CV - Estrutura LinkedIn

Este diretório contém a estrutura completa de tipos TypeScript para criação de CVs profissionais seguindo o formato do LinkedIn.

## 📁 Arquivos

- **`cv.types.ts`** - Definições de interfaces TypeScript
- **`cv-data-template.ts`** - Template completo com exemplos
- **`cv-data.ts`** - Seus dados de CV (use o template como referência)

## 🎯 Conceito

A estrutura foi projetada seguindo os princípios:

1. **Flexibilidade Total**: Todas as seções são opcionais
2. **LinkedIn-First**: Segue a mesma organização do LinkedIn
3. **Type-Safe**: TypeScript garante consistência dos dados
4. **Renderização Condicional**: Seções sem dados não aparecem

## 📋 Seções Disponíveis

### Obrigatórias
- ✅ **Hero** - Nome e headline profissional

### Opcionais (18 seções)
- 📝 **About** - Sobre você (texto livre)
- 🎯 **Skills** - Competências com endorsements
- 💼 **Positions** - Experiência profissional
- 🎓 **Education** - Formação acadêmica
- 🏆 **Certifications** - Licenças e certificações
- 🚀 **Projects** - Projetos destacados
- 📚 **Courses** - Cursos realizados
- 🤝 **Volunteer** - Trabalho voluntário
- 📄 **Publications** - Artigos e papers
- 💡 **Patents** - Patentes
- 🥇 **Awards** - Reconhecimentos e prêmios
- 📊 **Test Scores** - Notas de provas
- 🌍 **Languages** - Idiomas
- 🏢 **Organizations** - Organizações
- ⭐ **Featured** - Conteúdo em destaque (Bastidores)
- 📧 **Contact** - Informações de contato

## 🚀 Como Usar

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
  
  // ... adicione outras seções conforme necessário
};
```

### 2. Usar no componente

O componente `CvComponent` já está configurado para renderizar automaticamente todas as seções que tiverem dados.

```html
<!-- Renderização condicional automática -->
<section *ngIf="data.skills">
  <!-- Exibe apenas se houver skills -->
</section>
```

## 📐 Estrutura de Dados

### Hero (Obrigatório)
```typescript
hero: {
  name: string;           // Nome completo
  headline: string;       // Título profissional
  profileImage?: string;  // Foto de perfil (opcional)
}
```

### About (Texto sobre você)
```typescript
about: {
  text: string;  // Pode conter múltiplas linhas e parágrafos
}
```

### Skills (Competências)
```typescript
skills: [
  { 
    name: string;          // Nome da skill
    endorsements?: number  // Número de endorsements (opcional)
  }
]
```

### Positions (Experiência)
```typescript
positions: [
  {
    title: string;              // Cargo
    employmentType?: string;    // Tempo integral, Freelance, etc.
    company: string;            // Empresa
    startDate: string;          // YYYY-MM
    endDate?: string;           // YYYY-MM ou omitir se atual
    location?: string;          // Cidade, Estado
    locationType?: string;      // Presencial, Remoto, Híbrido
    description?: string;       // Descrição do cargo
    skills?: string[];          // Tecnologias utilizadas
    media?: CvMedia[];          // Imagens, vídeos, documentos
  }
]
```

### Education (Formação)
```typescript
education: [
  {
    institution: string;    // Universidade/Escola
    degree: string;         // Bacharelado, Mestrado, etc.
    fieldOfStudy: string;   // Área de estudo
    startDate: string;      // YYYY-MM
    endDate?: string;       // YYYY-MM
    grade?: string;         // Nota/GPA
    activities?: string[];  // Atividades extracurriculares
    skills?: string[];      // Competências adquiridas
    media?: CvMedia[];      // Diploma, certificados
  }
]
```

### Certifications (Certificações)
```typescript
certifications: [
  {
    name: string;                  // Nome da certificação
    issuingOrganization: string;   // Org. certificadora
    issueDate?: string;            // Data de emissão
    expirationDate?: string;       // Data de expiração
    credentialId?: string;         // ID da credencial
    credentialUrl?: string;        // Link de verificação
  }
]
```

### Projects (Projetos)
```typescript
projects: [
  {
    name: string;              // Nome do projeto
    description?: string;      // Descrição
    startDate?: string;        // YYYY-MM
    endDate?: string;          // YYYY-MM
    associatedWith?: string;   // Empresa relacionada
    skills?: string[];         // Tecnologias
    contributors?: string[];   // @username dos colaboradores
    media?: CvMedia[];         // Screenshots, demos
  }
]
```

### Courses (Cursos)
```typescript
courses: [
  {
    name: string;            // Nome do curso
    number?: string;         // Código do curso
    associatedWith?: string; // Instituição
    completionDate?: string; // YYYY-MM
  }
]
```

### Volunteer (Voluntariado)
```typescript
volunteer: [
  {
    organization: string;  // ONG/Organização
    role: string;          // Função
    cause?: string;        // Causa (Educação, Saúde, etc.)
    startDate?: string;    // YYYY-MM
    endDate?: string;      // YYYY-MM
    description?: string;  // Descrição das atividades
    media?: CvMedia[];     // Fotos, vídeos
  }
]
```

### Publications (Publicações)
```typescript
publications: [
  {
    title: string;              // Título
    publisher?: string;         // Journal/Conferência
    publicationDate?: string;   // YYYY-MM
    authors?: string[];         // @username dos autores
    url?: string;               // DOI ou link
    description?: string;       // Abstract
  }
]
```

### Patents (Patentes)
```typescript
patents: [
  {
    title: string;                    // Título
    patentNumber?: string;            // Número
    inventors?: string[];             // @username inventores
    status?: 'issued' | 'pending';    // Status
    issueDate?: string;               // YYYY-MM
    url?: string;                     // Link da patente
    description?: string;             // Descrição
  }
]
```

### Awards (Prêmios)
```typescript
awards: [
  {
    title: string;           // Nome do prêmio
    issuer?: string;         // Quem concedeu
    issueDate?: string;      // YYYY-MM
    associatedWith?: string; // Projeto/Empresa
    description?: string;    // Motivo
    media?: CvMedia[];       // Fotos, certificados
  }
]
```

### Test Scores (Notas de Provas)
```typescript
testScores: [
  {
    title: string;           // Nome da prova
    score?: string;          // Nota obtida
    testDate?: string;       // YYYY-MM
    associatedWith?: string; // Org. aplicadora
    description?: string;    // Detalhes
  }
]
```

### Languages (Idiomas)
```typescript
languages: [
  {
    language: string;       // Nome do idioma
    proficiency: string;    // Nível (Nativo, Avançado, etc.)
    duolingoScore?: number; // Score Duolingo (opcional)
  }
]
```

### Organizations (Organizações)
```typescript
organizations: [
  {
    name: string;              // Nome
    position?: string;         // Cargo
    startDate?: string;        // YYYY-MM
    endDate?: string;          // YYYY-MM
    associatedWith?: string;   // Entidade
    description?: string;      // Descrição
    achievements?: string[];   // Resultados
  }
]
```

### Featured (Em Destaque - Bastidores)
```typescript
featured: [
  {
    type: 'post' | 'article' | 'link' | 'media';
    title: string;        // Título
    url?: string;         // Link
    description?: string; // Descrição
    date?: string;        // YYYY-MM
    media?: CvMedia;      // Mídia relacionada
  }
]
```

### Contact (Contato)
```typescript
contact: {
  email?: string;              // Email
  phone?: string;              // Telefone
  phoneType?: string;          // Mobile, Work, Home
  website?: string;            // Site pessoal
  profileUrl?: string;         // LinkedIn, etc.
  address?: string;            // Endereço
  birthday?: string;           // YYYY-MM-DD
  instantMessaging?: [         // Redes sociais
    {
      platform: string;  // GitHub, Twitter, Discord
      handle: string;    // @usuario ou usuario#1234
    }
  ]
}
```

## 🎨 Tipos de Mídia

```typescript
media: [
  {
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    title?: string;
    description?: string;
  }
]
```

## 📅 Formato de Datas

- **Datas completas**: `YYYY-MM` (Ex: `2024-03`)
- **Aniversário**: `YYYY-MM-DD` (Ex: `1990-05-15`)
- **Cargo atual**: Omitir `endDate`

## 🔗 Referências de Usuários

Use `@username` para referenciar:
- Colaboradores em projetos
- Coautores em publicações
- Coinventores em patentes

Exemplo:
```typescript
contributors: ['@joao_silva', '@maria_santos']
```

## ✨ Boas Práticas

1. **Mantenha atualizado**: Revise seu CV regularmente
2. **Seja específico**: Use números e métricas
3. **Destaque resultados**: Foque em conquistas, não apenas responsabilidades
4. **Use palavras-chave**: Tecnologias e skills relevantes
5. **Seja conciso**: Textos claros e objetivos
6. **Adicione mídia**: Screenshots, certificados, fotos

## 🔍 Exemplo Mínimo

```typescript
export const CV_DATA: CvData = {
  hero: {
    name: 'João Silva',
    headline: 'Desenvolvedor Full Stack | React & Node.js'
  },
  
  about: {
    text: 'Desenvolvedor com 5 anos de experiência...'
  },
  
  skills: [
    { name: 'React' },
    { name: 'Node.js' }
  ]
};
```

## 📞 Suporte

Para dúvidas sobre a estrutura, consulte:
- `cv.types.ts` - Definições completas
- `cv-data-template.ts` - Exemplos de uso
- Documentação do LinkedIn para referência de campos

---

**Última atualização**: Novembro 2025
