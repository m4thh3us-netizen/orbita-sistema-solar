import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { useTexturasAstro, type TexturasAstro } from '@/assets/useTexturasAstro';
import type { CelestialBody } from '@/data/types';
import { useOrbita } from '@/state/store';
import type { AparenciaCena } from './estilos';
import { esferaUnitaria } from './geometrias';
import { criarMaterialSol } from './materiais/sol';
import { criarMaterialSuperficie } from './materiais/superficie';
import { aplicarTexturaNuvens, aplicarTexturasTerra, criarMaterialNuvens, criarMaterialTerra } from './materiais/terra';
import { PRIORIDADE } from './prioridades';
import { PERFIS } from './qualidade';
import { useRelogio } from './relogioContexto';

interface Props {
  corpo: CelestialBody;
  aparencia: AparenciaCena;
  raio: number;
  detalhado: boolean;
}

function useSegmentos(raio: number): number {
  const qualidade = useOrbita((s) => s.qualidade);
  const base = PERFIS[qualidade].segmentosEsfera;
  return raio > 0.45 ? base : Math.round(base * 0.6);
}

function MalhaPadrao({ corpo, aparencia, raio, texturas }: Omit<Props, 'detalhado'> & { texturas: TexturasAstro | null }) {
  const segmentos = useSegmentos(raio);
  const material = useMemo(() => criarMaterialSuperficie(corpo, aparencia.estilo), [corpo, aparencia.estilo]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    material.map = texturas?.mapa ?? null;
    material.normalMap = texturas?.normal ?? null;
    material.needsUpdate = true;
  }, [material, texturas?.mapa, texturas?.normal]);
  const [fx, fy, fz] = aparencia.estilo.forma ?? [1, 1, 1];
  return <mesh geometry={esferaUnitaria(segmentos)} material={material} scale={[raio * fx, raio * fy, raio * fz]} />;
}

function MalhaTerra({ raio, texturas }: { raio: number; texturas: TexturasAstro | null }) {
  const segmentos = useSegmentos(raio);
  const relogio = useRelogio();
  const nuvens = useRef<Mesh>(null);
  const material = useMemo(() => criarMaterialTerra(), []);
  const materialNuvens = useMemo(() => criarMaterialNuvens(), []);
  useEffect(
    () => () => {
      material.dispose();
      materialNuvens.dispose();
    },
    [material, materialNuvens],
  );
  useEffect(() => {
    aplicarTexturasTerra(material, {
      mapa: texturas?.mapa ?? null,
      noite: texturas?.noite ?? null,
      especular: texturas?.especular ?? null,
    });
    aplicarTexturaNuvens(materialNuvens, texturas?.nuvens ?? null);
  }, [material, materialNuvens, texturas?.mapa, texturas?.noite, texturas?.especular, texturas?.nuvens]);

  useFrame(() => {
    if (nuvens.current) nuvens.current.rotation.y = relogio.tempoRotacao * 0.012;
  }, PRIORIDADE.corpos);

  const geometria = esferaUnitaria(segmentos);
  return (
    <>
      <mesh geometry={geometria} material={material} scale={raio} />
      <mesh ref={nuvens} geometry={geometria} material={materialNuvens} scale={raio * 1.008} renderOrder={1} />
    </>
  );
}

function MalhaSol({ corpo, raio }: { corpo: CelestialBody; raio: number }) {
  const material = useMemo(() => criarMaterialSol(corpo.aparencia.corBase), [corpo.aparencia.corBase]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    if (!useOrbita.getState().movimentoReduzido) (material as ShaderMaterial).uniforms.uTempo.value += Math.min(dt, 0.1);
  }, PRIORIDADE.corpos);
  return <mesh geometry={esferaUnitaria(96)} material={material} scale={raio} />;
}

function Malha({ texturas, ...props }: Omit<Props, 'detalhado'> & { texturas: TexturasAstro | null }) {
  switch (props.aparencia.material) {
    case 'sol':
      return <MalhaSol corpo={props.corpo} raio={props.raio} />;
    case 'terra':
      return <MalhaTerra raio={props.raio} texturas={texturas} />;
    default:
      return <MalhaPadrao {...props} texturas={texturas} />;
  }
}

function MalhaTexturizada({ detalhado, ...props }: Props) {
  const qualidade = useOrbita((s) => s.qualidade);
  const usarNormal = props.aparencia.material === 'padrao';
  const texturas = useTexturasAstro(props.corpo, detalhado, PERFIS[qualidade].texturaAlta, usarNormal);
  return <Malha {...props} texturas={texturas} />;
}

export function Superficie(props: Props) {
  const { detalhado, ...semDetalhe } = props;
  if (props.aparencia.material === 'sol') return <Malha {...semDetalhe} texturas={null} />;
  return (
    <Suspense fallback={<Malha {...semDetalhe} texturas={null} />}>
      <MalhaTexturizada {...semDetalhe} detalhado={detalhado} />
    </Suspense>
  );
}
