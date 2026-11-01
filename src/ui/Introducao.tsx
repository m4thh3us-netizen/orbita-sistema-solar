import { useInterface } from '@/state/interface';
import { useOrbita } from '@/state/store';
import { IconeCatalogo } from './icones';

export function Introducao() {
  const visivel = useOrbita((s) => s.selecionado === null);
  const carregado = useInterface((s) => s.carregado);
  const abrirCatalogo = useInterface((s) => s.abrirCatalogo);

  return (
    <section
      className={`introducao${visivel && carregado ? ' introducao--visivel' : ''}`}
      aria-labelledby="introducao-titulo"
      inert={!visivel}
    >
      <h2 id="introducao-titulo" className="introducao__titulo">
        O universo começa com a sua curiosidade
      </h2>
      <p className="introducao__instrucao">Escolha um astro para explorar</p>
      <div className="introducao__acoes">
        <button type="button" className="botao botao--acento" onClick={() => abrirCatalogo(true)}>
          <IconeCatalogo />
          Abrir catálogo
        </button>
        <p className="introducao__dica mono">
          ou use <kbd>←</kbd> <kbd>→</kbd> para percorrer
        </p>
      </div>
    </section>
  );
}
