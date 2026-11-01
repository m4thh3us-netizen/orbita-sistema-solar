export interface Credito { recurso: string; autor: string; licenca: string; url: string }

const USGS_MOSAICOS = 'https://planetarymaps.usgs.gov/mosaic';

export const CREDITO_SSS: Credito = {
  recurso: 'Texturas do Solar System Scope (Sol, planetas, Lua, anéis de Saturno e mapas da Terra)',
  autor: 'Solar System Scope / INOVE, baseadas em dados da NASA',
  licenca: 'CC BY 4.0',
  url: 'https://www.solarsystemscope.com/textures/',
};

export const CREDITO_SSS_ARTISTICO: Credito = {
  recurso: 'Texturas artísticas do Solar System Scope (Haumea, Makemake e Éris)',
  autor: 'Solar System Scope / INOVE',
  licenca: 'CC BY 4.0',
  url: 'https://www.solarsystemscope.com/textures/',
};

export const CREDITO_FOBOS: Credito = {
  recurso: 'Mosaico global de Fobos (Viking)',
  autor: 'NASA / JPL; rede de controle DLR; distribuído pelo USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/Phobos_Viking_Mosaic_40ppd_DLRcontrol.tif`,
};

export const CREDITO_GALILEANAS: Credito = {
  recurso: 'Mosaicos globais de Io, Europa, Ganimedes e Calisto (Voyager e Galileo SSI)',
  autor: 'NASA / JPL / USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/`,
};

export const CREDITO_CASSINI: Credito = {
  recurso: 'Mosaicos globais de Titã e Encélado (Cassini ISS)',
  autor: 'NASA / JPL-Caltech / Space Science Institute / USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/`,
};

export const CREDITO_TRITAO: Credito = {
  recurso: 'Mosaico global colorido de Tritão (Voyager 2)',
  autor: 'NASA / JPL / USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/Triton_Voyager2_ClrMosaic_GlobalFill_600m.tif`,
};

export const CREDITO_NEW_HORIZONS: Credito = {
  recurso: 'Mosaicos globais de Plutão e Caronte (New Horizons LORRI/MVIC)',
  autor: 'NASA / Johns Hopkins APL / Southwest Research Institute / USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/`,
};

export const CREDITO_DAWN: Credito = {
  recurso: 'Mosaico global de Ceres (Dawn Framing Camera)',
  autor: 'NASA / JPL-Caltech / UCLA / MPS / DLR / IDA; mosaico DLR, distribuído pelo USGS Astrogeology',
  licenca: 'Domínio público',
  url: `${USGS_MOSAICOS}/Ceres_Dawn_FC_DLR_global_20ppd_Oct2015.tif`,
};

export const CREDITO_PROCEDURAL: Credito = {
  recurso: 'Texturas procedurais (Deimos, Titânia, Oberon e anéis de Júpiter, Urano, Netuno e Haumea)',
  autor: 'Projeto Órbita, geradas por scripts/baixar-texturas.mjs a partir dos raios publicados pela NSSDCA e por Ortiz et al. (2017)',
  licenca: 'Mesma licença do código do projeto',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
};

export const CREDITO_NSSDCA: Credito = {
  recurso: 'Valores físicos e orbitais de planetas, Lua, Plutão e Sol',
  autor: 'NASA Space Science Data Coordinated Archive (NSSDCA), Planetary Fact Sheets',
  licenca: 'Domínio público',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
};

export const CREDITO_JPL_SSD: Credito = {
  recurso: 'Parâmetros físicos e orbitais de satélites e planetas anões',
  autor: 'NASA / JPL-Caltech, Solar System Dynamics',
  licenca: 'Uso livre com crédito',
  url: 'https://ssd.jpl.nasa.gov/',
};

export const CREDITO_NASA_SCIENCE: Credito = {
  recurso: 'Contagem de luas, descrições e curiosidades',
  autor: 'NASA Science',
  licenca: 'Domínio público',
  url: 'https://science.nasa.gov/solar-system/',
};

export const creditos: Credito[] = [
  CREDITO_SSS,
  CREDITO_SSS_ARTISTICO,
  CREDITO_FOBOS,
  CREDITO_GALILEANAS,
  CREDITO_CASSINI,
  CREDITO_TRITAO,
  CREDITO_NEW_HORIZONS,
  CREDITO_DAWN,
  CREDITO_PROCEDURAL,
  CREDITO_NSSDCA,
  CREDITO_JPL_SSD,
  CREDITO_NASA_SCIENCE,
];
