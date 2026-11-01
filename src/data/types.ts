export type BodyId = string;
export type BodyType = 'estrela' | 'planeta' | 'planeta-anao' | 'lua';

export interface Fonte { id: string; titulo: string; url: string; acessadoEm: string }

export interface Dado {
  rotulo: string;
  valor: string;
  valorNumerico?: number;
  nota?: string;
  fonteId?: string;
}

export interface Secao { texto?: string; dados?: Dado[]; itens?: string[] }

export interface CelestialBody {
  id: BodyId;
  nome: string;
  tipo: BodyType;
  pai: BodyId | null;
  ordem: number;
  exploravel3D: boolean;

  fisico: {
    raioMedioKm: number;
    inclinacaoAxialGraus: number;
    periodoRotacaoHoras: number;
    rotacaoSincrona?: boolean;
  };
  orbita: {
    semiEixoMaiorKm: number;
    periodoOrbitalDias: number;
    inclinacaoGraus: number;
    excentricidade: number;
    retrograda?: boolean;
  } | null;

  aparencia: {
    corBase: string;
    corAcento: string;
    texturas: {
      mapa?: string; normal?: string; noite?: string; nuvens?: string; especular?: string; aneis?: string;
    };
    atmosfera?: { cor: string; intensidade: number };
    aneis?: { raioInternoKm: number; raioExternoKm: number };
    representacaoArtistica: boolean;
  };

  conteudo: {
    classificacao: string;
    descricao: string;
    secoes: Partial<Record<'visao-geral' | 'composicao' | 'atmosfera' | 'curiosidades', Secao>>;
    luas: { totalConhecidas: number | null; atualizadoEm: string; fonteId: string; mensagemSemLuas?: string } | null;
  };

  fontes: Fonte[];
  atualizadoEm: string;
}
