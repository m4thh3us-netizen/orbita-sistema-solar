import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type Group,
} from 'three';
import { useOrbita } from '@/state/store';
import { GLSL_RUIDO } from './materiais/glsl';
import { aleatorio, hashTexto } from './orbitas';
import { PRIORIDADE } from './prioridades';
import { PERFIS } from './qualidade';

const POLO_GALACTICO = new Vector3(-0.42, 0.82, 0.39).normalize();

const CAMADAS = [
  { raio: 2200, parallax: 0.06, fracao: 0.2, tamanho: [1.6, 3.2] },
  { raio: 2900, parallax: 0.03, fracao: 0.35, tamanho: [1.1, 2.4] },
  { raio: 3600, parallax: 0.012, fracao: 0.45, tamanho: [0.8, 1.7] },
] as const;

const VERTICE = /* glsl */ `
attribute float aTamanho;
attribute vec3 aCor;
attribute float aFase;
uniform float uTempo;
uniform float uPixelRatio;
uniform float uCintilar;
varying vec3 vCor;
void main() {
  float c = 1.0 + uCintilar * 0.28 * sin(uTempo * (0.8 + aFase * 2.2) + aFase * 40.0);
  vCor = aCor * c;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aTamanho * uPixelRatio;
}
`;

const FRAGMENTO = /* glsl */ `
varying vec3 vCor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.0, 1.0, d);
  gl_FragColor = vec4(vCor * a * a, 1.0);
  #include <colorspace_fragment>
}
`;

const FRAGMENTO_VIA_LACTEA = /* glsl */ `
uniform vec3 uPolo;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float faixa = exp(-pow(dot(d, uPolo) / 0.2, 2.0));
  float nuvem = 0.55 + 0.45 * orb_fbm(d * 3.5, 5);
  float poeira = smoothstep(0.1, 0.5, orb_fbm(d * 7.0 + 3.0, 4)) * exp(-pow(dot(d, uPolo) / 0.05, 2.0));
  float brilho = faixa * nuvem * (1.0 - poeira * 0.7) * 0.03;
  gl_FragColor = vec4(vec3(0.85, 0.82, 0.95) * brilho, 1.0);
  #include <colorspace_fragment>
}
`;

const VERTICE_VIA_LACTEA = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CORES = ['#9fb8ff', '#cad7ff', '#ffffff', '#fff4e0', '#ffd9a8', '#ffb98a'].map((c) => new Color(c));

function direcaoAleatoria(r: () => number, naFaixa: boolean, out: Vector3): Vector3 {
  const z = r() * 2 - 1;
  const t = r() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  out.set(s * Math.cos(t), z, s * Math.sin(t));
  if (naFaixa) {
    const h = out.dot(POLO_GALACTICO);
    out.addScaledVector(POLO_GALACTICO, -h * 0.85).normalize();
  }
  return out;
}

function criarCamada(indice: number, quantidade: number): Points {
  const cfg = CAMADAS[indice];
  const r = aleatorio(hashTexto(`estrelas:${indice}`));
  const pos = new Float32Array(quantidade * 3);
  const cor = new Float32Array(quantidade * 3);
  const tam = new Float32Array(quantidade);
  const fase = new Float32Array(quantidade);
  const d = new Vector3();
  for (let i = 0; i < quantidade; i++) {
    direcaoAleatoria(r, r() < 0.4, d).multiplyScalar(cfg.raio * (0.92 + r() * 0.16));
    pos.set([d.x, d.y, d.z], i * 3);
    const brilho = 0.12 + Math.pow(r(), 4) * 0.85;
    const c = CORES[Math.floor(r() * CORES.length)];
    cor.set([c.r * brilho, c.g * brilho, c.b * brilho], i * 3);
    tam[i] = cfg.tamanho[0] + (cfg.tamanho[1] - cfg.tamanho[0]) * Math.pow(r(), 2);
    fase[i] = r();
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(pos, 3));
  g.setAttribute('aCor', new BufferAttribute(cor, 3));
  g.setAttribute('aTamanho', new BufferAttribute(tam, 1));
  g.setAttribute('aFase', new BufferAttribute(fase, 1));
  const m = new ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uPixelRatio: { value: 1 }, uCintilar: { value: 1 } },
    vertexShader: VERTICE,
    fragmentShader: FRAGMENTO,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const pontos = new Points(g, m);
  pontos.frustumCulled = false;
  pontos.renderOrder = -10;
  return pontos;
}

export function CampoEstrelas() {
  const qualidade = useOrbita((s) => s.qualidade);
  const perfil = PERFIS[qualidade];
  const dpr = useThree((s) => s.viewport.dpr);
  const grupos = useRef<(Group | null)[]>([]);
  const tempo = useRef(0);

  const camadas = useMemo(
    () => CAMADAS.map((c, i) => criarCamada(i, Math.round(perfil.estrelas * c.fracao))),
    [perfil.estrelas],
  );
  const viaLactea = useMemo(() => {
    if (!perfil.viaLactea) return null;
    return {
      geometria: new SphereGeometry(4200, 48, 32),
      material: new ShaderMaterial({
        uniforms: { uPolo: { value: POLO_GALACTICO } },
        vertexShader: VERTICE_VIA_LACTEA,
        fragmentShader: GLSL_RUIDO + FRAGMENTO_VIA_LACTEA,
        side: BackSide,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending,
      }),
    };
  }, [perfil.viaLactea]);

  useEffect(
    () => () => {
      for (const c of camadas) {
        c.geometry.dispose();
        (c.material as ShaderMaterial).dispose();
      }
    },
    [camadas],
  );
  useEffect(
    () => () => {
      viaLactea?.geometria.dispose();
      viaLactea?.material.dispose();
    },
    [viaLactea],
  );

  useFrame((estado, dt) => {
    const reduzido = useOrbita.getState().movimentoReduzido;
    if (!reduzido) tempo.current += Math.min(dt, 0.1);
    const cam = estado.camera.position;
    camadas.forEach((pontos, i) => {
      const g = grupos.current[i];
      if (g) g.position.copy(cam).multiplyScalar(1 - CAMADAS[i].parallax);
      const u = (pontos.material as ShaderMaterial).uniforms;
      u.uTempo.value = tempo.current;
      u.uPixelRatio.value = dpr;
      u.uCintilar.value = reduzido ? 0 : 1;
    });
    const g = grupos.current[CAMADAS.length];
    if (g) g.position.copy(cam);
  }, PRIORIDADE.aposCamera);

  return (
    <>
      {camadas.map((pontos, i) => (
        <group key={i} ref={(g) => void (grupos.current[i] = g)}>
          <primitive object={pontos} />
        </group>
      ))}
      <group ref={(g) => void (grupos.current[CAMADAS.length] = g)}>
        {viaLactea && (
          <mesh geometry={viaLactea.geometria} material={viaLactea.material} renderOrder={-20} frustumCulled={false} />
        )}
      </group>
    </>
  );
}
