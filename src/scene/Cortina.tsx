import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, type Mesh } from 'three';
import { cortina } from '@/camera/cortina';
import { COR_FUNDO } from './materiais/constantes';
import { PRIORIDADE } from './prioridades';

export function Cortina() {
  const ref = useRef<Mesh>(null);
  const { geometria, material } = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const m = new ShaderMaterial({
      uniforms: { uCor: { value: new Color(COR_FUNDO) }, uOpacidade: { value: 0 } },
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `uniform vec3 uCor; uniform float uOpacidade;
        void main() { gl_FragColor = vec4(uCor, uOpacidade);
        #include <colorspace_fragment>
        }`,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { geometria: g, material: m };
  }, []);

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.visible = cortina.opacidade > 0.001;
    material.uniforms.uOpacidade.value = cortina.opacidade;
  }, PRIORIDADE.aposCamera);

  return <mesh ref={ref} geometry={geometria} material={material} frustumCulled={false} renderOrder={1000} visible={false} />;
}
