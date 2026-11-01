/**
 * Órbita em linha de 1 px. Mais clara logo atrás do astro e esmaecendo ao longo da
 * volta (rastro), na cor de acento quando o astro está em hover ou selecionado.
 */
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, Color, LineLoop, ShaderMaterial } from 'three';
import { getBody } from '@/data';
import type { CelestialBody } from '@/data/types';
import { useOrbita } from '@/state/store';
import { amostrarOrbita, anomaliaMedia, type ElementosOrbitais } from './orbitas';
import { PRIORIDADE } from './prioridades';
import { useRelogio } from './relogioContexto';

const VERTICE = /* glsl */ `
attribute float aFase;
uniform float uFase;
uniform float uSentido;
varying float vAtras;
void main() {
  vAtras = fract(uSentido * (uFase - aFase));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENTO = /* glsl */ `
uniform vec3 uCor;
uniform float uOpacidade;
varying float vAtras;
void main() {
  float rastro = 1.0 - smoothstep(0.0, 0.5, vAtras);
  gl_FragColor = vec4(uCor, uOpacidade * (0.35 + 0.65 * rastro));
  #include <colorspace_fragment>
}
`;

const COR_NEUTRA = new Color('#E8E6E1');
const OPACIDADE_BASE: Record<CelestialBody['tipo'], number> = {
  estrela: 0,
  planeta: 0.16,
  'planeta-anao': 0.09,
  lua: 0.18,
};

export function LinhaOrbita({ corpo, elementos }: { corpo: CelestialBody; elementos: ElementosOrbitais }) {
  const relogio = useRelogio();
  const mostrar = useOrbita((s) => s.mostrarOrbitas);

  const linha = useMemo(() => {
    const { posicoes, fases } = amostrarOrbita(elementos, corpo.tipo === 'lua' ? 160 : 320);
    const geometria = new BufferGeometry();
    geometria.setAttribute('position', new BufferAttribute(posicoes, 3));
    geometria.setAttribute('aFase', new BufferAttribute(fases, 1));
    const material = new ShaderMaterial({
      uniforms: {
        uFase: { value: 0 },
        uSentido: { value: Math.sign(elementos.movimentoMedio) || 1 },
        uCor: { value: COR_NEUTRA.clone() },
        uOpacidade: { value: 0 },
      },
      vertexShader: VERTICE,
      fragmentShader: FRAGMENTO,
      transparent: true,
      depthWrite: false,
    });
    const l = new LineLoop(geometria, material);
    l.frustumCulled = false;
    return l;
  }, [elementos, corpo.tipo]);

  useEffect(
    () => () => {
      linha.geometry.dispose();
      (linha.material as ShaderMaterial).dispose();
    },
    [linha],
  );

  const acento = useMemo(() => new Color(corpo.aparencia.corAcento), [corpo.aparencia.corAcento]);

  useFrame((_, dt) => {
    const s = useOrbita.getState();
    const material = linha.material as ShaderMaterial;
    const u = material.uniforms;
    u.uFase.value = anomaliaMedia(elementos, relogio.tempoOrbital) / (Math.PI * 2);
    const emFoco = s.modo !== 'visao-geral' && s.selecionado === corpo.id;
    const destacado = s.hover === corpo.id || emFoco;
    // Na vista de um astro, órbitas de fora do sistema em foco quase somem para não
    // cruzarem o primeiro plano; as luas (só montadas no sistema em foco) ficam normais.
    const foraDoFoco = s.modo !== 'visao-geral' && corpo.tipo !== 'lua' && !emFoco && getBody(s.selecionado ?? '')?.pai !== corpo.id;
    const alvo = s.hover === corpo.id ? 0.6 : emFoco ? 0.4 : OPACIDADE_BASE[corpo.tipo] * (foraDoFoco ? 0.3 : 1);
    const k = s.movimentoReduzido ? 1 : 1 - Math.exp(-dt * 10);
    u.uOpacidade.value += (alvo - u.uOpacidade.value) * k;
    (u.uCor.value as Color).lerp(destacado ? acento : COR_NEUTRA, k);
  }, PRIORIDADE.corpos);

  return <primitive object={linha} visible={mostrar} />;
}
