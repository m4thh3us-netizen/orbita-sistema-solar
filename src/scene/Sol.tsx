import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { PlaneGeometry, type Mesh, type ShaderMaterial } from 'three';
import { useOrbita } from '@/state/store';
import { COR_LUZ_SOL, LUZ_SOL } from './materiais/constantes';
import { criarMaterialCoroa } from './materiais/sol';
import { PRIORIDADE } from './prioridades';

const ALCANCE_COROA = 3.4;
const QUAD = new PlaneGeometry(2, 2);

export function LuzECoroaSolar({ raio, corBase }: { raio: number; corBase: string }) {
  const coroa = useRef<Mesh>(null);
  const material = useMemo(() => criarMaterialCoroa(corBase, 1 / ALCANCE_COROA), [corBase]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((estado, dt) => {
    const m = coroa.current;
    if (!m) return;
    m.quaternion.copy(estado.camera.quaternion);
    if (!useOrbita.getState().movimentoReduzido) (material as ShaderMaterial).uniforms.uTempo.value += Math.min(dt, 0.1);
  }, PRIORIDADE.aposCamera);

  return (
    <>
      <pointLight position={[0, 0, 0]} intensity={LUZ_SOL} decay={0} color={COR_LUZ_SOL} />
      <mesh ref={coroa} geometry={QUAD} material={material} scale={raio * ALCANCE_COROA} renderOrder={3} />
    </>
  );
}
