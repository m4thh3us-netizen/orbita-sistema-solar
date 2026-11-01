import { useEffect, useMemo } from 'react';
import { criarMaterialHalo, criarMaterialVeu, densidadeVeu, espessuraHalo } from './materiais/atmosfera';
import { esferaUnitaria } from './geometrias';

export function Atmosfera({ raio, cor, intensidade }: { raio: number; cor: string; intensidade: number }) {
  const halo = useMemo(() => criarMaterialHalo(cor, intensidade), [cor, intensidade]);
  const veu = useMemo(() => criarMaterialVeu(cor, intensidade, densidadeVeu(intensidade)), [cor, intensidade]);
  useEffect(
    () => () => {
      halo.dispose();
      veu.dispose();
    },
    [halo, veu],
  );
  const geometria = esferaUnitaria(64);
  return (
    <>
      <mesh geometry={geometria} material={veu} scale={raio * 1.012} renderOrder={2} />
      <mesh geometry={geometria} material={halo} scale={raio * espessuraHalo(intensidade)} renderOrder={2} />
    </>
  );
}
