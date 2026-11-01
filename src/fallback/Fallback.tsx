import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { bodies, getBody, getChildren } from '@/data';
import type { CelestialBody } from '@/data/types';
import { useInterface } from '@/state/interface';
import { porOrdem } from '@/state/navegacao';
import { useOrbita } from '@/state/store';
import { rotaParaHash } from '@/state/url';
import { Anunciador } from '@/ui/Anunciador';
import { useAtalhos } from '@/ui/atalhos';
import { Marca, Trilha } from '@/ui/BarraTopo';
import {
  agruparResultados,
  buscarCorpos,
  FILTROS,
  type Filtro,
  type ResultadoBusca,
} from '@/ui/catalogo/busca';
import { Destaque } from '@/ui/catalogo/Destaque';
import { aNome, deNome, rotuloTipo } from '@/ui/formatacao';
import { GrupoOpcoes } from '@/ui/GrupoOpcoes';
import { IconeBusca, IconeSeta } from '@/ui/icones';
import { aoPularParaConteudo, ID_CONTEUDO } from '@/ui/foco';
import { ConteudoAstro } from '@/ui/painel/ConteudoAstro';
import { ImagemAstro } from './ImagemAstro';
import './Fallback.css';

const Creditos = lazy(() => import('@/ui/modais/Creditos'));

const exploraveis = bodies.filter((c) => c.exploravel3D);
const contarLuas = (id: string) => getChildren(id, { exploravel3D: true }).length;
const OPCOES_FILTRO = FILTROS.map((f) => ({ valor: f.id, rotulo: f.rotulo }));

export default function Fallback() {
  const selecionado = useOrbita((s) => s.selecionado);
  const modo = useOrbita((s) => s.modo);
  const modal = useInterface((s) => s.modal);
  const abrirModal = useInterface((s) => s.abrirModal);
  const corpo = selecionado ? getBody(selecionado) : undefined;
  const rolagem = useRef<HTMLDivElement>(null);
  const primeiraVez = useRef(true);

  useAtalhos({ somenteNavegacao: true });

  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }
    rolagem.current?.scrollTo({ top: 0 });
    const titulo = rolagem.current?.querySelector<HTMLElement>('main h2[tabindex="-1"]');
    titulo?.focus({ preventScroll: true });
  }, [selecionado, modo]);

  return (
    <div ref={rolagem} className="fallback">
      <a className="pular" href={`#${ID_CONTEUDO}`} onClick={aoPularParaConteudo}>
        Pular para o conteúdo
      </a>
      <header className="fallback__topo">
        <h1 className="sr-only">Órbita — explorador do Sistema Solar (modo catálogo)</h1>
        <div className="fallback__linha">
          <Marca />
          <Trilha />
        </div>
        <button
          type="button"
          className="botao botao--sem-borda"
          aria-haspopup="dialog"
          onClick={() => abrirModal('creditos')}
        >
          Créditos
        </button>
      </header>

      <main id={ID_CONTEUDO} tabIndex={-1} className="fallback__principal">
        <p className="fallback__aviso" role="note">
          <strong>O 3D não está disponível neste dispositivo.</strong> O navegador não oferece
          WebGL, então o Órbita abriu em modo catálogo — com os mesmos dados, fontes e luas.
        </p>
        {corpo ? <Detalhe corpo={corpo} explorandoLuas={modo === 'luas'} /> : <VisaoGeral />}
      </main>

      <footer className="fallback__rodape">
        <p>
          Imagens ilustrativas. Os dados de cada astro trazem as fontes e a data de atualização.
        </p>
      </footer>

      <Suspense fallback={null}>{modal === 'creditos' && <Creditos />}</Suspense>
      <Anunciador />
    </div>
  );
}

function VisaoGeral() {
  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const grupos = useMemo(
    () => agruparResultados(buscarCorpos(exploraveis, consulta, filtro), getBody, contarLuas),
    [consulta, filtro],
  );
  const total = grupos.reduce((n, g) => n + g.itens.length, 0);

  return (
    <>
      <section className="fallback__intro" aria-labelledby="fallback-titulo">
        <h2 id="fallback-titulo" className="fallback__titulo" tabIndex={-1}>
          O universo começa com a sua curiosidade
        </h2>
        <p className="fallback__instrucao">Escolha um astro para explorar</p>
      </section>

      <div className="fallback__ferramentas">
        <div className="fallback__busca">
          <IconeBusca />
          <input
            type="search"
            aria-label="Buscar astro"
            placeholder="Buscar astro"
            autoComplete="off"
            spellCheck={false}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
        </div>
        <GrupoOpcoes<Filtro>
          rotulo="Filtrar por tipo"
          opcoes={OPCOES_FILTRO}
          valor={filtro}
          aoMudar={setFiltro}
        />
      </div>
      <p className="sr-only" role="status">
        {total ? `${total} astros` : 'Nenhum astro encontrado'}
      </p>

      {grupos.map((grupo) => (
        <section key={grupo.id} className="fallback__grupo" aria-labelledby={`fb-${grupo.id}`}>
          <h3 id={`fb-${grupo.id}`} className="fallback__grupo-titulo">
            {grupo.titulo}
          </h3>
          <Grade itens={grupo.itens} />
        </section>
      ))}
      {total === 0 && <p className="fallback__vazio">Nenhum astro encontrado.</p>}
    </>
  );
}

function Grade({ itens }: { itens: readonly ResultadoBusca[] }) {
  return (
    <ul role="list" className="grade">
      {itens.map(({ corpo, campo, trecho }) => (
        <li key={corpo.id}>
          <a
            className="cartao"
            href={rotaParaHash({ selecionado: corpo.id, modo: 'astro' })}
            style={{ '--cor-item': corpo.aparencia.corAcento } as CSSProperties}
          >
            <ImagemAstro corpo={corpo} tamanho="pequena" />
            <span className="cartao__tipo mono">{rotuloTipo(corpo.tipo)}</span>
            <span className="cartao__nome">
              <Destaque texto={corpo.nome} trecho={campo === 'nome' ? trecho : null} />
            </span>
            <span className="cartao__classe">
              <Destaque
                texto={corpo.conteudo.classificacao}
                trecho={campo === 'classificacao' ? trecho : null}
              />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Detalhe({ corpo, explorandoLuas }: { corpo: CelestialBody; explorandoLuas: boolean }) {
  const irParaVisaoGeral = useOrbita((s) => s.irParaVisaoGeral);
  const voltar = useOrbita((s) => s.voltar);
  const idTitulo = useId();
  const luas = getChildren(corpo.id, { exploravel3D: true }).sort(porOrdem);
  const pai = corpo.tipo === 'lua' && corpo.pai ? getBody(corpo.pai) : undefined;

  return (
    <>
      <nav className="fallback__navegacao" aria-label="Voltar">
        <button type="button" className="botao-texto" onClick={irParaVisaoGeral}>
          <IconeSeta />
          Voltar ao Sistema Solar
        </button>
        {(pai || explorandoLuas) && (
          <button type="button" className="botao-texto" onClick={voltar}>
            <IconeSeta />
            {explorandoLuas ? `Voltar ${aNome(corpo)}` : `Voltar ${aNome(pai!)}`}
          </button>
        )}
      </nav>

      <div className="detalhe">
        <ImagemAstro corpo={corpo} tamanho="grande" />
        <ConteudoAstro corpo={corpo} idTitulo={idTitulo} />
      </div>

      {explorandoLuas && luas.length > 0 && (
        <section className="fallback__grupo" aria-labelledby="fb-luas">
          <h3 id="fb-luas" className="fallback__grupo-titulo">
            Luas {deNome(corpo)} disponíveis
          </h3>
          <Grade itens={luas.map((c) => ({ corpo: c, campo: null, trecho: null }))} />
        </section>
      )}
    </>
  );
}
