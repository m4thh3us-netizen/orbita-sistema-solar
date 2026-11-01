import {
  ClampToEdgeWrapping,
  NoColorSpace,
  REVISION,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
  type WebGLRenderer,
} from 'three';
import type { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { caminhoTextura1k } from '@/data';

export type TipoTextura = 'mapa' | 'normal' | 'noite' | 'nuvens' | 'especular' | 'aneis';
export type NivelTextura = 'baixa' | 'alta';

const TIPOS_COR: ReadonlySet<TipoTextura> = new Set(['mapa', 'noite', 'aneis']);
const TEMPO_LIBERACAO_MS = 20_000;

interface Manifesto {
  versao: number;
  variantes: Record<string, { baixa?: string; ktx2?: string }>;
}

interface EntradaUrl {
  estado: 'carregando' | 'ok' | 'erro';
  promessa: Promise<void>;
  textura: Texture | null;
  refs: number;
  semUsoDesde: number;
}

interface Pedido {
  estado: 'carregando' | 'pronto';
  promessa: Promise<void>;
  url: string | null;
}

const porUrl = new Map<string, EntradaUrl>();
const pedidos = new Map<string, Pedido>();
const avisados = new Set<string>();

let manifesto: Promise<Manifesto | null> | null = null;
let anisotropia = 4;
let anisotropiaMaxima = 1;
let rendererAtual: WebGLRenderer | null = null;
let ktx2Loader: Promise<KTX2Loader | null> | null = null;
let coletor: ReturnType<typeof setInterval> | null = null;
const loader = new TextureLoader();

function normalizar(caminho: string): string {
  return caminho.replace(/^\.?\/+/, '');
}

function urlPublica(caminho: string): string {
  if (/^(https?:|data:|blob:)/.test(caminho)) return caminho;
  const base = import.meta.env.BASE_URL ?? '/';
  return (base.endsWith('/') ? base : base + '/') + normalizar(caminho);
}

function carregarManifesto(): Promise<Manifesto | null> {
  if (!manifesto) {
    manifesto = fetch(urlPublica('textures/manifest.json'))
      .then((r) => {
        const tipo = r.headers.get('content-type') ?? '';
        return r.ok && tipo.includes('json') ? (r.json() as Promise<Manifesto>) : null;
      })
      .then((m) => (m && typeof m === 'object' && m.variantes ? m : null))
      .catch(() => null);
  }
  return manifesto;
}

export function configurarRenderer(gl: WebGLRenderer): void {
  rendererAtual = gl;
  anisotropiaMaxima = gl.capabilities.getMaxAnisotropy();
  ktx2Loader = null;
  if (!coletor) coletor = setInterval(coletarSemUso, 5_000);
}

export function definirAnisotropia(valor: number): void {
  const novo = Math.max(1, Math.min(valor, anisotropiaMaxima));
  if (novo === anisotropia) return;
  anisotropia = novo;
  for (const e of porUrl.values()) {
    if (e.textura && e.textura.anisotropy !== novo) {
      e.textura.anisotropy = novo;
      e.textura.needsUpdate = true;
    }
  }
}

function obterKtx2(): Promise<KTX2Loader | null> {
  if (!ktx2Loader) {
    const gl = rendererAtual;
    ktx2Loader = gl
      ? import('three/addons/loaders/KTX2Loader.js')
          .then(({ KTX2Loader }) => {
            const l = new KTX2Loader();
            l.setTranscoderPath(`https://cdn.jsdelivr.net/npm/three@0.${REVISION}/examples/jsm/libs/basis/`);
            l.detectSupport(gl);
            return l;
          })
          .catch(() => null)
      : Promise.resolve(null);
  }
  return ktx2Loader;
}

function configurar(textura: Texture, tipo: TipoTextura): Texture {
  textura.colorSpace = TIPOS_COR.has(tipo) ? SRGBColorSpace : NoColorSpace;
  textura.anisotropy = anisotropia;
  if (tipo === 'aneis') {
    textura.wrapS = ClampToEdgeWrapping;
    textura.wrapT = ClampToEdgeWrapping;
  }
  textura.needsUpdate = true;
  return textura;
}

function avisar(url: string): void {
  if (avisados.has(url)) return;
  avisados.add(url);
  console.warn(`[órbita] textura indisponível, usando aparência procedural: ${url}`);
}

function carregarUrl(url: string, tipo: TipoTextura, ktx2: boolean): EntradaUrl {
  const existente = porUrl.get(url);
  if (existente) return existente;
  const entrada: EntradaUrl = {
    estado: 'carregando',
    promessa: Promise.resolve(),
    textura: null,
    refs: 0,
    semUsoDesde: performance.now(),
  };
  const carregar = async (): Promise<Texture> => {
    if (ktx2) {
      const l = await obterKtx2();
      if (l) return l.loadAsync(url);
    }
    return loader.loadAsync(url);
  };
  entrada.promessa = carregar()
    .then((t) => {
      entrada.textura = configurar(t, tipo);
      entrada.estado = 'ok';
      entrada.semUsoDesde = performance.now();
    })
    .catch(() => {
      entrada.estado = 'erro';
      avisar(url);
    });
  porUrl.set(url, entrada);
  return entrada;
}

function obterPedido(caminho: string, tipo: TipoTextura, nivel: NivelTextura): Pedido {
  const chave = `${nivel}|${tipo}|${normalizar(caminho)}`;
  const existente = pedidos.get(chave);
  if (existente) return existente;
  const pedido: Pedido = { estado: 'carregando', promessa: Promise.resolve(), url: null };
  pedido.promessa = carregarManifesto().then(async (m) => {
    const variante = m?.variantes[normalizar(caminho)];
    const original = urlPublica(caminho);
    let url = original;
    let ktx2 = false;
    if (nivel === 'baixa') {
      url = urlPublica(variante?.baixa ?? caminhoTextura1k(caminho));
    } else if (variante?.ktx2 && rendererAtual) {
      url = urlPublica(variante.ktx2);
      ktx2 = true;
    }
    let entrada = carregarUrl(url, tipo, ktx2);
    await entrada.promessa;
    if (entrada.estado === 'erro' && url !== original) {
      url = original;
      entrada = carregarUrl(url, tipo, false);
      await entrada.promessa;
    }
    pedido.url = url;
    pedido.estado = 'pronto';
  });
  pedidos.set(chave, pedido);
  return pedido;
}

function texturaDe(pedido: Pedido): Texture | null {
  if (!pedido.url) return null;
  const e = porUrl.get(pedido.url);
  return e && e.estado === 'ok' ? e.textura : null;
}

export function lerTextura(caminho: string | undefined, tipo: TipoTextura, nivel: NivelTextura): Texture | null {
  if (!caminho) return null;
  const pedido = obterPedido(caminho, tipo, nivel);
  if (pedido.estado === 'carregando') throw pedido.promessa;
  return texturaDe(pedido);
}

export function pedirTextura(
  caminho: string,
  tipo: TipoTextura,
  nivel: NivelTextura,
  aoTerminar: (t: Texture | null) => void,
): void {
  const pedido = obterPedido(caminho, tipo, nivel);
  if (pedido.estado === 'pronto') aoTerminar(texturaDe(pedido));
  else void pedido.promessa.then(() => aoTerminar(texturaDe(pedido)));
}

export function reter(textura: Texture | null): () => void {
  if (!textura) return () => {};
  const entrada = [...porUrl.values()].find((e) => e.textura === textura);
  if (!entrada) return () => {};
  entrada.refs++;
  return () => {
    entrada.refs = Math.max(0, entrada.refs - 1);
    if (entrada.refs === 0) entrada.semUsoDesde = performance.now();
  };
}

function coletarSemUso(): void {
  const agora = performance.now();
  for (const [url, e] of porUrl) {
    if (e.estado !== 'ok' || e.refs > 0 || agora - e.semUsoDesde < TEMPO_LIBERACAO_MS) continue;
    e.textura?.dispose();
    porUrl.delete(url);
    for (const [chave, p] of pedidos) if (p.url === url) pedidos.delete(chave);
  }
}

export function temAlfa(textura: Texture): boolean {
  const img = textura.image as CanvasImageSource & { width?: number; height?: number } | undefined;
  if (!img || typeof document === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 4;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;
    ctx.drawImage(img, 0, 0, 64, 4);
    const px = ctx.getImageData(0, 0, 64, 4).data;
    for (let i = 3; i < px.length; i += 4) if (px[i] < 250) return true;
    return false;
  } catch {
    return true;
  }
}
