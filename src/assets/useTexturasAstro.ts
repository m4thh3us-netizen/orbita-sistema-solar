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

/** Leitura com Suspense + referência retida enquanto o componente existir. */
function useTexturaBase(caminho: string | undefined, tipo: TipoTextura): Texture | null {
  const textura = lerTextura(caminho, tipo, 'baixa');
  useEffect(() => reter(textura), [textura]);
  return textura;
}

/** Carregamento sob demanda, sem suspender. Libera a referência ao desativar. */
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
  // Desativada ou de outra chave: não usa (a referência já foi solta no cleanup).
  return chave && carregada?.chave === chave ? carregada.textura : null;
}

/**
 * Texturas da superfície de um astro (os anéis carregam as suas em <Aneis>). Suspende só
 * pelo conjunto base: mapa e nuvens em baixa resolução. Mapa em alta, normal, luzes
 * noturnas e especular chegam quando `detalhado` (astro selecionado ou pai da lua
 * selecionada) e são liberados quando deixa de ser.
 */
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
