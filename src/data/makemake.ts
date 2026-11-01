import type { CelestialBody } from './types.ts';
import { fontesPor } from './fontes.ts';
import { aneis, diametro, distanciaDoSol, luas, luasConhecidas, periodoOrbital, rotacao, texturas } from './construtores.ts';
import { KM_POR_UA } from './formatar.ts';

const A_UA = 45.57093317;

const luasMakemake = luas(1, 'nasa-makemake');

export const makemake = {
  id: 'makemake',
  nome: 'Makemake',
  tipo: 'planeta-anao',
  pai: 'sol',
  ordem: 12,
  exploravel3D: true,

  fisico: { raioMedioKm: 715, inclinacaoAxialGraus: 0, periodoRotacaoHoras: 22.8266 },
  orbita: { semiEixoMaiorKm: A_UA * KM_POR_UA, periodoOrbitalDias: 112_364.807, inclinacaoGraus: 29.028, excentricidade: 0.1589 },

  aparencia: {
    corBase: '#C28A6A',
    corAcento: '#E8826A',
    texturas: texturas('makemake', 'mapa'),
    representacaoArtistica: true,
  },

  conteudo: {
    classificacao: 'Planeta anão do Cinturão de Kuiper',
    descricao:
      'Makemake é um planeta anão avermelhado do Cinturão de Kuiper, um pouco menor que Plutão. A superfície tem metano e etano congelados, e ele tem uma pequena lua escura descoberta pelo Hubble.',
    secoes: {
      'visao-geral': {
        dados: [
          diametro(1430, 'nasa-makemake', 'Aproximado.'),
          rotacao(22.8266, 'jpl-sbdb-makemake', { nota: 'Período incerto: a curva de luz foi observada só em parte, e o valor pode estar errado em até cerca de 30 %.' }),
          periodoOrbital(112_364.807, 'jpl-sbdb-makemake', { nota: 'Calculado dos elementos orbitais atuais; a NASA Science arredonda para 305 anos.' }),
          distanciaDoSol(A_UA * KM_POR_UA, 'jpl-sbdb-makemake'),
          aneis(false, 'Não há anéis conhecidos.', 'nasa-makemake'),
          luasConhecidas(luasMakemake),
        ],
      },
      composicao: {
        texto:
          'Pouco se sabe do interior de Makemake. A superfície, de cor marrom-avermelhada como a de Plutão, tem metano e etano congelados.',
        itens: [
          'Gelo de metano, talvez em grãos de até 1 cm.',
          'Gelo de etano.',
          'Compostos que dão a cor marrom-avermelhada.',
        ],
      },
      curiosidades: {
        itens: [
          'A luz do Sol leva cerca de 6 h 20 min para chegar a Makemake.',
          'Sua lua, apelidada de MK2, foi vista pelo Hubble em 2015 e anunciada em 2016.',
          'Perto do periélio, Makemake pode ganhar uma atmosfera tênue, provavelmente de nitrogênio.',
          'Foi descoberto em março de 2005 pela equipe de Mike Brown, no Observatório Palomar.',
          'A massa ainda não foi medida com confiança: falta conhecer bem a órbita da sua lua.',
        ],
      },
    },
    luas: luasMakemake,
  },

  fontes: fontesPor('nasa-makemake', 'jpl-sbdb-makemake'),
  atualizadoEm: '2026-10-31',
} satisfies CelestialBody;
