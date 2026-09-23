export type ContextoInvestimento =
  | 'GERAL_CARTEIRA'
  | 'FILTRO_QUALIDADE'
  | 'SCORE_PRECO_ALTO'
  | 'MANTER_SEM_VENDA'
  | 'REBALANCEAMENTO';

export interface Citacao {
  autor: string;
  obraOuFonte: string;
  texto: string;
}

export const DICIONARIO_CITACOES: Record<ContextoInvestimento, Citacao[]> = {
  GERAL_CARTEIRA: [
    {
      autor: 'Ray Dalio',
      obraOuFonte: 'Principles',
      texto: 'A diversificação consciente e o rebalanceamento disciplinado são o único almoço grátis no mercado financeiro.',
    },
    {
      autor: 'Howard Marks',
      obraOuFonte: 'O Mais Importante para o Investidor',
      texto: 'Se evitarmos os ativos perdedores, os vencedores cuidarão de si mesmos.',
    },
  ],
  FILTRO_QUALIDADE: [
    {
      autor: 'Charlie Munger',
      obraOuFonte: 'Discursos na Daily Journal',
      texto: 'É impressionante a vantagem de longo prazo que obtivemos ao tentar ser consistentemente não idiotas, em vez de tentar ser muito inteligentes.',
    },
  ],
  SCORE_PRECO_ALTO: [
    {
      autor: 'Warren Buffett',
      obraOuFonte: 'Cartas aos Acionistas da Berkshire Hathaway',
      texto: 'Preço é o que você paga; valor é o que você leva.',
    },
  ],
  MANTER_SEM_VENDA: [
    {
      autor: 'Charlie Munger',
      obraOuFonte: "Poor Charlie's Almanack",
      texto: 'O grande dinheiro não está na compra ou na venda, mas na espera.',
    },
  ],
  REBALANCEAMENTO: [
    {
      autor: 'Joel Greenblatt',
      obraOuFonte: 'O Livro Pequeno que Vence o Mercado',
      texto: 'Comprar empresas boas a preços baratos e seguir o processo com disciplina ganha do mercado no longo prazo.',
    },
  ],
};
