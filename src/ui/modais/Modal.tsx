import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconeFechar } from '../icones';
import './Modal.css';

interface Props {
  titulo: string;
  aoFechar(): void;
  children: ReactNode;
}

export function Modal({ titulo, aoFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const fecharRef = useRef(aoFechar);

  useEffect(() => {
    fecharRef.current = aoFechar;
  }, [aoFechar]);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialogo.open) {
      if (typeof dialogo.showModal === 'function') dialogo.showModal();
      else dialogo.setAttribute('open', '');
    }
    return () => {
      if (dialogo.open) dialogo.close?.();
      anterior?.focus({ preventScroll: true });
    };
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        fecharRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) fecharRef.current();
      }}
    >
      <div className="modal__caixa">
        <header className="modal__topo">
          <h2 id={idTitulo} className="modal__titulo">
            {titulo}
          </h2>
          <button
            type="button"
            className="botao botao--icone botao--sem-borda"
            aria-label="Fechar"
            onClick={() => fecharRef.current()}
          >
            <IconeFechar />
          </button>
        </header>
        <div className="modal__corpo">{children}</div>
      </div>
    </dialog>
  );
}
