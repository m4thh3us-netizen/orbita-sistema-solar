import { useState, type CSSProperties } from 'react';
import type { CelestialBody } from '@/data/types';
import { urlPublica } from '@/ui/formatacao';

/**
 * Imagem estática: o `mapa` da textura recortado num disco com sombreamento,
 * ou um círculo na `corBase` se não houver textura (ou ela falhar).
 * Decorativa — o nome do astro está sempre no texto ao lado.
 */
export function ImagemAstro({
  corpo,
  tamanho,
}: {
  corpo: CelestialBody;
  tamanho: 'pequena' | 'grande';
}) {
  const mapa = corpo.aparencia.texturas.mapa;
  const [falhou, setFalhou] = useState(false);

  return (
    <span
      className={`imagem-astro imagem-astro--${tamanho}`}
      data-tipo={corpo.tipo}
      style={{ '--cor-base': corpo.aparencia.corBase } as CSSProperties}
      aria-hidden="true"
    >
      {mapa && !falhou && (
        <img
          src={urlPublica(mapa)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFalhou(true)}
        />
      )}
    </span>
  );
}
