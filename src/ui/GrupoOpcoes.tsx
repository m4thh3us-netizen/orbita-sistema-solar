import { useRef, type KeyboardEvent, type ReactNode } from 'react';

interface Opcao<T> {
  valor: T;
  rotulo: ReactNode;
  rotuloAcessivel?: string;
}

interface Props<T> {
  rotulo: string;
  opcoes: readonly Opcao<T>[];
  valor: T;
  aoMudar(valor: T): void;
  className?: string;
}

/** Radiogroup ARIA com tabindex móvel: Tab entra na opção marcada; setas, Home e End trocam. */
export function GrupoOpcoes<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  className = 'segmentos',
}: Props<T>) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const marcado = opcoes.findIndex((o) => o.valor === valor);

  const aoTeclar = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const ultimo = opcoes.length - 1;
    const destino = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowDown: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      ArrowUp: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    aoMudar(opcoes[destino].valor);
    botoes.current[destino]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={rotulo} className={className}>
      {opcoes.map((opcao, i) => {
        const ativo = opcao.valor === valor;
        return (
          <button
            key={String(opcao.valor)}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={opcao.rotuloAcessivel}
            tabIndex={ativo || (marcado === -1 && i === 0) ? 0 : -1}
            onClick={() => aoMudar(opcao.valor)}
            onKeyDown={(e) => aoTeclar(e, i)}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
