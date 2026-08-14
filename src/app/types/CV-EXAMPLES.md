# Exemplos Práticos de Uso do Modelo de CV

Este documento apresenta exemplos práticos e reais de como preencher cada seção do CV.

## 📚 Índice de Exemplos

1. [CV Completo - Profissional Sênior](#cv-completo-profissional-senior)
2. [CV Júnior - Recém-Formado](#cv-junior-recem-formado)
3. [CV Freelancer](#cv-freelancer)
4. [CV Acadêmico](#cv-academico)

---

## CV Completo - Profissional Sênior

Exemplo de um profissional com 10+ anos de experiência:

```typescript
import { CvData } from '../../../types/cv.types';

export const CV_DATA: CvData = {
  hero: {
    name: 'Ana Paula Silva',
    headline: 'Tech Lead Full Stack | React • Node.js • AWS | 12+ anos',
    profileImage: '/assets/profile.jpg'
  },

  about: {
    text: `Tech Lead com 12 anos de experiência liderando times de desenvolvimento em produtos digitais de alto impacto.

Especialista em arquitetura de microsserviços, cloud computing (AWS) e desenvolvimento full stack com React e Node.js.

Apaixonada por mentoria técnica e cultura DevOps. Já liderei times de até 15 desenvolvedores em projetos que atendem milhões de usuários.

Busco constantemente inovação e excelência técnica, sempre focando na entrega de valor ao negócio.`
  },

  skills: [
    { name: 'React', endorsements: 87 },
    { name: 'Node.js', endorsements: 75 },
    { name: 'TypeScript', endorsements: 68 },
    { name: 'AWS', endorsements: 52 },
    { name: 'Docker', endorsements: 45 },
    { name: 'Kubernetes', endorsements: 38 },
    { name: 'GraphQL', endorsements: 35 },
    { name: 'Liderança Técnica', endorsements: 62 },
    { name: 'Arquitetura de Software', endorsements: 48 },
    { name: 'CI/CD', endorsements: 40 }
  ],

  positions: [
    {
      title: 'Tech Lead',
      employmentType: 'Tempo integral',
      company: 'Nubank',
      startDate: '2021-03',
      location: 'São Paulo, SP, Brasil',
      locationType: 'Remoto',
      description: `Liderança técnica de squad de 12 desenvolvedores no produto de cartão de crédito.

• Arquitetura e implementação de microsserviços escaláveis (Node.js + Kotlin)
• Redução de 40% no tempo de deploy com pipelines CI/CD otimizados
• Mentoria técnica para 5 desenvolvedores júnior/pleno
• Code review e garantia de qualidade de código
• Migração de monolito para arquitetura de microsserviços (+ 50 serviços)
• Implementação de observabilidade com Datadog e New Relic`,
      skills: ['Node.js', 'React', 'Kotlin', 'AWS', 'Kubernetes', 'Terraform', 'GraphQL', 'PostgreSQL']
    },
    {
      title: 'Senior Full Stack Developer',
      employmentType: 'Tempo integral',
      company: 'iFood',
      startDate: '2018-01',
      endDate: '2021-02',
      location: 'São Paulo, SP, Brasil',
      locationType: 'Híbrido',
      description: `Desenvolvimento de features críticas para o app de delivery.

• Desenvolvimento de sistema de recomendação de restaurantes (ML + React)
• Otimização de performance: redução de 60% no tempo de carregamento
• Implementação de testes automatizados (cobertura de 85%)
• Participação ativa em arquitetura de soluções`,
      skills: ['React', 'Node.js', 'Python', 'MongoDB', 'Redis', 'Docker', 'AWS Lambda']
    }
  ],

  education: [
    {
      institution: 'Universidade de São Paulo (USP)',
      degree: 'Bacharelado',
      fieldOfStudy: 'Ciência da Computação',
      startDate: '2009-02',
      endDate: '2013-12',
      grade: '8.7',
      activities: [
        'Iniciação Científica em Machine Learning (2011-2013)',
        'Monitoria de Algoritmos e Estruturas de Dados',
        'Membro da USPCodeLab'
      ],
      skills: ['Java', 'C++', 'Python', 'Algoritmos', 'IA', 'Banco de Dados']
    }
  ],

  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuingOrganization: 'Amazon Web Services (AWS)',
      issueDate: '2023-06',
      expirationDate: '2026-06',
      credentialId: 'AWS-SAP-2023-12345',
      credentialUrl: 'https://aws.amazon.com/verification'
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuingOrganization: 'The Linux Foundation',
      issueDate: '2022-09',
      expirationDate: '2025-09'
    }
  ],

  projects: [
    {
      name: 'Migração Monolito → Microsserviços',
      description: `Liderança técnica da migração completa de monolito Rails para arquitetura de microsserviços.

• Desenho de arquitetura com 50+ microsserviços
• Implementação de API Gateway e Service Mesh
• Zero downtime durante toda migração (6 meses)
• Melhoria de 300% na capacidade de escala horizontal`,
      associatedWith: 'Nubank',
      startDate: '2021-06',
      endDate: '2022-12',
      skills: ['Node.js', 'Kotlin', 'AWS', 'Kubernetes', 'Istio', 'GraphQL']
    }
  ],

  awards: [
    {
      title: 'Hackathon Winner - Melhor Solução Técnica',
      issuer: 'iFood Tech',
      issueDate: '2020-11',
      description: 'Primeiro lugar no hackathon interno com solução de recomendação usando ML.'
    }
  ],

  languages: [
    { language: 'Português', proficiency: 'Nativo ou bilíngue' },
    { language: 'Inglês', proficiency: ' B2 (Intermediário Superior)' }
  ],

  featured: [
    {
      type: 'article',
      title: 'Como escalamos de 100k para 10M requests/dia',
      url: 'https://engineering.nubank.com/scaling-microservices',
      description: 'Artigo técnico sobre nossa jornada de escalabilidade.',
      date: '2023-08'
    }
  ],

  contact: {
    email: 'ana.silva@example.com',
    website: 'https://anasilva.dev',
    profileUrl: 'https://www.linkedin.com/in/anasilva/',
    instantMessaging: [
      { platform: 'GitHub', handle: 'anasilva' },
      { platform: 'Twitter', handle: '@ana_codes' }
    ]
  }
};
```

---

## CV Júnior - Recém-Formado

Exemplo focado em educação, projetos e potencial:

```typescript
export const CV_DATA: CvData = {
  hero: {
    name: 'Pedro Henrique Costa',
    headline: 'Desenvolvedor Full Stack | React & Node.js | Buscando primeira oportunidade'
  },

  about: {
    text: `Desenvolvedor recém-formado em Engenharia de Software, apaixonado por criar soluções web modernas e escaláveis.

Durante a graduação, desenvolvi diversos projetos práticos usando React, Node.js e bancos de dados relacionais e NoSQL.

Busco minha primeira oportunidade profissional para aplicar meus conhecimentos e crescer em um ambiente desafiador.

Rápido aprendizado, proativo e sempre disposto a ir além.`
  },

  skills: [
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'Git' },
    { name: 'MongoDB' },
    { name: 'PostgreSQL' },
    { name: 'HTML/CSS' }
  ],

  education: [
    {
      institution: 'Universidade Federal do Paraná (UFPR)',
      degree: 'Bacharelado',
      fieldOfStudy: 'Engenharia de Software',
      startDate: '2020-02',
      endDate: '2024-12',
      grade: '8.5',
      activities: [
        'Membro da Empresa Júnior de Tecnologia',
        'Participante de 3 hackathons universitários',
        'Monitoria de Programação Web (2023)'
      ],
      skills: ['Java', 'Python', 'JavaScript', 'React', 'SQL', 'Metodologias Ágeis']
    }
  ],

  projects: [
    {
      name: 'TaskFlow - Gerenciador de Tarefas',
      description: `Aplicação full stack de gerenciamento de tarefas com recursos avançados.

• Frontend: React + TypeScript + Tailwind CSS
• Backend: Node.js + Express + MongoDB
• Autenticação JWT e autorização baseada em roles
• Deploy automatizado na Vercel e Railway
• Testes unitários com Jest (70% de cobertura)`,
      startDate: '2024-06',
      endDate: '2024-10',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
      media: [
        {
          type: 'link',
          url: 'https://github.com/pedrocosta/taskflow',
          title: 'Código no GitHub'
        }
      ]
    },
    {
      name: 'Ecommerce Fullstack (TCC)',
      description: `Plataforma completa de e-commerce desenvolvida como Trabalho de Conclusão de Curso.

• Catálogo de produtos com busca e filtros
• Carrinho de compras e checkout
• Painel administrativo para gestão
• Integração com API de pagamento (Stripe)
• Nota: 9.8/10`,
      startDate: '2024-03',
      endDate: '2024-11',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker']
    }
  ],

  courses: [
    {
      name: 'React - The Complete Guide',
      associatedWith: 'Udemy',
      completionDate: '2023-08'
    },
    {
      name: 'Node.js + Express + MongoDB Bootcamp',
      associatedWith: 'Udemy',
      completionDate: '2023-11'
    }
  ],

  languages: [
    { language: 'Português', proficiency: 'Nativo ou bilíngue' },
    { language: 'Inglês', proficiency: 'Intermediário' }
  ],

  contact: {
    email: 'pedro.costa@email.com',
    profileUrl: 'https://www.linkedin.com/in/pedrocosta/',
    instantMessaging: [
      { platform: 'GitHub', handle: 'pedrocosta' }
    ]
  }
};
```

---

## CV Freelancer

Exemplo focado em projetos e versatilidade:

```typescript
export const CV_DATA: CvData = {
  hero: {
    name: 'Carlos Eduardo Alves',
    headline: 'Full Stack Developer Freelancer | React • Next.js • Node.js | 150+ projetos entregues'
  },

  about: {
    text: `Desenvolvedor freelancer full stack com 6 anos de experiência entregando soluções web de alta qualidade para clientes nacionais e internacionais.

Especializado em desenvolvimento rápido e eficiente de MVPs, landing pages, e-commerces e aplicações SaaS.

Mais de 150 projetos concluídos com 98% de satisfação dos clientes. Trabalho com metodologia ágil, entregas incrementais e comunicação transparente.

Disponível para projetos de médio e longo prazo.`
  },

  skills: [
    { name: 'React', endorsements: 45 },
    { name: 'Next.js', endorsements: 38 },
    { name: 'Node.js', endorsements: 42 },
    { name: 'TypeScript', endorsements: 35 },
    { name: 'Tailwind CSS', endorsements: 30 },
    { name: 'WordPress', endorsements: 25 },
    { name: 'Shopify', endorsements: 20 }
  ],

  positions: [
    {
      title: 'Full Stack Developer',
      employmentType: 'Autônomo',
      company: 'Freelancer',
      startDate: '2019-01',
      locationType: 'Remoto',
      description: `Desenvolvimento de soluções web personalizadas para empresas de diversos segmentos.

• 150+ projetos entregues (landing pages, e-commerces, SaaS, dashboards)
• Clientes no Brasil, EUA, Portugal e Inglaterra
• Especialização em Next.js, React e Node.js
• Integração com APIs de terceiros (Stripe, PayPal, Mercado Pago)
• SEO técnico e performance otimizada (90+ no Lighthouse)`,
      skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Vercel']
    }
  ],

  projects: [
    {
      name: 'Plataforma SaaS de Agendamento Online',
      description: `Sistema completo de agendamento para clínicas e consultórios.

• Calendário interativo com agendamentos em tempo real
• Sistema de notificações (email + SMS)
• Painel administrativo completo
• Integração com Google Calendar
• 500+ agendamentos/dia processados`,
      startDate: '2024-05',
      endDate: '2024-09',
      skills: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe']
    },
    {
      name: 'E-commerce de Moda - 50k visitas/mês',
      description: `Loja virtual completa com checkout otimizado.

• Integração com Mercado Pago e PagSeguro
• Painel administrativo para gestão de produtos
• Sistema de cupons e promoções
• Taxa de conversão de 3.2% (acima da média do setor)`,
      startDate: '2023-11',
      endDate: '2024-02',
      skills: ['Next.js', 'Shopify', 'Tailwind CSS', 'Vercel']
    }
  ],

  certifications: [
    {
      name: 'Next.js 14 Complete Developer',
      issuingOrganization: 'Vercel',
      issueDate: '2024-02'
    }
  ],

  testScores: [
    {
      title: 'Upwork Top Rated Plus',
      score: '100% Job Success',
      testDate: '2024-01',
      description: 'Certificação de excelência na plataforma Upwork.'
    }
  ],

  languages: [
    { language: 'Português', proficiency: 'Nativo ou bilíngue' },
    { language: 'Inglês', proficiency: 'Proficiência profissional' }
  ],

  contact: {
    email: 'carlos@freelancer.dev',
    website: 'https://carlosalves.dev',
    instantMessaging: [
      { platform: 'GitHub', handle: 'carlosalves' },
      { platform: 'WhatsApp', handle: '+55 11 99999-9999' }
    ]
  }
};
```

---

## CV Acadêmico

Exemplo focado em pesquisa e publicações:

```typescript
export const CV_DATA: CvData = {
  hero: {
    name: 'Dr. Marina Santos',
    headline: 'Pesquisadora em Inteligência Artificial | PhD em Ciência da Computação | 15+ publicações'
  },

  about: {
    text: `Pesquisadora em Inteligência Artificial com foco em Machine Learning e Deep Learning aplicados a problemas reais.

Doutora em Ciência da Computação pela USP com pesquisa em redes neurais para diagnóstico médico.

Atualmente professora adjunta e coordenadora do laboratório de IA na UFMG, orientando 8 alunos de mestrado e doutorado.

Mais de 15 publicações em conferências e journals de primeira linha (NeurIPS, ICML, AAAI).`
  },

  skills: [
    { name: 'Machine Learning' },
    { name: 'Deep Learning' },
    { name: 'Python' },
    { name: 'TensorFlow' },
    { name: 'PyTorch' },
    { name: 'Pesquisa Científica' },
    { name: 'Orientação Acadêmica' }
  ],

  positions: [
    {
      title: 'Professora Adjunta',
      employmentType: 'Tempo integral',
      company: 'Universidade Federal de Minas Gerais (UFMG)',
      startDate: '2022-03',
      location: 'Belo Horizonte, MG, Brasil',
      locationType: 'Presencial',
      description: `Docência e pesquisa em IA e Machine Learning.

• Disciplinas: Machine Learning, Deep Learning, IA Aplicada
• Coordenação do Laboratório de IA
• Orientação de 8 alunos (mestrado e doutorado)
• Captação de R$ 500k em projetos de pesquisa (FAPEMIG, CNPq)`,
      skills: ['Machine Learning', 'Pesquisa', 'Orientação', 'Docência']
    }
  ],

  education: [
    {
      institution: 'Universidade de São Paulo (USP)',
      degree: 'Doutorado',
      fieldOfStudy: 'Ciência da Computação',
      startDate: '2018-03',
      endDate: '2022-02',
      activities: [
        'Bolsista FAPESP',
        'Doutorado sanduíche na Stanford University (6 meses)',
        'Prêmio Melhor Tese de Doutorado - SBC 2022'
      ]
    },
    {
      institution: 'Universidade Federal do Rio de Janeiro (UFRJ)',
      degree: 'Mestrado',
      fieldOfStudy: 'Ciência da Computação',
      startDate: '2016-03',
      endDate: '2018-02'
    }
  ],

  publications: [
    {
      title: 'Neural Networks for Early Cancer Detection in Medical Imaging',
      publisher: 'NeurIPS 2023',
      publicationDate: '2023-12',
      authors: ['@marinasantos', '@profjoao', '@dralice'],
      url: 'https://proceedings.neurips.cc/paper/2023/hash/abc123',
      description: 'Novel approach using CNNs for early detection of cancer in CT scans with 95% accuracy.'
    },
    {
      title: 'Transfer Learning in Medical Diagnosis: A Comprehensive Survey',
      publisher: 'Journal of Machine Learning Research',
      publicationDate: '2023-06',
      authors: ['@marinasantos', '@profcarlos'],
      url: 'https://jmlr.org/papers/v24/23-0567.html'
    }
  ],

  awards: [
    {
      title: 'Melhor Tese de Doutorado',
      issuer: 'Sociedade Brasileira de Computação (SBC)',
      issueDate: '2022-07',
      description: 'Reconhecimento pela excelência da pesquisa em Machine Learning aplicado à saúde.'
    },
    {
      title: 'Young Researcher Award',
      issuer: 'AAAI 2024',
      issueDate: '2024-02'
    }
  ],

  projects: [
    {
      name: 'IA para Diagnóstico de COVID-19',
      description: `Desenvolvimento de modelo de ML para detecção de COVID-19 em imagens de raio-X.

• Dataset de 10.000+ imagens
• Acurácia de 96.5% (state-of-the-art)
• Parceria com Hospital das Clínicas
• Publicado no ICML 2021`,
      startDate: '2020-04',
      endDate: '2021-06',
      skills: ['Python', 'TensorFlow', 'Computer Vision', 'Medical Imaging']
    }
  ],

  languages: [
    { language: 'Português', proficiency: 'Nativo ou bilíngue' },
    { language: 'Inglês', proficiency: ' B2 (Intermediário Superior)' }
  ],

  contact: {
    email: 'marina.santos@ufmg.br',
    website: 'https://marinasantos.ai',
    profileUrl: 'https://www.linkedin.com/in/marinasantos/',
    instantMessaging: [
      { platform: 'GitHub', handle: 'marinasantos' },
      { platform: 'Google Scholar', handle: 'marinasantos' }
    ]
  }
};
```

---

## 💡 Dicas Importantes

### Para Todos os Perfis

1. **Seja específico**: Use números e métricas sempre que possível
2. **Destaque conquistas**: Foque em resultados, não apenas responsabilidades
3. **Use palavras-chave**: Tecnologias relevantes para sua área
4. **Mantenha atualizado**: Revise seu CV a cada 3-6 meses

### Para Júnior

- Destaque projetos pessoais e acadêmicos
- Mostre vontade de aprender e crescer
- Inclua cursos e certificações online
- Participe de hackathons e contribua em open source

### Para Freelancer

- Mostre portfolio e projetos variados
- Destaque satisfação dos clientes
- Inclua testemunhos quando possível
- Demonstre versatilidade técnica

### Para Acadêmico

- Foque em publicações e citações
- Destaque prêmios e reconhecimentos
- Inclua orientações e projetos de pesquisa
- Mostre impacto da pesquisa

---

**Última atualização**: Novembro 2025
