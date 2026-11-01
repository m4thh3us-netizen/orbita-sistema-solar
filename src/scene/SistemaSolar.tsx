/**
 * Sol, planetas e planetas anões, sempre presentes. As luas exploráveis só são montadas
 * no sistema em foco (astro selecionado, modo luas ou lua selecionada); na visão geral
 * nenhuma lua aparece.
 */
import { useMemo } from 'react';
import { bodies, getBody, getChildren } from '@/data';
import type { BodyId, CelestialBody } from '@/data/types';
import { useOrbita, type OrbitaState } from '@/state/store';
import { Astro } from './Astro';
import { referencialEquatorial } from './orbitas';

const GRAUS = Math.PI / 180;

function sistemaEmFoco(s: OrbitaState): BodyId | null {
  if (s.modo === 'visao-geral' || !s.selecionado) return null;
  const corpo = getBody(s.selecionado);
  if (!corpo) return null;
  return corpo.tipo === 'lua' ? corpo.pai : corpo.id;
}

function Luas({ planeta }: { planeta: CelestialBody }) {
  const luas = useMemo(() => getChildren(planeta.id, { exploravel3D: true }), [planeta.id]);
  return (
    <>
      {luas.map((lua) => (
        <group
          key={lua.id}
          rotation-x={referencialEquatorial(lua, planeta) ? planeta.fisico.inclinacaoAxialGraus * GRAUS : 0}
        >
          <Astro corpo={lua} pai={planeta} surgir />
        </group>
      ))}
    </>
  );
}

export function SistemaSolar() {
  const foco = useOrbita(sistemaEmFoco);
  const { sol, orbitantes } = useMemo(() => {
    const estrela = bodies.find((b) => b.tipo === 'estrela') ?? null;
    const lista = bodies
      .filter((b) => b.exploravel3D && (b.tipo === 'planeta' || b.tipo === 'planeta-anao') && b.orbita)
      .sort((a, b) => a.ordem - b.ordem);
    return { sol: estrela, orbitantes: lista };
  }, []);

  return (
    <>
      {sol && <Astro corpo={sol} />}
      {orbitantes.map((corpo) => (
        <Astro key={corpo.id} corpo={corpo} pai={sol ?? undefined}>
          {foco === corpo.id && <Luas planeta={corpo} />}
        </Astro>
      ))}
    </>
  );
}
