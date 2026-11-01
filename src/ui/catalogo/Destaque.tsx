import type { Trecho } from './busca';

/** Texto com o trecho buscado envolvido em <mark>. */
export function Destaque({ texto, trecho }: { texto: string; trecho: Trecho | null }) {
  if (!trecho) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, trecho.inicio)}
      <mark className="destaque">{texto.slice(trecho.inicio, trecho.fim)}</mark>
      {texto.slice(trecho.fim)}
    </>
  );
}
