import { lazy, Suspense } from 'react';
import { useInterface } from '@/state/interface';
import { Anunciador } from './Anunciador';
import { useAtalhos } from './atalhos';
import { BarraTopo } from './BarraTopo';
import { Catalogo } from './catalogo/Catalogo';
import { aoPularParaConteudo, ID_CONTEUDO, useResgateDeFoco } from './foco';
import { Introducao } from './Introducao';
import { useLayoutCompacto } from './midia';
import { PainelInfo } from './painel/PainelInfo';
import { Rodape } from './Rodape';
import './Interface.css';

const Ajuda = lazy(() => import('./modais/Ajuda'));
const Creditos = lazy(() => import('./modais/Creditos'));

export function Interface() {
  const compacto = useLayoutCompacto();
  const catalogoAberto = useInterface((s) => s.catalogoAberto);
  const modal = useInterface((s) => s.modal);
  const fundoInerte = compacto && catalogoAberto;

  useAtalhos();
  useResgateDeFoco();

  return (
    <div className="interface">
      <a className="pular" href={`#${ID_CONTEUDO}`} onClick={aoPularParaConteudo}>
        Pular para o conteúdo
      </a>
      <div className="interface__camada" inert={fundoInerte}>
        <BarraTopo />
      </div>
      <Catalogo />
      <main id={ID_CONTEUDO} tabIndex={-1} className="interface__principal" inert={fundoInerte}>
        <Introducao />
        <PainelInfo />
      </main>
      <div className="interface__camada" inert={fundoInerte}>
        <Rodape />
      </div>
      <Suspense fallback={null}>
        {modal === 'ajuda' && <Ajuda />}
        {modal === 'creditos' && <Creditos />}
      </Suspense>
      <Anunciador />
    </div>
  );
}
