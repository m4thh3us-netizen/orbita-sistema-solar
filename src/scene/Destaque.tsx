import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, PlaneGeometry, ShaderMaterial, Vector3, type Mesh, type PerspectiveCamera } from 'three';
import type { BodyId } from '@/data/types';
import { useOrbita } from '@/state/store';
import { PRIORIDADE } from './prioridades';
import { registro } from './registro';

const VERTICE = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENTO = /* glsl */ `
uniform vec3 uCor;
uniform float uOpacidade;
varying vec2 vUv;
void main() {
  float d = length(vUv * 2.0 - 1.0);
  float w = fwidth(d);
  float linha = 1.0 - smoothstep(0.0, w * 1.5, abs(d - 0.97));
  float brilho = d < 0.97 ? exp(-(0.97 - d) * 14.0) * 0.18 : 0.0;
  float a = (linha + brilho) * uOpacidade;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uCor, a);
  #include <colorspace_fragment>
}
`;

const PX_MINIMO = 16;
const posicao = new Vector3();

export function Destaque() {
  const ref = useRef<Mesh>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const altura = useThree((s) => s.size.height);
  const opacidade = useRef(0);
  const ultimo = useRef<BodyId | null>(null);
  const geometria = useMemo(() => new PlaneGeometry(2, 2), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uCor: { value: new Color('#ffffff') }, uOpacidade: { value: 0 } },
        vertexShader: VERTICE,
        fragmentShader: FRAGMENTO,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const s = useOrbita.getState();
    const emFoco = s.modo !== 'visao-geral' ? s.selecionado : null;
    const id = s.hover && s.hover !== emFoco ? s.hover : null;
    if (id) ultimo.current = id;
    const k = s.movimentoReduzido ? 1 : 1 - Math.exp(-dt * 14);
    opacidade.current += ((id ? 1 : 0) - opacidade.current) * k;
    const entrada = registro.obter(ultimo.current);
    if (!entrada || opacidade.current < 0.01) {
      m.visible = false;
      return;
    }
    entrada.objeto.getWorldPosition(posicao);
    const distancia = posicao.distanceTo(camera.position);
    const mundoPorPx = (2 * distancia * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, altura);
    m.visible = true;
    m.position.copy(posicao);
    m.quaternion.copy(camera.quaternion);
    m.scale.setScalar(Math.max(entrada.raioVisual * 1.3, PX_MINIMO * mundoPorPx));
    material.uniforms.uOpacidade.value = opacidade.current * 0.9;
    (material.uniforms.uCor.value as Color).set(entrada.corAcento);
  }, PRIORIDADE.aposCamera);

  return <mesh ref={ref} geometry={geometria} material={material} visible={false} renderOrder={5} />;
}
