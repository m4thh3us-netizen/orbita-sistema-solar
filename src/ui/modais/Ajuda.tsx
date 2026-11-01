import type { ReactNode } from 'react';
import { useInterface } from '@/state/interface';
import { Modal } from './Modal';

const GESTOS_MOUSE: [string, string][] = [
  ['Arrastar', 'Girar a câmera ao redor do astro'],
  ['Rolar a roda', 'Aproximar ou afastar'],
  ['Botão direito + arrastar', 'Deslocar a câmera'],
  ['Clicar num astro ou nome', 'Selecionar e voar até ele'],
];

const GESTOS_TOQUE: [string, string][] = [
  ['Arrastar com um dedo', 'Girar a câmera'],
  ['Pinça', 'Aproximar ou afastar'],
  ['Arrastar com dois dedos', 'Deslocar a câmera'],
  ['Tocar num astro ou nome', 'Selecionar'],
  ['Arrastar a alça do painel', 'Expandir, recolher ou fechar (para baixo)'],
];

const ATALHOS: [string[], string][] = [
  [['Esc'], 'Voltar um nível ou fechar painel/modal'],
  [['Espaço'], 'Pausar ou retomar a simulação'],
  [['←', '→'], 'Astro anterior / próximo'],
  [['R'], 'Restaurar a câmera'],
  [['O'], 'Mostrar ou ocultar órbitas'],
  [['N'], 'Mostrar ou ocultar nomes'],
  [['/'], 'Buscar no catálogo'],
  [['?'], 'Abrir esta ajuda'],
];

function Tabela({ legenda, linhas }: { legenda: string; linhas: [ReactNode, string][] }) {
  return (
    <table className="tabela">
      <caption className="sr-only">{legenda}</caption>
      <tbody>
        {linhas.map(([acao, efeito], i) => (
          <tr key={i}>
            <th scope="row">{acao}</th>
            <td>{efeito}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Ajuda() {
  const fecharModal = useInterface((s) => s.fecharModal);

  return (
    <Modal titulo="Como explorar" aoFechar={fecharModal}>
      <p className="modal__intro">
        Escolha um astro no catálogo ou direto na cena. O painel mostra dados, fontes e as luas
        disponíveis; a trilha no topo leva de volta a qualquer nível.
      </p>
      <section className="modal__secao" aria-labelledby="ajuda-atalhos">
        <h3 id="ajuda-atalhos" className="modal__subtitulo">
          Atalhos de teclado
        </h3>
        <Tabela
          legenda="Atalhos de teclado"
          linhas={ATALHOS.map(([teclas, efeito]) => [
            <span key={efeito}>
              {teclas.map((t, i) => (
                <span key={t}>
                  {i > 0 && ' '}
                  <kbd>{t}</kbd>
                </span>
              ))}
            </span>,
            efeito,
          ])}
        />
        <p className="modal__nota">Os atalhos ficam desativados enquanto você digita na busca.</p>
      </section>
      <section className="modal__secao" aria-labelledby="ajuda-mouse">
        <h3 id="ajuda-mouse" className="modal__subtitulo">
          Mouse
        </h3>
        <Tabela legenda="Gestos com mouse" linhas={GESTOS_MOUSE} />
      </section>
      <section className="modal__secao" aria-labelledby="ajuda-toque">
        <h3 id="ajuda-toque" className="modal__subtitulo">
          Toque
        </h3>
        <Tabela legenda="Gestos de toque" linhas={GESTOS_TOQUE} />
      </section>
    </Modal>
  );
}
