// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { bodies, getBody } from './index.ts';
import { esquemaCorpo } from './esquema.ts';
import { DIAS_POR_ANO, KM_POR_UA } from './formatar.ts';
import type { CelestialBody, Dado } from './types.ts';

// Escopo fechado do projeto (prompt 3). Os testes podem citar ids; a aplicação, não.
const ESCOPO = {
  estrela: ['sol'],
  planeta: ['mercurio', 'venus', 'terra', 'marte', 'jupiter', 'saturno', 'urano', 'netuno'],
  'planeta-anao': ['ceres', 'plutao', 'haumea', 'makemake', 'eris'],
  lua: ['lua', 'fobos', 'deimos', 'io', 'europa', 'ganimedes', 'calisto', 'tita', 'encelado', 'titania', 'oberon', 'tritao', 'caronte'],
} as const;
const TODOS = Object.values(ESCOPO).flat();

const G = 6.6743e-11;
const FUNDO = '#05060A';

function todosOsDados(b: CelestialBody): Dado[] {
  return Object.values(b.conteudo.secoes).flatMap((s) => s?.dados ?? []);
}

function dado(b: CelestialBody, rotulo: string): Dado | undefined {
  return todosOsDados(b).find((d) => d.rotulo === rotulo);
}

/** Percorre o objeto e devolve o caminho de toda string vazia ou só com espaços. */
function stringsVazias(valor: unknown, caminho: string, saida: string[] = []): string[] {
  if (typeof valor === 'string') {
    if (!valor.trim() && !caminho.endsWith('.acessadoEm')) saida.push(caminho);
  } else if (Array.isArray(valor)) {
    valor.forEach((v, i) => stringsVazias(v, `${caminho}[${i}]`, saida));
  } else if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) stringsVazias(v, `${caminho}.${k}`, saida);
  }
  return saida;
}

function luminancia(hex: string): number {
  const canal = (i: number) => {
    const c = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(1) + 0.0722 * canal(2);
}

function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Cor em CIELAB (D65) para medir distância perceptual (ΔE76). */
function lab(hex: string): [number, number, number] {
  const lin = (i: number) => {
    const c = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [lin(0), lin(1), lin(2)];
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

describe('escopo e identidade', () => {
  it('tem exatamente os 26 ids do escopo, sem repetição', () => {
    const ids = bodies.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...TODOS].sort());
  });

  it.each(Object.entries(ESCOPO))('os astros do tipo %s têm o tipo certo', (tipo, ids) => {
    for (const id of ids) expect(getBody(id)?.tipo, id).toBe(tipo);
  });

  it('cada pai aponta para um id válido e coerente com o tipo', () => {
    for (const b of bodies) {
      if (b.tipo === 'estrela') expect(b.pai, b.id).toBeNull();
      else if (b.tipo === 'lua') expect(['planeta', 'planeta-anao'], b.id).toContain(getBody(b.pai ?? '')?.tipo);
      else expect(b.pai, b.id).toBe('sol');
    }
  });

  it('as 13 luas (e todos os demais astros) podem ser explorados em 3D', () => {
    expect(bodies.filter((b) => b.tipo === 'lua' && b.exploravel3D)).toHaveLength(13);
    for (const b of bodies) expect(b.exploravel3D, b.id).toBe(true);
  });

  it('a ordem entre irmãos é única e segue a distância ao pai', () => {
    const porPai = new Map<string | null, CelestialBody[]>();
    for (const b of bodies.filter((x) => x.orbita)) porPai.set(b.pai, [...(porPai.get(b.pai) ?? []), b]);
    for (const [pai, filhos] of porPai) {
      const ordens = filhos.map((f) => f.ordem);
      expect(new Set(ordens).size, `ordens repetidas entre os filhos de ${pai}`).toBe(ordens.length);
      const porOrdem = [...filhos].sort((a, b) => a.ordem - b.ordem);
      const porDistancia = [...filhos].sort((a, b) => a.orbita!.semiEixoMaiorKm - b.orbita!.semiEixoMaiorKm);
      expect(porOrdem.map((f) => f.id)).toEqual(porDistancia.map((f) => f.id));
    }
  });
});

describe.each(bodies.map((b) => [b.id, b] as const))('%s', (id, b) => {
  it('segue o esquema Zod', () => {
    const r = esquemaCorpo.safeParse(b);
    expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([]);
  });

  it('não tem strings vazias', () => {
    expect(stringsVazias(b, id)).toEqual([]);
  });

  it('todo fonteId existe nas fontes do astro', () => {
    const fontes = new Set(b.fontes.map((f) => f.id));
    expect(new Set(b.fontes.map((f) => f.id)).size, 'fontes repetidas').toBe(b.fontes.length);
    for (const d of todosOsDados(b)) if (d.fonteId) expect(fontes, `${d.rotulo} → ${d.fonteId}`).toContain(d.fonteId);
    if (b.conteudo.luas) expect(fontes).toContain(b.conteudo.luas.fonteId);
  });

  it('tem as seções esperadas para o tipo', () => {
    const { secoes } = b.conteudo;
    expect(secoes['visao-geral']?.dados?.length).toBeGreaterThan(0);
    expect(secoes.composicao?.texto).toBeTruthy();
    const curiosidades = secoes.curiosidades?.itens ?? [];
    expect(curiosidades.length).toBeGreaterThanOrEqual(3);
    expect(curiosidades.length).toBeLessThanOrEqual(5);
    if (b.tipo === 'estrela') expect(secoes.atmosfera, 'o Sol trata da cromosfera e da coroa').toBeDefined();
    if (b.aparencia.atmosfera && b.tipo !== 'estrela') expect(secoes.atmosfera, 'tem atmosfera visual sem aba').toBeDefined();
  });

  it('tem os dados mínimos do tipo', () => {
    const rotulos = todosOsDados(b).map((d) => d.rotulo);
    expect(rotulos).toContain('Diâmetro');
    if (b.tipo === 'estrela') {
      for (const r of ['Tipo espectral', 'Idade', 'Massa', 'Luminosidade', 'Temperatura da fotosfera', 'Temperatura no núcleo', 'Rotação']) {
        expect(rotulos).toContain(r);
      }
      return;
    }
    expect(rotulos).toContain('Período de rotação');
    expect(rotulos).toContain('Período orbital');
    if (b.tipo === 'lua') {
      expect(rotulos.some((r) => r.startsWith('Distância média até '))).toBe(true);
    } else {
      for (const r of ['Distância média do Sol', 'Anéis', 'Luas conhecidas']) expect(rotulos).toContain(r);
    }
    if (b.tipo === 'planeta') {
      for (const r of ['Massa', 'Gravidade na superfície']) expect(rotulos).toContain(r);
      expect(rotulos.some((r) => r.startsWith('Temperatura'))).toBe(true);
    }
  });

  it('toda temperatura explica o que representa e traz o valor em K', () => {
    for (const d of todosOsDados(b).filter((d) => d.rotulo.startsWith('Temperatura') || d.rotulo === 'Variação diária')) {
      expect(d.valor, d.rotulo).toMatch(/°C/);
      expect(d.nota, d.rotulo).toMatch(/\d\sK|×\s10/);
    }
  });

  it('usa formatação pt-BR (menos tipográfico, sem ponto decimal)', () => {
    for (const d of todosOsDados(b)) {
      expect(d.valor, d.rotulo).not.toMatch(/(^|\s)-\d/);
      expect(d.valor, d.rotulo).not.toMatch(/\d\.\d{1,2}(?!\d)/); // "3.7" seria decimal em inglês
    }
  });

  it('luas: conteudo.luas segue o tipo e astros sem luas explicam o porquê', () => {
    const { luas } = b.conteudo;
    if (b.tipo === 'lua' || b.tipo === 'estrela') {
      expect(luas).toBeNull();
      return;
    }
    expect(luas).not.toBeNull();
    expect(luas!.atualizadoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (luas!.totalConhecidas === 0) expect(luas!.mensagemSemLuas).toBeTruthy();
    expect(dado(b, 'Luas conhecidas')?.valorNumerico ?? 0).toBe(luas!.totalConhecidas ?? 0);
  });

  it('valores físicos e orbitais plausíveis', () => {
    const pai = b.pai ? getBody(b.pai) : undefined;
    if (b.tipo === 'estrela') {
      expect(b.orbita).toBeNull();
      return;
    }
    expect(b.orbita).not.toBeNull();
    const o = b.orbita!;
    if (pai) expect(o.semiEixoMaiorKm, 'órbita dentro do corpo principal').toBeGreaterThan(pai.fisico.raioMedioKm);
    if (pai && pai.tipo !== 'estrela') expect(b.fisico.raioMedioKm).toBeLessThan(pai.fisico.raioMedioKm);
    if (o.retrograda) expect(o.inclinacaoGraus).toBeGreaterThan(90);
    if (o.inclinacaoGraus > 90) expect(o.retrograda).toBe(true);
    if (b.fisico.rotacaoSincrona) {
      expect(Math.abs(b.fisico.periodoRotacaoHoras) / 24).toBeCloseTo(o.periodoOrbitalDias, 3);
    }
    if (b.aparencia.aneis) expect(b.aparencia.aneis.raioInternoKm).toBeGreaterThan(b.fisico.raioMedioKm);
  });

  it('a órbita obedece à 3ª lei de Kepler (confere período × semieixo × massa do pai)', () => {
    const pai = b.pai ? getBody(b.pai) : undefined;
    const massaPai = pai ? dado(pai, 'Massa')?.valorNumerico : undefined;
    if (!b.orbita || !massaPai) return;
    const a = b.orbita.semiEixoMaiorKm * 1e3;
    const periodoTeoricoDias = (2 * Math.PI * Math.sqrt(a ** 3 / (G * massaPai))) / 86400;
    // Tolerância de 3 %: elementos médios × osculantes e massa do satélite desprezada,
    // exceto em Caronte, que tem ~11 % da massa do sistema.
    const tolerancia = b.id === 'caronte' ? 0.08 : 0.03;
    expect(Math.abs(b.orbita.periodoOrbitalDias / periodoTeoricoDias - 1)).toBeLessThan(tolerancia);
  });
});

describe('coerência entre corpos', () => {
  it('planetas e planetas anões: período em anos ≈ (semieixo em UA)^1,5', () => {
    for (const b of bodies.filter((x) => x.pai === 'sol')) {
      const ua = b.orbita!.semiEixoMaiorKm / KM_POR_UA;
      const anos = b.orbita!.periodoOrbitalDias / DIAS_POR_ANO;
      expect(Math.abs(anos / ua ** 1.5 - 1), b.id).toBeLessThan(0.02);
    }
  });

  it('o diâmetro exibido é coerente com o raio médio usado pela cena (±5 %)', () => {
    for (const b of bodies) {
      const d = dado(b, 'Diâmetro')?.valorNumerico;
      expect(d, b.id).toBeDefined();
      expect(Math.abs(d! / 1e3 / (2 * b.fisico.raioMedioKm) - 1), b.id).toBeLessThan(0.05);
    }
  });

  it('representação artística marcada nos corpos sem mapeamento global real', () => {
    const artisticos = bodies.filter((b) => b.aparencia.representacaoArtistica).map((b) => b.id).sort();
    expect(artisticos).toEqual(['deimos', 'eris', 'haumea', 'makemake', 'oberon', 'titania', 'tritao']);
  });

  it('cores de acento legíveis (AA, 4,5:1) sobre o fundo e distintas entre si (ΔE ≥ 12)', () => {
    for (const b of bodies) expect(contraste(b.aparencia.corAcento, FUNDO), b.id).toBeGreaterThanOrEqual(4.5);
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const [a, c] = [bodies[i], bodies[j]];
        const de = Math.hypot(...lab(a.aparencia.corAcento).map((v, k) => v - lab(c.aparencia.corAcento)[k]));
        expect(de, `${a.id} × ${c.id}`).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('texturas obrigatórias: mapa para todos; Terra com noite, nuvens e especular; anéis com textura', () => {
    for (const b of bodies) {
      expect(b.aparencia.texturas.mapa, b.id).toBe(`textures/${b.id}/mapa.webp`);
      if (b.aparencia.aneis) expect(b.aparencia.texturas.aneis, b.id).toBe(`textures/${b.id}/aneis.webp`);
    }
    const terra = getBody('terra')!.aparencia.texturas;
    for (const t of ['noite', 'nuvens', 'especular'] as const) expect(terra[t]).toBeDefined();
  });
});
