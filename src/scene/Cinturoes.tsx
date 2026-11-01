import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  Euler,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type Group,
  type PerspectiveCamera,
} from 'three';
import { useOrbita } from '@/state/store';
import { KM_POR_UA, distanciaCena, velocidadeAngular } from './escala';
import { aleatorio, hashTexto } from './orbitas';
import { PRIORIDADE } from './prioridades';
import { PERFIS } from './qualidade';
import { useRelogio } from './relogioContexto';

interface ConfigCinturao {
  nome: string;
  uaMin: number;
  uaMax: number;
  dispersaoGraus: number;
  tamanho: [number, number];
  cores: string[];
  periodoDias: number;
  maxPx: number;
}

const ASTEROIDES: ConfigCinturao = {
  nome: 'asteroides',
  uaMin: 2.1,
  uaMax: 3.3,
  dispersaoGraus: 4,
  tamanho: [0.04, 0.2],
  cores: ['#8c847a', '#6f665d', '#a1968a', '#7d7064'],
  periodoDias: 1680,
  maxPx: 2.2,
};

const KUIPER: ConfigCinturao = {
  nome: 'kuiper',
  uaMin: 30,
  uaMax: 50,
  dispersaoGraus: 8,
  tamanho: [0.06, 0.24],
  cores: ['#7d8594', '#917d70', '#748094', '#887668'],
  periodoDias: 91_000,
  maxPx: 2.4,
};

function gaussiana(r: () => number): number {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
}

function criarCinturao(cfg: ConfigCinturao, quantidade: number): InstancedMesh {
  const geometria = new IcosahedronGeometry(1, 0);
  const material = new MeshStandardMaterial({ roughness: 1, metalness: 0, flatShading: true });
  const uniforms = { uMundoPorPx: { value: 0.001 }, uMaxPx: { value: cfg.maxPx } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uMundoPorPx;\nuniform float uMaxPx;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec4 orbCentro = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float orbTamanho = length(instanceMatrix[0].xyz);
          float orbMaximo = uMaxPx * uMundoPorPx * max(-orbCentro.z, 0.0);
          transformed *= min(1.0, orbMaximo / max(orbTamanho, 1e-5));
        #endif`,
      );
  };
  material.userData.uniforms = uniforms;
  const malha = new InstancedMesh(geometria, material, quantidade);
  const r = aleatorio(hashTexto(cfg.nome));
  const m = new Matrix4();
  const q = new Quaternion();
  const euler = new Euler();
  const pos = new Vector3();
  const esc = new Vector3();
  const cor = new Color();
  const paleta = cfg.cores.map((c) => new Color(c));
  for (let i = 0; i < quantidade; i++) {
    const ua = cfg.uaMin + (cfg.uaMax - cfg.uaMin) * ((r() + r()) / 2);
    const raio = distanciaCena(ua * KM_POR_UA, 'planeta-anao');
    const angulo = r() * Math.PI * 2;
    const inclinacao = gaussiana(r) * cfg.dispersaoGraus * (Math.PI / 180);
    pos.set(raio * Math.cos(angulo), raio * Math.sin(inclinacao) * 0.6, -raio * Math.sin(angulo));
    euler.set(r() * 6.28, r() * 6.28, r() * 6.28);
    q.setFromEuler(euler);
    const t = cfg.tamanho[0] + (cfg.tamanho[1] - cfg.tamanho[0]) * Math.pow(r(), 3);
    esc.set(t * (0.7 + r() * 0.6), t * (0.6 + r() * 0.5), t * (0.7 + r() * 0.6));
    m.compose(pos, q, esc);
    malha.setMatrixAt(i, m);
    cor.copy(paleta[Math.floor(r() * paleta.length)]).multiplyScalar(0.55 + r() * 0.7);
    malha.setColorAt(i, cor);
  }
  malha.instanceMatrix.needsUpdate = true;
  if (malha.instanceColor) malha.instanceColor.needsUpdate = true;
  malha.computeBoundingSphere();
  return malha;
}

function Cinturao({ cfg, quantidade }: { cfg: ConfigCinturao; quantidade: number }) {
  const relogio = useRelogio();
  const grupo = useRef<Group>(null);
  const malha = useMemo(() => criarCinturao(cfg, quantidade), [cfg, quantidade]);
  const omega = velocidadeAngular(cfg.periodoDias);
  useEffect(
    () => () => {
      malha.geometry.dispose();
      (malha.material as MeshStandardMaterial).dispose();
      malha.dispose();
    },
    [malha],
  );
  useFrame((estado) => {
    if (grupo.current && !useOrbita.getState().movimentoReduzido) grupo.current.rotation.y = omega * relogio.tempoOrbital;
    const camera = estado.camera as PerspectiveCamera;
    const u = (malha.material as MeshStandardMaterial).userData.uniforms;
    u.uMundoPorPx.value = (2 * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, estado.size.height);
  }, PRIORIDADE.corpos);
  return (
    <group ref={grupo}>
      <primitive object={malha} />
    </group>
  );
}

export function Cinturoes() {
  const qualidade = useOrbita((s) => s.qualidade);
  const perfil = PERFIS[qualidade];
  return (
    <>
      <Cinturao cfg={ASTEROIDES} quantidade={perfil.asteroides} />
      <Cinturao cfg={KUIPER} quantidade={perfil.kuiper} />
    </>
  );
}
