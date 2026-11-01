// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { bodies, creditos } from './index.ts';
import { caminhoTextura1k } from './construtores.ts';
import { manifestoTexturas } from './texturas.ts';
import creditsMd from '../../CREDITS.md?raw';

// Lista os arquivos de public/textures sem precisar de tipos do Node (resolvido pelo Vite).
const arquivos = new Set(
  Object.keys(import.meta.glob('../../public/textures/**/*.webp')).map((p) => p.replace('../../public/', '')),
);

const usadas = bodies.flatMap((b) => Object.values(b.aparencia.texturas).map((caminho) => ({ id: b.id, caminho })));

describe('texturas', () => {
  it('toda textura usada nos dados tem uma entrada no manifesto, e vice-versa', () => {
    const doManifesto = new Set(manifestoTexturas.map((e) => `textures/${e.id}/${e.tipo}.webp`));
    expect(new Set(usadas.map((u) => u.caminho))).toEqual(doManifesto);
    expect(doManifesto.size, 'entradas repetidas no manifesto').toBe(manifestoTexturas.length);
  });

  it('existem os arquivos 2K e 1K de cada textura em public/textures', () => {
    const faltando = usadas.flatMap((u) => [u.caminho, caminhoTextura1k(u.caminho)]).filter((c) => !arquivos.has(c));
    expect(faltando, 'rode npm run baixar-texturas').toEqual([]);
  });

  it('não há arquivos órfãos em public/textures', () => {
    const esperados = new Set(usadas.flatMap((u) => [u.caminho, caminhoTextura1k(u.caminho)]));
    expect([...arquivos].filter((a) => !esperados.has(a))).toEqual([]);
  });

  it('toda textura tem crédito com licença registrada, também em CREDITS.md', () => {
    for (const e of manifestoTexturas) {
      expect(creditos, `${e.id}/${e.tipo}`).toContain(e.credito);
      expect(e.credito.licenca).toBeTruthy();
      expect(e.modificacoes).toBeTruthy();
      expect(creditsMd, `CREDITS.md deve citar ${e.id}/${e.tipo}`).toContain(`\`${e.id}/${e.tipo}\``);
      if (e.origem.tipo === 'download') expect(creditsMd, 'CREDITS.md deve trazer a URL exata').toContain(e.origem.url.split('/').pop()!);
    }
    for (const c of creditos) expect(creditsMd).toContain(c.licenca);
  });

  it('corpos com anéis têm textura de anéis e vice-versa', () => {
    for (const b of bodies) expect(Boolean(b.aparencia.aneis), b.id).toBe(Boolean(b.aparencia.texturas.aneis));
  });

  it('texturas artísticas só nos corpos marcados como representação artística', () => {
    for (const e of manifestoTexturas) {
      if (e.tipo !== 'mapa') continue;
      const artistica = e.origem.tipo === 'crateras' || e.credito.recurso.includes('artísticas');
      const corpo = bodies.find((b) => b.id === e.id)!;
      if (artistica) expect(corpo.aparencia.representacaoArtistica, e.id).toBe(true);
    }
  });
});
