import { z } from 'zod';

const textoNaoVazio = z.string().trim().min(1);
const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data ISO yyyy-mm-dd');
const corHex = z.string().regex(/^#[0-9A-F]{6}$/, 'cor #RRGGBB em maiúsculas');
const caminhoTextura = z.string().regex(/^textures\/[a-z0-9-]+\/[a-z]+\.webp$/, 'textures/<id>/<tipo>.webp');
const finito = z.number();

export const esquemaFonte = z.strictObject({
  id: textoNaoVazio,
  titulo: textoNaoVazio,
  url: z.string().url(),
  acessadoEm: z.union([dataIso, z.literal('')]),
});

export const esquemaDado = z.strictObject({
  rotulo: textoNaoVazio,
  valor: textoNaoVazio,
  valorNumerico: finito.optional(),
  nota: textoNaoVazio.optional(),
  fonteId: textoNaoVazio.optional(),
});

export const esquemaSecao = z
  .strictObject({
    texto: textoNaoVazio.optional(),
    dados: z.array(esquemaDado).min(1).optional(),
    itens: z.array(textoNaoVazio).min(1).optional(),
  })
  .refine((s) => s.texto || s.dados || s.itens, 'seção vazia');

export const esquemaCorpo = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id em slug sem acento'),
  nome: textoNaoVazio,
  tipo: z.enum(['estrela', 'planeta', 'planeta-anao', 'lua']),
  pai: textoNaoVazio.nullable(),
  ordem: z.number().int().min(0),
  exploravel3D: z.boolean(),

  fisico: z.strictObject({
    raioMedioKm: finito.positive().max(1e6),
    inclinacaoAxialGraus: finito.min(0).max(180),
    periodoRotacaoHoras: finito.refine((h) => h !== 0, 'período de rotação não pode ser zero'),
    rotacaoSincrona: z.boolean().optional(),
  }),
  orbita: z
    .strictObject({
      semiEixoMaiorKm: finito.positive(),
      periodoOrbitalDias: finito.positive(),
      inclinacaoGraus: finito.min(0).max(180),
      excentricidade: finito.min(0).lt(1),
      retrograda: z.boolean().optional(),
    })
    .nullable(),

  aparencia: z.strictObject({
    corBase: corHex,
    corAcento: corHex,
    texturas: z.strictObject({
      mapa: caminhoTextura.optional(),
      normal: caminhoTextura.optional(),
      noite: caminhoTextura.optional(),
      nuvens: caminhoTextura.optional(),
      especular: caminhoTextura.optional(),
      aneis: caminhoTextura.optional(),
    }),
    atmosfera: z.strictObject({ cor: corHex, intensidade: finito.min(0).max(1) }).optional(),
    aneis: z
      .strictObject({ raioInternoKm: finito.positive(), raioExternoKm: finito.positive() })
      .refine((a) => a.raioInternoKm < a.raioExternoKm, 'raio interno deve ser menor que o externo')
      .optional(),
    representacaoArtistica: z.boolean(),
  }),

  conteudo: z.strictObject({
    classificacao: textoNaoVazio,
    descricao: textoNaoVazio,
    secoes: z.strictObject({
      'visao-geral': esquemaSecao.optional(),
      composicao: esquemaSecao.optional(),
      atmosfera: esquemaSecao.optional(),
      curiosidades: esquemaSecao.optional(),
    }),
    luas: z
      .strictObject({
        totalConhecidas: z.number().int().min(0).nullable(),
        atualizadoEm: dataIso,
        fonteId: textoNaoVazio,
        mensagemSemLuas: textoNaoVazio.optional(),
      })
      .nullable(),
  }),

  fontes: z.array(esquemaFonte).min(1),
  atualizadoEm: dataIso,
});
