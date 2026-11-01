#!/usr/bin/env node
// Baixa, converte e gera as texturas do Órbita a partir de src/data/texturas.ts.
//
// Uso:
//   npm run baixar-texturas                      # tudo o que ainda não existe
//   npm run baixar-texturas -- --somente=terra,lua
//   npm run baixar-texturas -- --forcar          # refaz mesmo o que já existe
//   npm run baixar-texturas -- --sem-download    # só as texturas procedurais
//
// Saída: public/textures/<id>/<tipo>.webp (2K) e <tipo>-1k.webp (1K).
// Originais: .cache/texturas-originais/ (fora do bundle; podem ser apagados).
// Requer Node 22.18+ (importa os arquivos .ts de src/data com remoção de tipos nativa) e sharp.

import { createWriteStream } from 'node:fs';
import { mkdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { manifestoTexturas } from '../src/data/texturas.ts';
import { getBody } from '../src/data/index.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = path.join(RAIZ, 'public', 'textures');
const CACHE = path.join(RAIZ, '.cache', 'texturas-originais');
const DOWNLOADS_SIMULTANEOS = 3;

const MAPA_2K = { largura: 2048, altura: 1024 };
const ANEL_2K = { largura: 2048, altura: 64 };
const WEBP = { quality: 86, effort: 5 };
const WEBP_ALFA = { quality: 90, alphaQuality: 95, effort: 5 };

sharp.cache(false);

const args = process.argv.slice(2);
const forcar = args.includes('--forcar');
const semDownload = args.includes('--sem-download');
const somente = args.find((a) => a.startsWith('--somente='))?.split('=')[1]?.split(',').filter(Boolean);

// ---------------------------------------------------------------- utilidades

async function existe(arquivo) {
  try {
    await stat(arquivo);
    return true;
  } catch {
    return false;
  }
}

function caminhos(entrada) {
  const base = path.join(DESTINO, entrada.id, entrada.tipo);
  return { k2: `${base}.webp`, k1: `${base}-1k.webp` };
}

function mb(bytes) {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

async function baixar(url) {
  const arquivo = path.join(CACHE, decodeURIComponent(new URL(url).pathname.split('/').pop()));
  if (await existe(arquivo)) return arquivo;
  await mkdir(CACHE, { recursive: true });
  const resposta = await fetch(url);
  if (!resposta.ok || !resposta.body) throw new Error(`HTTP ${resposta.status} em ${url}`);
  const total = Number(resposta.headers.get('content-length')) || 0;
  console.log(`  ↓ ${path.basename(arquivo)}${total ? ` (${mb(total)})` : ''}`);
  const temporario = `${arquivo}.parcial`;
  await pipeline(Readable.fromWeb(resposta.body), createWriteStream(temporario));
  await rename(temporario, arquivo);
  return arquivo;
}

/** Executa tarefas com no máximo `n` em paralelo. */
async function emParalelo(itens, n, tarefa) {
  const fila = [...itens];
  const falhas = [];
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (fila.length) {
        const item = fila.shift();
        try {
          await tarefa(item);
        } catch (erro) {
          falhas.push({ item, erro });
          console.error(`  ✗ ${item.id}/${item.tipo}: ${erro.message}`);
        }
      }
    }),
  );
  return falhas;
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
function aleatorio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Imagem em tons de cinza tingida com uma cor, mantendo a luminância.
 * (O sharp.tint só colore entradas de 3 canais, por isso o cinza é replicado antes.)
 */
function tingirCinza(cinza, largura, altura, cor) {
  const rgb = Buffer.alloc(largura * altura * 3);
  for (let i = 0; i < cinza.length; i++) rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = cinza[i];
  return sharp(rgb, { raw: { width: largura, height: altura, channels: 3 } }).tint(cor);
}

function hexParaRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

async function salvarPar(imagem2k, entrada, dimensoes1k, opcoesWebp) {
  const { k2, k1 } = caminhos(entrada);
  await mkdir(path.dirname(k2), { recursive: true });
  // Decodifica uma vez e gera as duas resoluções a partir dos mesmos pixels (sem recompressão dupla).
  const { data, info } = await imagem2k.raw().toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: info.width, height: info.height, channels: info.channels } };
  await sharp(data, raw).webp(opcoesWebp).toFile(k2);
  await sharp(data, raw)
    .resize(dimensoes1k.largura, dimensoes1k.altura, { fit: 'fill', kernel: 'lanczos3' })
    .webp(opcoesWebp)
    .toFile(k1);
  const [a, b] = await Promise.all([stat(k2), stat(k1)]);
  console.log(`  ✓ ${entrada.id}/${entrada.tipo}.webp (${mb(a.size)}) e -1k (${mb(b.size)})`);
}

// ------------------------------------------------------------ mapas baixados

async function processarMapa(entrada, original) {
  const { ajustes = {} } = entrada.origem;
  const { largura, altura } = MAPA_2K;
  const { data, info } = await sharp(original, { limitInputPixels: false })
    .resize(largura, altura, { fit: 'fill', kernel: 'lanczos3' })
    .toColourspace(ajustes.tingir ? 'b-w' : 'srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  let pixels = data;
  const canais = info.channels;

  if (ajustes.centralizarLongitude0) {
    const rolado = Buffer.alloc(pixels.length);
    const meia = largura / 2;
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const de = (y * largura + x) * canais;
        const para = (y * largura + ((x + meia) % largura)) * canais;
        for (let c = 0; c < canais; c++) rolado[para + c] = pixels[de + c];
      }
    }
    pixels = rolado;
  }

  if (ajustes.preencherVazios) {
    // Pixels quase pretos em todos os canais = sem dados. Recebem a cor média dos pixels válidos.
    const LIMIAR = 12;
    const vazio = (i) => {
      for (let c = 0; c < canais; c++) if (pixels[i + c] > LIMIAR) return false;
      return true;
    };
    const soma = new Array(canais).fill(0);
    let n = 0;
    for (let i = 0; i < pixels.length; i += canais) {
      if (vazio(i)) continue;
      for (let c = 0; c < canais; c++) soma[c] += pixels[i + c];
      n++;
    }
    const media = soma.map((s) => Math.round(s / Math.max(n, 1)));
    for (let i = 0; i < pixels.length; i += canais) {
      if (vazio(i)) for (let c = 0; c < canais; c++) pixels[i + c] = media[c];
    }
  }

  const imagem = ajustes.tingir
    ? tingirCinza(pixels, largura, altura, ajustes.tingir)
    : sharp(pixels, { raw: { width: largura, height: altura, channels: canais } });
  const qualidade = entrada.tipo === 'normal' || entrada.tipo === 'especular' ? { ...WEBP, quality: 92 } : WEBP;
  await salvarPar(imagem, entrada, { largura: largura / 2, altura: altura / 2 }, qualidade);
}

async function processarAnelBaixado(entrada, original) {
  const corpo = getBody(entrada.id);
  const aneis = corpo?.aparencia.aneis;
  const calibracao = entrada.origem.ajustes?.calibracaoRadialKm;
  let imagem = sharp(original).ensureAlpha();
  if (aneis && calibracao) {
    const meta = await sharp(original).metadata();
    const kmPorPixel = (calibracao.fim - calibracao.inicio) / meta.width;
    const esquerda = Math.max(0, Math.round((aneis.raioInternoKm - calibracao.inicio) / kmPorPixel));
    const direita = Math.min(meta.width, Math.round((aneis.raioExternoKm - calibracao.inicio) / kmPorPixel));
    imagem = sharp(await imagem.extract({ left: esquerda, top: 0, width: direita - esquerda, height: meta.height }).toBuffer());
  }
  imagem = imagem.resize(ANEL_2K.largura, ANEL_2K.altura, { fit: 'fill', kernel: 'lanczos3' });
  await salvarPar(imagem, entrada, { largura: ANEL_2K.largura / 2, altura: ANEL_2K.altura / 2 }, WEBP_ALFA);
}

// ------------------------------------------------------- texturas procedurais

/** Ruído de valor 3D com interpolação suave, amostrado na esfera para não ter emendas. */
function criarRuido(semente) {
  const sorte = aleatorio(semente);
  const perm = Uint16Array.from({ length: 512 }, (_, i) => i & 255);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(sorte() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const valores = Float32Array.from({ length: 256 }, () => sorte() * 2 - 1);
  const suave = (t) => t * t * (3 - 2 * t);
  const h = (x, y, z) => valores[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]];
  return (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = suave(x - xi), yf = suave(y - yi), zf = suave(z - zi);
    const l = (a, b, t) => a + (b - a) * t;
    return l(
      l(l(h(xi, yi, zi), h(xi + 1, yi, zi), xf), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), xf), yf),
      l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), xf), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), xf), yf),
      zf,
    );
  };
}

/**
 * Superfície procedural: relevo (ruído fractal + crateras + vales) sombreado por uma luz
 * fixa, somado a variações de albedo. Tudo é calculado na esfera, sem emendas.
 */
function gerarCrateras(origem) {
  const { largura, altura } = MAPA_2K;
  const sorte = aleatorio(origem.semente * 7919);
  const ruidoRelevo = criarRuido(origem.semente);
  const ruidoAlbedo = criarRuido(origem.semente + 101);
  const relevo = new Float32Array(largura * altura);
  const albedo = new Float32Array(largura * altura);
  const latDe = (y) => Math.PI / 2 - ((y + 0.5) / altura) * Math.PI;
  const lonDe = (x) => ((x + 0.5) / largura) * 2 * Math.PI - Math.PI;

  // Base: ruído fractal de 8 oitavas para o relevo e de 5 para o albedo.
  for (let y = 0; y < altura; y++) {
    const lat = latDe(y);
    const cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < largura; x++) {
      const lon = lonDe(x);
      const px = cl * Math.cos(lon), py = sl, pz = cl * Math.sin(lon);
      let v = 0, amp = 1, freq = 3;
      for (let o = 0; o < 8; o++) {
        v += amp * ruidoRelevo(px * freq + 11.3, py * freq + 7.1, pz * freq + 3.7);
        amp *= 0.55;
        freq *= 2.02;
      }
      let a = 0;
      amp = 1;
      freq = 1.6;
      for (let o = 0; o < 5; o++) {
        a += amp * ruidoAlbedo(px * freq + 5.1, py * freq + 1.9, pz * freq + 8.3);
        amp *= 0.5;
        freq *= 2.1;
      }
      relevo[y * largura + x] = 0.012 * v;
      albedo[y * largura + x] = 0.07 * a;
    }
  }

  // Aplica `efeito(d)` em volta de um ponto da esfera, com d = distância angular / raio.
  function aoRedor(lat0, lon0, raio, alcance, efeito) {
    const lim = raio * alcance;
    const y0 = Math.max(0, Math.floor(((Math.PI / 2 - (lat0 + lim)) / Math.PI) * altura));
    const y1 = Math.min(altura - 1, Math.ceil(((Math.PI / 2 - (lat0 - lim)) / Math.PI) * altura));
    const xc = ((lon0 + Math.PI) / (2 * Math.PI)) * largura;
    for (let y = y0; y <= y1; y++) {
      const lat = latDe(y);
      const dLon = Math.min(Math.PI, lim / Math.max(Math.cos(lat), 1e-3));
      const meia = Math.ceil((dLon / (2 * Math.PI)) * largura);
      for (let xx = Math.floor(xc) - meia; xx <= Math.ceil(xc) + meia; xx++) {
        const x = ((xx % largura) + largura) % largura;
        const cosD = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lonDe(x) - lon0);
        const d = Math.acos(Math.min(1, Math.max(-1, cosD))) / raio;
        if (d <= alcance) efeito(y * largura + x, d);
      }
    }
  }

  // Crateras: tamanhos em lei de potência, posições uniformes na esfera.
  const raioMin = 0.0035, raioMax = 0.2; // radianos
  for (let i = 0; i < origem.crateras; i++) {
    const r = Math.min(raioMax, raioMin * Math.pow(1 - sorte() * 0.9995, -1 / 1.45));
    const lat0 = Math.asin(2 * sorte() - 1);
    const lon0 = sorte() * 2 * Math.PI - Math.PI;
    const profundidade = r * (0.18 + 0.12 * sorte());
    const recente = sorte() < 0.2;
    const fundoEscuro = origem.fundoEscuro && sorte() < 0.3;
    aoRedor(lat0, lon0, r, recente ? 2.2 : 1.5, (i, d) => {
      if (d < 1) relevo[i] += profundidade * (Math.max(d, 0.35) ** 2 - 1); // tigela de fundo achatado
      relevo[i] += profundidade * 0.3 * Math.exp(-(((d - 1) / 0.18) ** 2)); // borda elevada
      if (recente) albedo[i] += 0.05 * Math.exp(-(((d - 1.1) / 0.45) ** 2)); // material ejetado
      if (fundoEscuro && d < 0.85) albedo[i] -= 0.22 * (1 - (d / 0.85) ** 4);
    });
  }

  // Vales de falha: depressões largas ao longo de arcos de grande círculo.
  for (let c = 0; c < (origem.canions ?? 0); c++) {
    const lat0 = Math.asin(2 * sorte() - 1) * 0.8;
    const lon0 = sorte() * 2 * Math.PI - Math.PI;
    const rumo = sorte() * Math.PI;
    const comprimento = 0.6 + sorte() * 0.9; // radianos
    const meiaLargura = 0.012 + sorte() * 0.01; // radianos
    for (let s = -comprimento / 2; s <= comprimento / 2; s += meiaLargura / 2) {
      const lat = Math.asin(Math.sin(lat0) * Math.cos(s) + Math.cos(lat0) * Math.sin(s) * Math.cos(rumo));
      const lon = lon0 + Math.atan2(Math.sin(rumo) * Math.sin(s) * Math.cos(lat0), Math.cos(s) - Math.sin(lat0) * Math.sin(lat));
      const afinar = 1 - (2 * s / comprimento) ** 4; // pontas mais rasas
      aoRedor(lat, lon, meiaLargura, 2, (i, d) => {
        relevo[i] = Math.min(relevo[i], relevo[i] - 0.007 * afinar * Math.exp(-d * d * 1.5));
      });
    }
  }

  // Sombreamento: normal a partir do gradiente (corrigindo a distorção da projeção) e luz fixa.
  const luz = [-0.55, 0.55, 0.63];
  const escalaRelevo = altura / Math.PI; // radianos → pixels
  const pixels = Buffer.alloc(largura * altura);
  for (let y = 0; y < altura; y++) {
    const cosLat = Math.max(Math.cos(latDe(y)), 0.05);
    const yN = Math.max(0, y - 1), yS = Math.min(altura - 1, y + 1);
    for (let x = 0; x < largura; x++) {
      const xO = (x - 1 + largura) % largura, xL = (x + 1) % largura;
      const i = y * largura + x;
      const gx = ((relevo[y * largura + xL] - relevo[y * largura + xO]) / (2 * cosLat)) * escalaRelevo;
      const gy = ((relevo[yN * largura + x] - relevo[yS * largura + x]) / (yS - yN)) * escalaRelevo;
      const n = 1 / Math.hypot(gx, gy, 1);
      const brilho = (-gx * luz[0] + gy * luz[1] + luz[2]) * n - luz[2];
      pixels[i] = Math.max(0, Math.min(255, Math.round(132 + 255 * (albedo[i] + 0.45 * brilho))));
    }
  }
  return tingirCinza(pixels, largura, altura, origem.cor);
}

function gerarAneis(entrada, origem) {
  const aneis = getBody(entrada.id)?.aparencia.aneis;
  if (!aneis) throw new Error(`${entrada.id} não tem aparencia.aneis nos dados`);
  const { largura, altura } = ANEL_2K;
  const kmPorPixel = (aneis.raioExternoKm - aneis.raioInternoKm) / largura;
  const alfa = new Float32Array(largura);
  for (const faixa of origem.faixas) {
    // Recorta a faixa ao intervalo da textura e garante ao menos 1,5 px de largura, para que
    // anéis estreitos ou rentes à borda (como o Adams, de Netuno) continuem visíveis.
    const minimo = kmPorPixel * 1.5;
    let inicio = Math.max(faixa.inicioKm, aneis.raioInternoKm);
    let fim = Math.min(faixa.fimKm, aneis.raioExternoKm);
    if (fim - inicio < minimo) {
      if (fim >= aneis.raioExternoKm) inicio = fim - minimo;
      else if (inicio <= aneis.raioInternoKm) fim = inicio + minimo;
      else [inicio, fim] = [(inicio + fim - minimo) / 2, (inicio + fim + minimo) / 2];
    }
    const centro = (inicio + fim) / 2;
    const meia = (fim - inicio) / 2;
    for (let x = 0; x < largura; x++) {
      const r = aneis.raioInternoKm + (x + 0.5) * kmPorPixel;
      const dentro = 1 - Math.min(1, Math.max(0, (Math.abs(r - centro) - meia) / kmPorPixel + 0.5));
      alfa[x] = Math.max(alfa[x], faixa.alfa * dentro);
    }
  }
  const [vr, vg, vb] = hexParaRgb(origem.cor);
  const pixels = Buffer.alloc(largura * altura * 4);
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4;
      pixels[i] = vr;
      pixels[i + 1] = vg;
      pixels[i + 2] = vb;
      pixels[i + 3] = Math.round(alfa[x] * 255);
    }
  }
  return sharp(pixels, { raw: { width: largura, height: altura, channels: 4 } });
}

// ----------------------------------------------------------------- execução

async function processar(entrada) {
  const { k2, k1 } = caminhos(entrada);
  if (!forcar && (await existe(k2)) && (await existe(k1))) return;
  const { origem } = entrada;
  if (origem.tipo === 'download') {
    if (semDownload) return;
    const original = await baixar(origem.url);
    if (entrada.tipo === 'aneis') await processarAnelBaixado(entrada, original);
    else await processarMapa(entrada, original);
  } else if (origem.tipo === 'crateras') {
    await salvarPar(gerarCrateras(origem), entrada, { largura: 1024, altura: 512 }, WEBP);
  } else {
    await salvarPar(gerarAneis(entrada, origem), entrada, { largura: ANEL_2K.largura / 2, altura: ANEL_2K.altura / 2 }, WEBP_ALFA);
  }
}

const selecionadas = manifestoTexturas.filter((e) => !somente || somente.includes(e.id));
console.log(`Texturas: ${selecionadas.length} entradas → ${path.relative(RAIZ, DESTINO)}`);
const falhas = await emParalelo(selecionadas, DOWNLOADS_SIMULTANEOS, processar);
if (falhas.length) {
  console.error(`\n${falhas.length} textura(s) falharam. Rode de novo para tentar outra vez (os originais já baixados ficam no cache).`);
  process.exitCode = 1;
} else {
  console.log('\nPronto.');
}
