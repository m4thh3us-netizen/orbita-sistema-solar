import type { BodyId } from './types.ts';
import type { TipoTextura } from './construtores.ts';
import type { Credito } from './creditos.ts';
import {
  CREDITO_CASSINI, CREDITO_DAWN, CREDITO_FOBOS, CREDITO_GALILEANAS, CREDITO_NEW_HORIZONS,
  CREDITO_PROCEDURAL, CREDITO_SSS, CREDITO_SSS_ARTISTICO, CREDITO_TRITAO,
} from './creditos.ts';

const SSS = 'https://www.solarsystemscope.com/textures/download';
const USGS = 'https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic';

export interface AjustesDownload {
  centralizarLongitude0?: boolean;
  tingir?: string;
  preencherVazios?: boolean;
  calibracaoRadialKm?: { inicio: number; fim: number };
}

export interface FaixaAnel { nome: string; inicioKm: number; fimKm: number; alfa: number }

export type OrigemTextura =
  | { tipo: 'download'; url: string; ajustes?: AjustesDownload }
  | { tipo: 'crateras'; semente: number; cor: string; crateras: number; fundoEscuro?: boolean; canions?: number }
  | { tipo: 'aneis'; cor: string; faixas: FaixaAnel[] };

export interface EntradaTextura {
  id: BodyId;
  tipo: TipoTextura;
  origem: OrigemTextura;
  credito: Credito;
  modificacoes: string;
}

const CONVERSAO = 'Convertida para WebP em 2048 × 1024 e 1024 × 512';

function sss(id: BodyId, tipo: TipoTextura, arquivo: string, modificacoes = CONVERSAO): EntradaTextura {
  return { id, tipo, origem: { tipo: 'download', url: `${SSS}/${arquivo}` }, credito: CREDITO_SSS, modificacoes };
}

function usgs(id: BodyId, arquivo: string, credito: Credito, ajustes: AjustesDownload, modificacoes: string): EntradaTextura {
  return { id, tipo: 'mapa', origem: { tipo: 'download', url: `${USGS}/${arquivo}`, ajustes }, credito, modificacoes };
}

function anel(nome: string, raioKm: number, larguraKm: number, alfa: number): FaixaAnel {
  return { nome, inicioKm: raioKm - larguraKm / 2, fimKm: raioKm + larguraKm / 2, alfa };
}

export const manifestoTexturas: EntradaTextura[] = [
  sss('sol', 'mapa', '2k_sun.jpg'),
  sss('mercurio', 'mapa', '2k_mercury.jpg'),
  sss('venus', 'mapa', '2k_venus_atmosphere.jpg', `${CONVERSAO}. Usa o mapa das nuvens (o que se vê de fora), não o da superfície`),
  sss('terra', 'mapa', '2k_earth_daymap.jpg'),
  sss('terra', 'noite', '2k_earth_nightmap.jpg'),
  sss('terra', 'nuvens', '2k_earth_clouds.jpg'),
  sss('terra', 'especular', '2k_earth_specular_map.tif'),
  sss('terra', 'normal', '2k_earth_normal_map.tif'),
  sss('lua', 'mapa', '2k_moon.jpg'),
  sss('marte', 'mapa', '2k_mars.jpg'),
  sss('jupiter', 'mapa', '2k_jupiter.jpg'),
  sss('saturno', 'mapa', '2k_saturn.jpg'),
  {
    id: 'saturno',
    tipo: 'aneis',
    origem: {
      tipo: 'download',
      url: `${SSS}/2k_saturn_ring_alpha.png`,
      ajustes: { calibracaoRadialKm: { inicio: 69_669, fim: 141_867 } },
    },
    credito: CREDITO_SSS,
    modificacoes: 'Recortada radialmente do anel C ao anel A (74.658–136.780 km) e convertida para WebP com alfa, 2048 × 64 e 1024 × 32',
  },
  sss('urano', 'mapa', '2k_uranus.jpg'),
  sss('netuno', 'mapa', '2k_neptune.jpg'),
  { ...sss('haumea', 'mapa', '2k_haumea_fictional.jpg'), credito: CREDITO_SSS_ARTISTICO },
  { ...sss('makemake', 'mapa', '2k_makemake_fictional.jpg'), credito: CREDITO_SSS_ARTISTICO },
  { ...sss('eris', 'mapa', '2k_eris_fictional.jpg'), credito: CREDITO_SSS_ARTISTICO },

  usgs('fobos', 'Phobos_Viking_Mosaic_40ppd_DLRcontrol.tif', CREDITO_FOBOS, {}, CONVERSAO),
  usgs('io', 'Io_GalileoSSI-Voyager_Global_Mosaic_ClrMerge_1km.tif', CREDITO_GALILEANAS, {}, CONVERSAO),
  usgs('europa', 'Europa_Voyager_GalileoSSI_global_mosaic_500m.tif', CREDITO_GALILEANAS,
    { centralizarLongitude0: true, tingir: '#D9C7A8', preencherVazios: true },
    `${CONVERSAO}; longitude 0° centralizada; tons de cinza tingidos de bege; lacunas sem dados preenchidas com o tom médio`),
  usgs('ganimedes', 'Ganymede_Voyager_GalileoSSI_global_mosaic_1km.tif', CREDITO_GALILEANAS,
    { centralizarLongitude0: true, tingir: '#A89F90', preencherVazios: true },
    `${CONVERSAO}; longitude 0° centralizada; tons de cinza tingidos de marrom-acinzentado; lacunas polares preenchidas com o tom médio`),
  usgs('calisto', 'Callisto_Voyager_GalileoSSI_global_mosaic_1km.tif', CREDITO_GALILEANAS,
    { centralizarLongitude0: true, tingir: '#8C7B66', preencherVazios: true },
    `${CONVERSAO}; longitude 0° centralizada; tons de cinza tingidos de marrom; lacunas polares preenchidas com o tom médio`),
  usgs('tita', 'Titan_ISS_P19658_Mosaic_Global_4km.tif', CREDITO_CASSINI,
    { centralizarLongitude0: true, tingir: '#D9963F' },
    `${CONVERSAO}; longitude 0° centralizada; mapa da superfície em infravermelho próximo (938 nm) tingido de laranja para lembrar a névoa`),
  usgs('encelado', 'Enceladus_Cassini_mosaic_global_110m.tif', CREDITO_CASSINI,
    { centralizarLongitude0: true },
    `${CONVERSAO}; longitude 0° centralizada`),
  usgs('tritao', 'Triton_Voyager2_ClrMosaic_GlobalFill_600m.tif', CREDITO_TRITAO, { preencherVazios: true },
    `${CONVERSAO}. A Voyager 2 viu só parte de Tritão (sobretudo o hemisfério sul); a área sem imagens foi preenchida com a cor média`),
  usgs('plutao', 'Pluto_NewHorizons_Global_Mosaic_300m_Jul2017_8bit.tif', CREDITO_NEW_HORIZONS,
    { centralizarLongitude0: true, tingir: '#D8B08C', preencherVazios: true },
    `${CONVERSAO}; longitude 0° centralizada; tingida de bege; áreas não fotografadas (sul) preenchidas com o tom médio`),
  usgs('caronte', 'Charon_NewHorizons_Global_Mosaic_300m_Jul2017_8bit.tif', CREDITO_NEW_HORIZONS,
    { tingir: '#A49890', preencherVazios: true },
    `${CONVERSAO}; tingida de cinza-amarronzado; áreas não fotografadas (sul) preenchidas com o tom médio`),
  usgs('ceres', 'Ceres_Dawn_FC_DLR_global_20ppd_Oct2015.tif', CREDITO_DAWN,
    { centralizarLongitude0: true },
    `${CONVERSAO}; longitude 0° centralizada`),

  {
    id: 'deimos', tipo: 'mapa', credito: CREDITO_PROCEDURAL,
    origem: { tipo: 'crateras', semente: 2, cor: '#8A7D70', crateras: 260 },
    modificacoes: 'Gerada: ruído fractal e poucas crateras suavizadas (não há mosaico global público)',
  },
  {
    id: 'titania', tipo: 'mapa', credito: CREDITO_PROCEDURAL,
    origem: { tipo: 'crateras', semente: 3, cor: '#A39C96', crateras: 1600, canions: 7 },
    modificacoes: 'Gerada: crateras e vales de falha (a Voyager 2 fotografou só parte da lua)',
  },
  {
    id: 'oberon', tipo: 'mapa', credito: CREDITO_PROCEDURAL,
    origem: { tipo: 'crateras', semente: 4, cor: '#8C8079', crateras: 2600, fundoEscuro: true },
    modificacoes: 'Gerada: muitas crateras, algumas de fundo escuro (a Voyager 2 fotografou só parte da lua)',
  },
  {
    id: 'jupiter', tipo: 'aneis', credito: CREDITO_PROCEDURAL,
    origem: {
      tipo: 'aneis', cor: '#B08A6A',
      faixas: [
        { nome: 'Halo', inicioKm: 89_400, fimKm: 123_000, alfa: 0.1 },
        { nome: 'Principal', inicioKm: 123_000, fimKm: 128_940, alfa: 0.45 },
        { nome: 'Amalteia', inicioKm: 128_940, fimKm: 181_350, alfa: 0.05 },
        { nome: 'Tebe', inicioKm: 181_350, fimKm: 221_900, alfa: 0.04 },
      ],
    },
    modificacoes: 'Gerada a partir dos raios da NSSDCA (Jovian Rings Fact Sheet)',
  },
  {
    id: 'urano', tipo: 'aneis', credito: CREDITO_PROCEDURAL,
    origem: {
      tipo: 'aneis', cor: '#8E8A86',
      faixas: [
        anel('6', 41_837, 1.5, 0.5), anel('5', 42_234, 2, 0.6), anel('4', 42_571, 2, 0.5),
        anel('α', 44_718, 7, 0.6), anel('β', 45_661, 8, 0.5), anel('η', 47_176, 1.6, 0.55),
        anel('γ', 47_627, 2.5, 0.5), anel('δ', 48_300, 5, 0.6), anel('λ', 50_024, 2, 0.25),
        anel('ε', 51_149, 58, 0.95),
      ],
    },
    modificacoes: 'Gerada a partir dos raios e larguras da NSSDCA (Uranian Rings Fact Sheet)',
  },
  {
    id: 'netuno', tipo: 'aneis', credito: CREDITO_PROCEDURAL,
    origem: {
      tipo: 'aneis', cor: '#8F8580',
      faixas: [
        anel('Galle', 41_900, 2000, 0.08),
        anel('Le Verrier', 53_200, 100, 0.35),
        { nome: 'Lassell', inicioKm: 53_200, fimKm: 57_200, alfa: 0.06 },
        anel('Arago', 57_200, 100, 0.25),
        anel('Adams', 62_933, 15, 0.5),
      ],
    },
    modificacoes: 'Gerada a partir dos raios e larguras da NSSDCA (Neptunian Rings Fact Sheet)',
  },
  {
    id: 'haumea', tipo: 'aneis', credito: CREDITO_PROCEDURAL,
    origem: { tipo: 'aneis', cor: '#BFB8B0', faixas: [anel('Anel', 2287, 70, 0.6)] },
    modificacoes: 'Gerada a partir do raio (~2.287 km) e da largura (~70 km) de Ortiz et al. (2017)',
  },
];
