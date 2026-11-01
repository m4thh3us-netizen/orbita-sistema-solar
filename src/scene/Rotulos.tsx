/**
 * Rótulos com o nome dos astros, em HTML sobre o canvas (classes `.rotulo-astro` e
 * `.rotulo-astro--hover` da interface). Um só laço por quadro posiciona todos e decide
 * quem aparece: com `mostrarNomes`, todos os visíveis; sem, só o do hover. Rótulos que se
 * sobrepõem são ocultados por prioridade (hover › estrela › planetas e luas › anões), assim
 * como os de astros grandes demais na tela (muito próximos) ou longe demais.
 * Os elementos são criados fora do React, para não haver re-render por quadro.
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3, type PerspectiveCamera } from 'three';
import type { BodyId, BodyType } from '@/data/types';
import { useOrbita } from '@/state/store';
import { PRIORIDADE } from './prioridades';
import { registro, type EntradaRegistro } from './registro';

interface Rotulo {
  raiz: HTMLDivElement;
  texto: HTMLSpanElement;
  largura: number;
  visivel: boolean;
  hover: boolean;
}

interface Candidato {
  entrada: EntradaRegistro;
  rotulo: Rotulo;
  x: number;
  y: number;
  raioPx: number;
  prioridade: number;
  hover: boolean;
}

const PESO_TIPO: Record<BodyType, number> = { estrela: 0, planeta: 1, lua: 1, 'planeta-anao': 2 };
const ALTURA_ROTULO = 18;
const MARGEM = 6;
const p = new Vector3();

function criarRotulo(e: EntradaRegistro, container: HTMLElement): Rotulo {
  const raiz = document.createElement('div');
  raiz.className = 'orbita-rotulo';
  Object.assign(raiz.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    opacity: '0',
    willChange: 'transform, opacity',
  } satisfies Partial<CSSStyleDeclaration>);
  const texto = document.createElement('span');
  texto.className = 'rotulo-astro';
  texto.dataset.tipo = e.tipo;
  texto.textContent = e.nome;
  texto.style.setProperty('--cor-acento-astro', e.corAcento);
  raiz.appendChild(texto);
  container.appendChild(raiz);
  return { raiz, texto, largura: Math.max(texto.offsetWidth, e.nome.length * 7.5) + 8, visivel: false, hover: false };
}

export function Rotulos() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const container = useRef<HTMLDivElement | null>(null);
  const rotulos = useRef(new Map<BodyId, Rotulo>());

  useEffect(() => {
    const pai = gl.domElement.parentElement;
    if (!pai) return;
    const div = document.createElement('div');
    div.className = 'orbita-rotulos';
    Object.assign(div.style, { position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none' });
    pai.appendChild(div);
    container.current = div;
    const mapa = rotulos.current;

    const sincronizar = () => {
      const ativos = new Set<BodyId>();
      for (const e of registro.todos()) {
        ativos.add(e.id);
        const r = mapa.get(e.id);
        if (!r) mapa.set(e.id, criarRotulo(e, div));
        else if (r.texto.textContent !== e.nome) r.texto.textContent = e.nome;
      }
      for (const [id, r] of mapa) {
        if (!ativos.has(id)) {
          r.raiz.remove();
          mapa.delete(id);
        }
      }
    };
    sincronizar();
    const parar = registro.ouvir(sincronizar);
    return () => {
      parar();
      for (const r of mapa.values()) r.raiz.remove();
      mapa.clear();
      div.remove();
      container.current = null;
    };
  }, [gl]);

  useFrame(() => {
    if (!container.current) return;
    const s = useOrbita.getState();
    const { width: largura, height: altura } = size;
    const emFoco = s.modo !== 'visao-geral' ? s.selecionado : null;
    const tanMeio = Math.tan((camera.fov * Math.PI) / 360);
    const limiteDistante = s.modo === 'visao-geral' ? 600 : 90;
    const transicao = s.movimentoReduzido ? 'none' : 'opacity 160ms ease';

    const candidatos: Candidato[] = [];
    for (const entrada of registro.todos()) {
      const rotulo = rotulos.current.get(entrada.id);
      if (!rotulo) continue;
      const hover = s.hover === entrada.id;
      entrada.objeto.getWorldPosition(p);
      const distancia = p.distanceTo(camera.position);
      p.project(camera);
      const naFrente = p.z > -1 && p.z < 1;
      const x = ((p.x + 1) / 2) * largura;
      const y = ((1 - p.y) / 2) * altura;
      const raioPx = (entrada.raio / (distancia * tanMeio)) * (altura / 2);
      const dentro = x > -40 && x < largura + 40 && y > -20 && y < altura + 20;
      const querido = (s.mostrarNomes || hover) && entrada.id !== emFoco;
      const legivel = raioPx < altura * 0.22 && (distancia < limiteDistante || hover);
      if (naFrente && dentro && querido && legivel) {
        candidatos.push({
          entrada,
          rotulo,
          x,
          y,
          raioPx,
          hover,
          prioridade: hover ? -1 : PESO_TIPO[entrada.tipo],
        });
      } else {
        ocultar(rotulo, transicao);
      }
    }

    candidatos.sort((a, b) => a.prioridade - b.prioridade || b.raioPx - a.raioPx);
    const ocupados: { x0: number; y0: number; x1: number; y1: number }[] = [];
    for (const c of candidatos) {
      const deslocamento = Math.min(c.raioPx, 60) + 8;
      const x0 = c.x + deslocamento;
      const caixa = { x0: x0 - MARGEM, y0: c.y - ALTURA_ROTULO / 2 - MARGEM, x1: x0 + c.rotulo.largura + MARGEM, y1: c.y + ALTURA_ROTULO / 2 + MARGEM };
      const colide = !c.hover && ocupados.some((o) => caixa.x0 < o.x1 && caixa.x1 > o.x0 && caixa.y0 < o.y1 && caixa.y1 > o.y0);
      if (colide) {
        ocultar(c.rotulo, transicao);
        continue;
      }
      ocupados.push(caixa);
      mostrar(c.rotulo, x0, c.y, c.hover, transicao);
    }
  }, PRIORIDADE.aposCamera);

  return null;
}

function mostrar(r: Rotulo, x: number, y: number, hover: boolean, transicao: string): void {
  r.raiz.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%)`;
  if (r.raiz.style.transition !== transicao) r.raiz.style.transition = transicao;
  if (!r.visivel) {
    r.raiz.style.opacity = '1';
    r.visivel = true;
  }
  if (r.hover !== hover) {
    r.texto.classList.toggle('rotulo-astro--hover', hover);
    r.hover = hover;
  }
}

function ocultar(r: Rotulo, transicao: string): void {
  if (!r.visivel) return;
  if (r.raiz.style.transition !== transicao) r.raiz.style.transition = transicao;
  r.raiz.style.opacity = '0';
  r.visivel = false;
  if (r.hover) {
    r.texto.classList.remove('rotulo-astro--hover');
    r.hover = false;
  }
}
