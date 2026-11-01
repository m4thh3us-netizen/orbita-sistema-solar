import { useEffect, useState } from 'react';
import type { Texture } from 'three';
import type { CelestialBody } from '@/data/types';
import { lerTextura, pedirTextura, reter, type NivelTextura, type TipoTextura } from './texturas';

export interface TexturasAstro {
  mapa: Texture | null;
  normal: Texture | null;
  noite: Texture | null;
  nuvens: Texture | null;
  especular: Texture | null;
}

function useTexturaBase(caminho: string | undefined, tipo: TipoTextura): Texture | null {
  const textura = lerTextura(caminho, tipo, 'baixa');
  useEffect(() => reter(textura), [textura]);
  return textura;
}

function useTexturaSobDemanda(
  caminho: string | undefined,
  tipo: TipoTextura,
  nivel: NivelTextura,
  ativo: boolean,
): Texture | null {
  const chave = ativo && caminho ? `${nivel}|${tipo}|${caminho}` : null;
  const [carregada, setCarregada] = useState<{ chave: string; textura: Texture | null } | null>(null);
  useEffect(() => {
    if (!chave || !caminho) return;
    let vivo = true;
    let soltar = () => {};
    pedirTextura(caminho, tipo, nivel, (t) => {
      if (!vivo) return;
      soltar = reter(t);
      setCarregada({ chave, textura: t });
    });
    return () => {
      vivo = false;
      soltar();
    };
  }, [chave, caminho, tipo, nivel]);
  return chave && carregada?.chave === chave ? carregada.textura : null;
}

export function useTexturasAstro(
  corpo: CelestialBody,
  detalhado: boolean,
  permitirAlta: boolean,
  usarNormal = true,
): TexturasAstro {
  const t = corpo.aparencia.texturas;
  const mapaBaixa = useTexturaBase(t.mapa, 'mapa');
  const nuvens = useTexturaBase(t.nuvens, 'nuvens');
  const mapaAlta = useTexturaSobDemanda(t.mapa, 'mapa', 'alta', detalhado && permitirAlta);
  const normal = useTexturaSobDemanda(t.normal, 'normal', 'alta', detalhado && usarNormal);
  const noite = useTexturaSobDemanda(t.noite, 'noite', 'alta', detalhado);
  const especular = useTexturaSobDemanda(t.especular, 'especular', 'alta', detalhado);
  return { mapa: mapaAlta ?? mapaBaixa, normal, noite, nuvens, especular };
}
