// Contrato compartilhado da camada de dados (responsável: especialista 3 — Dados).
// Os tipos abaixo são idênticos ao contrato; os comentários extras só documentam convenções.

export type BodyId = string;
export type BodyType = 'estrela' | 'planeta' | 'planeta-anao' | 'lua';

export interface Fonte { id: string; titulo: string; url: string; acessadoEm: string } // ISO yyyy-mm-dd

export interface Dado {
  rotulo: string;          // "Diâmetro"
  valor: string;           // já formatado em pt-BR: "12.742 km"
  valorNumerico?: number;  // valor em unidade SI/base, para comparações
  nota?: string;           // ex.: "Temperatura média da superfície"
  fonteId?: string;
}

export interface Secao { texto?: string; dados?: Dado[]; itens?: string[] }

export interface CelestialBody {
  id: BodyId;
  nome: string;                 // "Titã"
  tipo: BodyType;
  pai: BodyId | null;           // luas → planeta; planetas → 'sol'; sol → null
  ordem: number;                // ordem a partir do Sol (luas: ordem a partir do pai)
  exploravel3D: boolean;

  // Valores REAIS. A cena converte para escala ilustrativa.
  fisico: {
    raioMedioKm: number;
    // Obliquidade: ângulo entre o eixo de rotação e a normal do plano da própria órbita.
    // Valores > 90° já indicam rotação retrógrada (Vênus 177,4°, Urano 97,8°, Plutão 119,5°).
    inclinacaoAxialGraus: number;
    // Negativo = rotação retrógrada (planetas: em relação à eclíptica; luas: em relação ao
    // sentido de rotação do pai). Para a cena: gire com |período| em torno do eixo já inclinado;
    // o sinal é redundante com obliquidade > 90° e não deve ser aplicado duas vezes.
    periodoRotacaoHoras: number; // negativo = rotação retrógrada
    rotacaoSincrona?: boolean;
  };
  orbita: {
    semiEixoMaiorKm: number;
    periodoOrbitalDias: number;
    // Planetas e planetas anões: em relação à eclíptica. Luas: em relação ao plano de Laplace
    // ou ao equador do pai (JPL), exceto a Lua, cuja referência é a eclíptica.
    inclinacaoGraus: number;
    excentricidade: number;
    retrograda?: boolean;       // informativo; a inclinação > 90° já descreve o sentido
  } | null;

  aparencia: {
    corBase: string;            // usada se a textura falhar
    corAcento: string;          // cor de destaque da interface
    texturas: {                 // caminhos relativos a /public
      mapa?: string; normal?: string; noite?: string; nuvens?: string; especular?: string; aneis?: string;
    };
    atmosfera?: { cor: string; intensidade: number }; // 0–1
    aneis?: { raioInternoKm: number; raioExternoKm: number };
    representacaoArtistica: boolean;
  };

  conteudo: {
    classificacao: string;      // "Gigante gasoso"
    descricao: string;          // 2–3 frases
    secoes: Partial<Record<'visao-geral' | 'composicao' | 'atmosfera' | 'curiosidades', Secao>>; // ausente = aba oculta
    luas: { totalConhecidas: number | null; atualizadoEm: string; fonteId: string; mensagemSemLuas?: string } | null;
  };

  fontes: Fonte[];
  atualizadoEm: string;         // ISO
}
