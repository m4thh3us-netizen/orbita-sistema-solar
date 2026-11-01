import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Vector3, type Mesh, type ShaderMaterial, type Texture } from 'three';
import { criarPerfilAneis } from '@/assets/perfilAneis';
import { lerTextura, reter, temAlfa } from '@/assets/texturas';
import type { CelestialBody } from '@/data/types';
import { useOrbita } from '@/state/store';
import { criarGeometriaAneis, criarMaterialAneis } from './materiais/aneis';
import { PRIORIDADE } from './prioridades';
import { PERFIS } from './qualidade';

interface Props {
  corpo: CelestialBody;
  raioPlaneta: number;
}

const escala = new Vector3();

function MalhaAneis({ corpo, raioPlaneta, textura }: Props & { textura: Texture | null }) {
  const aneis = corpo.aparencia.aneis!;
  const raioKm = corpo.fisico.raioMedioKm;
  const interno = (raioPlaneta * aneis.raioInternoKm) / raioKm;
  const externo = (raioPlaneta * aneis.raioExternoKm) / raioKm;
  const ref = useRef<Mesh>(null);

  const geometria = useMemo(() => criarGeometriaAneis(interno, externo), [interno, externo]);
  const perfil = useMemo(
    () => (textura ? null : criarPerfilAneis(corpo.id, aneis.raioInternoKm, aneis.raioExternoKm)),
    [textura, corpo.id, aneis.raioInternoKm, aneis.raioExternoKm],
  );
  const material = useMemo(
    () =>
      criarMaterialAneis({
        textura: (textura ?? perfil)!,
        texturaSemAlfa: textura ? !temAlfa(textura) : false,
        tinta: textura ? '#ffffff' : corpo.aparencia.corBase,
      }),
    [textura, perfil, corpo.aparencia.corBase],
  );

  useEffect(
    () => () => {
      geometria.dispose();
      material.dispose();
      perfil?.dispose();
    },
    [geometria, material, perfil],
  );

  useFrame(() => {
    const m = ref.current;
    if (!m?.parent) return;
    const u = (material as ShaderMaterial).uniforms;
    m.parent.getWorldPosition(u.uCentroPlaneta.value as Vector3);
    u.uRaioPlaneta.value = raioPlaneta * m.parent.getWorldScale(escala).x;
    u.uSombra.value = PERFIS[useOrbita.getState().qualidade].sombraAneis ? 1 : 0;
  }, PRIORIDADE.aposCamera);

  return <mesh ref={ref} geometry={geometria} material={material} renderOrder={1} />;
}

function AneisTexturizados(props: Props) {
  const textura = lerTextura(props.corpo.aparencia.texturas.aneis, 'aneis', 'baixa');
  useEffect(() => reter(textura), [textura]);
  return <MalhaAneis {...props} textura={textura} />;
}

export function Aneis(props: Props) {
  if (!props.corpo.aparencia.aneis) return null;
  return (
    <Suspense fallback={<MalhaAneis {...props} textura={null} />}>
      <AneisTexturizados {...props} />
    </Suspense>
  );
}
