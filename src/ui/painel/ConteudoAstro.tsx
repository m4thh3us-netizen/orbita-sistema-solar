import { useEffect, useId, useMemo, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { getBody } from '@/data';
import type { CelestialBody, Dado, Secao } from '@/data/types';
import { useInterface, type Aba } from '@/state/interface';
import { useOrbita } from '@/state/store';
import { aNome, deNome, formatarData, rotuloTipo } from '../formatacao';
import { IconeExterno, IconeSeta } from '../icones';
import { ABAS, abasDisponiveis, resolverAba } from './abas';
import { AbaLuas } from './AbaLuas';
import './ConteudoAstro.css';

interface Props {
  corpo: CelestialBody;
  idTitulo: string;
}

/**
 * Conteúdo científico de um astro em HTML semântico. Usado no painel lateral,
 * no bottom sheet e no fallback sem WebGL.
 */
export function ConteudoAstro({ corpo, idTitulo }: Props) {
  const modo = useOrbita((s) => s.modo);
  const voltar = useOrbita((s) => s.voltar);
  const abaGuardada = useInterface((s) => s.aba);
  const setAba = useInterface((s) => s.setAba);
  const idBase = useId();

  const disponiveis = useMemo(() => abasDisponiveis(corpo), [corpo]);
  const aba = resolverAba(abaGuardada, disponiveis);
  const pai = corpo.tipo === 'lua' && corpo.pai ? getBody(corpo.pai) : undefined;

  // Aba inexistente no novo astro: volta para Visão geral (e fica registrada assim).
  useEffect(() => {
    if (aba && aba !== abaGuardada) setAba(aba);
  }, [aba, abaGuardada, setAba]);

  // Entrar no modo luas (botão, atalho ou link direto) abre a aba Luas.
  useEffect(() => {
    if (modo === 'luas' && disponiveis.includes('luas')) setAba('luas');
  }, [modo, disponiveis, setAba]);

  return (
    <article
      className="astro"
      aria-labelledby={idTitulo}
      style={{ '--cor-astro': corpo.aparencia.corAcento } as CSSProperties}
    >
      <header className="astro__cabecalho">
        {pai && (
          <button type="button" className="botao-texto astro__voltar" onClick={voltar}>
            <IconeSeta />
            Voltar {aNome(pai)}
          </button>
        )}
        <p className="astro__tipo mono">
          <span className="astro__ponto" aria-hidden="true" />
          {rotuloTipo(corpo.tipo)}
          {pai && <span className="astro__tipo-pai"> {deNome(pai)}</span>}
        </p>
        <h2 id={idTitulo} className="astro__nome" tabIndex={-1}>
          {corpo.nome}
        </h2>
        <p className="astro__classificacao">{corpo.conteudo.classificacao}</p>
        {corpo.aparencia.representacaoArtistica && (
          <p className="selo astro__selo">
            <span aria-hidden="true">◌</span> Representação artística
            <span className="sr-only">
              : a aparência deste astro é ilustrativa, sem imagens detalhadas da superfície.
            </span>
          </p>
        )}
        <p className="astro__descricao">{corpo.conteudo.descricao}</p>
      </header>

      {aba && (
        <Abas corpo={corpo} idBase={idBase} disponiveis={disponiveis} aba={aba} aoMudar={setAba} />
      )}

      <RodapeFontes corpo={corpo} idBase={idBase} />
    </article>
  );
}

interface PropsAbas {
  corpo: CelestialBody;
  idBase: string;
  disponiveis: Aba[];
  aba: Aba;
  aoMudar(a: Aba): void;
}

/** Padrão ARIA de abas com ativação automática: ←/→, Home e End. */
function Abas({ corpo, idBase, disponiveis, aba, aoMudar }: PropsAbas) {
  const botoes = useRef<Partial<Record<Aba, HTMLButtonElement | null>>>({});

  const aoTeclar = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const ultimo = disponiveis.length - 1;
    const destino = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    const proxima = disponiveis[destino];
    aoMudar(proxima);
    botoes.current[proxima]?.focus();
  };

  return (
    <div className="abas">
      <div role="tablist" aria-label={`Informações ${deNome(corpo)}`} className="abas__lista">
        {disponiveis.map((id, i) => (
          <button
            key={id}
            ref={(el) => {
              botoes.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-aba-${id}`}
            aria-selected={id === aba}
            aria-controls={`${idBase}-painel-${id}`}
            tabIndex={id === aba ? 0 : -1}
            className="abas__aba"
            onClick={() => aoMudar(id)}
            onKeyDown={(e) => aoTeclar(e, i)}
          >
            {ABAS.find((a) => a.id === id)?.rotulo}
          </button>
        ))}
      </div>
      {disponiveis.map((id) => (
        <div
          key={id}
          role="tabpanel"
          id={`${idBase}-painel-${id}`}
          aria-labelledby={`${idBase}-aba-${id}`}
          tabIndex={0}
          hidden={id !== aba}
          className="abas__painel"
        >
          {id === 'luas' ? (
            <AbaLuas corpo={corpo} />
          ) : (
            <SecaoConteudo secao={corpo.conteudo.secoes[id] ?? {}} corpo={corpo} />
          )}
        </div>
      ))}
    </div>
  );
}

function SecaoConteudo({ secao, corpo }: { secao: Secao; corpo: CelestialBody }) {
  const paragrafos =
    secao.texto
      ?.split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];
  return (
    <div className="secao">
      {paragrafos.map((p, i) => (
        <p key={i} className="secao__texto">
          {p}
        </p>
      ))}
      {secao.dados && secao.dados.length > 0 && <ListaDados dados={secao.dados} corpo={corpo} />}
      {secao.itens && secao.itens.length > 0 && (
        <ul className="secao__itens">
          {secao.itens.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Cada `Dado` vira par rótulo/valor numa lista de definição; a nota explica o valor. */
export function ListaDados({ dados, corpo }: { dados: Dado[]; corpo: CelestialBody }) {
  return (
    <dl className="dados">
      {dados.map((dado, i) => {
        const indiceFonte = dado.fonteId
          ? corpo.fontes.findIndex((f) => f.id === dado.fonteId)
          : -1;
        const fonte = indiceFonte >= 0 ? corpo.fontes[indiceFonte] : undefined;
        return (
          <div key={`${dado.rotulo}-${i}`} className="dado">
            <dt className="dado__rotulo">{dado.rotulo}</dt>
            <dd className="dado__valor mono">
              {dado.valor}
              {fonte && (
                <sup className="dado__ref" title={fonte.titulo}>
                  <span className="sr-only">, fonte </span>
                  {indiceFonte + 1}
                </sup>
              )}
            </dd>
            {dado.nota && <dd className="dado__nota">{dado.nota}</dd>}
          </div>
        );
      })}
    </dl>
  );
}

function RodapeFontes({ corpo, idBase }: { corpo: CelestialBody; idBase: string }) {
  return (
    <footer className="astro__rodape">
      {corpo.fontes.length > 0 && (
        <>
          <h3 className="astro__rotulo mono">Fontes</h3>
          <ol className="fontes">
            {corpo.fontes.map((fonte) => (
              <li key={fonte.id} id={`${idBase}-fonte-${fonte.id}`}>
                <a href={fonte.url} target="_blank" rel="noopener noreferrer">
                  {fonte.titulo}
                  <IconeExterno className="fontes__icone" />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
                <span className="fontes__acesso mono">
                  acesso em {formatarData(fonte.acessadoEm)}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="astro__atualizado mono">
        Atualizado em <time dateTime={corpo.atualizadoEm}>{formatarData(corpo.atualizadoEm)}</time>
      </p>
    </footer>
  );
}
