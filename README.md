# Finanti App

Frontend do Finanti — ferramenta de controle e análise de carteira de investimentos para o mercado brasileiro (B3), com foco em rebalanceamento analítico e pontuação de ações por ciclo de mercado.

## Stack

- **Framework:** Angular
- **Deploy:** Vercel
- **Backend:** [Finanti API](../finanti-api) (NestJS)

## Sobre o projeto

O Finanti App é a interface do usuário para três frentes principais:

1. **Controle financeiro mensal** — passivos (contas a pagar), ativos (fontes de renda) e histórico de carteira, com visão temporal (comparação entre meses).
2. **Rebalanceamento de carteira** — aplicação de regras de alocação (ex: regra dos 100, regra dos 80) por categoria de risco (Variável x Segurança) e por classe de ativo (Ações, FIIs, Renda Fixa, Cripto, Imóveis).
3. **Ranking analítico de ações** — visualização do score de ações calculado pelo backend (Qualidade, Risco, Preço), normalizado por setor e segmento B3, com histórico mensal para acompanhar evolução do ranking ao longo do tempo.

## Módulos previstos

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login e sessão do usuário |
| `dashboard` | Visão geral (patrimônio total, alocação atual x proposta) |
| `passivos` | Tabela de contas mensais (CRUD) |
| `ganhos` | Tabela de fontes de renda mensais (CRUD) |
| `carteira` | Investimentos por tipo/subtipo, pesos proposto x atual |
| `ranking` | Ranking de ações com filtro por setor/segmento e gráfico de evolução histórica |

## Reaproveitamento

Este projeto reaproveita artefatos (componentes, design system, auth) de um projeto Angular existente. Itens candidatos a reuso serão documentados em `REUSE.md` conforme forem migrados.

## Como rodar

```bash
npm install
npm start
```

## Variáveis de ambiente

```
API_URL=
```

---
*Documentação em construção — este README será atualizado conforme o projeto evolui.*
