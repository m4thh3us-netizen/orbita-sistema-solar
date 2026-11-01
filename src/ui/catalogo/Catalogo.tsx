import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { bodies, getBody, getChildren } from '@/data';
import { useInterface } from '@/state/interface';
import { useOrbita } from '@/state/store';
import { ID_BOTAO_CATALOGO } from '../atalhos';
import { focarConteudo } from '../foco';
import { plural } from '../formatacao';
import { GrupoOpcoes } from '../GrupoOpcoes';
import { IconeBusca, IconeFechar } from '../icones';
import { CONSULTA_LARGA, useLayoutCompacto, useMediaQuery } from '../midia';
import { useOcupacao } from '../ocupacao';
import { agruparResultados, buscarCorpos, FILTROS, type Filtro } from './busca';
import { Destaque } from './Destaque';
import './Catalogo.css';

const corposExploraveis = bodies.filter((c) => c.exploravel3D);
const contarLuas = (id: string) => getChildren(id, { exploravel3D: true }).length;
const idOpcao = (id: string) => `catalogo-opcao-${id}`;
const ID_LISTA = 'catalogo-lista';
const OPCOES_FILTRO = FILTROS.map((f) => ({ valor: f.id, rotulo: f.rotulo }));

export function Catalogo() {
  const aberto = useInterface((s) => s.catalogoAberto);
  const pedidoFoco = useInterface((s) => s.pedidoFocoBusca);
  const fecharCatalogo = useInterface((s) => s.fecharCatalogo);
  const selecionado = useOrbita((s) => s.selecionado);
  const selecionar = useOrbita((s) => s.selecionar);
  const setHover = useOrbita((s) => s.setHover);
  const compacto = useLayoutCompacto();
  const largo = useMediaQuery(CONSULTA_LARGA);

  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ativo, setAtivo] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const idTitulo = useId();

  const grupos = useMemo(
    () => agruparResultados(buscarCorpos(corposExploraveis, consulta, filtro), getBody, contarLuas),
    [consulta, filtro],
  );
  const plano = useMemo(() => grupos.flatMap((g) => g.itens.map((r) => r.corpo.id)), [grupos]);
  const indiceAtivo = plano.length ? Math.min(ativo, plano.length - 1) : -1;
  const idAtivo = indiceAtivo >= 0 ? plano[indiceAtivo] : null;

  useOcupacao(ref, 'left', aberto && !compacto);

  useEffect(() => {
    if (aberto && pedidoFoco > 0) campo.current?.focus();
  }, [aberto, pedidoFoco]);

  useEffect(() => {
    if (!idAtivo) return;
    document.getElementById(idOpcao(idAtivo))?.scrollIntoView?.({ block: 'nearest' });
  }, [idAtivo]);

  useEffect(() => {
    if (!aberto) setHover(null);
  }, [aberto, setHover]);

  const fechar = () => {
    fecharCatalogo();
    document.getElementById(ID_BOTAO_CATALOGO)?.focus();
  };

  const escolher = (id: string) => {
    selecionar(id);
    setHover(null);
    if (!largo) {
      fecharCatalogo();
      focarConteudo();
    }
  };

  const moverAtivo = (passo: 1 | -1) => {
    if (!plano.length) return;
    const proximo = (Math.max(indiceAtivo, 0) + passo + plano.length) % plano.length;
    setAtivo(proximo);
    setHover(plano[proximo]);
  };

  const aoTeclar = (e: KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (e.target !== campo.current) return;
        e.preventDefault();
        moverAtivo(e.key === 'ArrowDown' ? 1 : -1);
        break;
      case 'Enter':
        if (e.target !== campo.current || !idAtivo) return;
        e.preventDefault();
        escolher(idAtivo);
        break;
      case 'Escape':
        e.preventDefault();
        fechar();
        break;
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <aside
      ref={ref}
      id="catalogo"
      className={`catalogo${aberto ? ' catalogo--aberto' : ''}`}
      aria-labelledby={idTitulo}
      inert={!aberto}
      onKeyDown={aoTeclar}
    >
      <div className="catalogo__topo">
        <h2 id={idTitulo} className="catalogo__titulo">
          Catálogo
        </h2>
        <span className="catalogo__contagem mono" aria-hidden="true">
          {String(plano.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="botao botao--icone botao--sem-borda catalogo__fechar"
          aria-label="Fechar catálogo"
          onClick={fechar}
        >
          <IconeFechar />
        </button>
      </div>

      <div className="catalogo__busca">
        <IconeBusca />
        <input
          ref={campo}
          type="search"
          role="combobox"
          aria-label="Buscar astro"
          aria-expanded="true"
          aria-controls={ID_LISTA}
          aria-autocomplete="list"
          aria-activedescendant={idAtivo ? idOpcao(idAtivo) : undefined}
          placeholder="Buscar astro"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAtivo(0);
          }}
        />
        <kbd className="catalogo__tecla" aria-hidden="true">
          /
        </kbd>
      </div>

      <GrupoOpcoes
        rotulo="Filtrar por tipo"
        opcoes={OPCOES_FILTRO}
        valor={filtro}
        aoMudar={(f) => {
          setFiltro(f);
          setAtivo(0);
        }}
        className="segmentos catalogo__filtros"
      />

      <p className="sr-only" role="status">
        {aberto &&
          (plano.length
            ? `${plano.length} ${plural(plano.length, 'astro encontrado', 'astros encontrados')}`
            : 'Nenhum astro encontrado')}
      </p>

      <div id={ID_LISTA} role="listbox" aria-label="Astros" className="catalogo__lista">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            role="group"
            aria-labelledby={`catalogo-grupo-${grupo.id}`}
            className="catalogo__grupo"
          >
            <div
              role="presentation"
              id={`catalogo-grupo-${grupo.id}`}
              className="catalogo__grupo-titulo"
            >
              {grupo.titulo}
            </div>
            {grupo.itens.map(({ corpo, campo: campoAchado, trecho }) => {
              const indice = plano.indexOf(corpo.id);
              const atual = corpo.id === selecionado;
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  key={corpo.id}
                  id={idOpcao(corpo.id)}
                  role="option"
                  tabIndex={-1}
                  aria-selected={indice === indiceAtivo}
                  aria-current={atual ? 'true' : undefined}
                  className="catalogo__item"
                  style={{ '--cor-item': corpo.aparencia.corAcento } as CSSProperties}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => escolher(corpo.id)}
                  onMouseEnter={() => {
                    setAtivo(indice);
                    setHover(corpo.id);
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="catalogo__ponto" aria-hidden="true" />
                  <span className="catalogo__nome">
                    <Destaque texto={corpo.nome} trecho={campoAchado === 'nome' ? trecho : null} />
                  </span>
                  {atual && <span className="catalogo__atual mono">em foco</span>}
                  <span className="catalogo__classe mono">
                    <Destaque
                      texto={corpo.conteudo.classificacao}
                      trecho={campoAchado === 'classificacao' ? trecho : null}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {plano.length === 0 && (
        <p className="catalogo__vazio">
          Nenhum astro encontrado{consulta.trim() ? ` para “${consulta.trim()}”` : ''}.
        </p>
      )}
    </aside>
  );
}
