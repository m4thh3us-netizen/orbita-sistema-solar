/**
 * Esfera de colisão invisível, maior que o astro: max(raio × 2,5; 14 px na tela, 22 px
 * em telas de toque). Assim Mercúrio, Ceres e Fobos são fáceis de acertar. O astro
 * selecionado encolhe o colisor ao próprio raio, para o cursor não virar "mãozinha" na
 * tela inteira. Toque não gera hover; clique só seleciona se o ponteiro quase não se moveu.
 */
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3, type Mesh, type PerspectiveCamera } from 'three';
import type { BodyId } from '@/data/types';
import { useOrbita } from '@/state/store';
import type { DadosColisor } from './eventos';
import { ESFERA_COLISOR } from './geometrias';
import { PRIORIDADE } from './prioridades';

const FATOR_RAIO = 2.5;
const PX_MIN_MOUSE = 14;
const PX_MIN_TOQUE = 22;
/** Movimento máximo (px) entre apertar e soltar para contar como clique, não arrasto. */
const LIMITE_CLIQUE_MOUSE = 5;
const LIMITE_CLIQUE_TOQUE = 12;

const centro = new Vector3();
const escala = new Vector3();

function telaDeToque(): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

function tipoPonteiro(e: ThreeEvent<PointerEvent | MouseEvent>): string {
  return 'pointerType' in e.nativeEvent ? (e.nativeEvent as PointerEvent).pointerType || 'mouse' : 'mouse';
}

export function Colisor({ corpoId, raio }: { corpoId: BodyId; raio: number }) {
  const ref = useRef<Mesh>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const altura = useThree((s) => s.size.height);
  const gl = useThree((s) => s.gl);
  const pxMinimo = useMemo(() => (telaDeToque() ? PX_MIN_TOQUE : PX_MIN_MOUSE), []);
  const dados = useMemo<DadosColisor>(() => ({ corpoId, raioMalha: raio }), [corpoId, raio]);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const s = useOrbita.getState();
    const emFoco = s.modo !== 'visao-geral' && s.selecionado === corpoId;
    m.getWorldPosition(centro);
    // O grupo pai pode estar escalado (luas surgindo); o colisor compensa.
    const escalaPai = m.parent ? m.parent.getWorldScale(escala).x || 1 : 1;
    const distancia = centro.distanceTo(camera.position);
    const mundoPorPx = (2 * distancia * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, altura);
    const r = emFoco ? raio : Math.max(raio * FATOR_RAIO, pxMinimo * mundoPorPx);
    m.scale.setScalar(r / escalaPai);
  }, PRIORIDADE.aposCamera);

  const aoEntrar = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (tipoPonteiro(e) === 'touch') return;
    const s = useOrbita.getState();
    if (s.modo !== 'visao-geral' && s.selecionado === corpoId) return;
    gl.domElement.style.cursor = 'pointer';
    s.setHover(corpoId);
  };

  const aoSair = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    gl.domElement.style.cursor = '';
    const s = useOrbita.getState();
    if (s.hover === corpoId) s.setHover(null);
  };

  const aoClicar = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const limite = tipoPonteiro(e) === 'touch' ? LIMITE_CLIQUE_TOQUE : LIMITE_CLIQUE_MOUSE;
    if (e.delta > limite) return;
    gl.domElement.style.cursor = '';
    const s = useOrbita.getState();
    s.setHover(null);
    s.selecionar(corpoId);
  };

  return (
    <mesh
      ref={ref}
      geometry={ESFERA_COLISOR}
      visible={false}
      userData={{ colisor: dados }}
      onPointerOver={aoEntrar}
      onPointerOut={aoSair}
      onClick={aoClicar}
    />
  );
}
