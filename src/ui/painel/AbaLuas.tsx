import type { CSSProperties } from 'react';
import { getChildren } from '@/data';
import type { CelestialBody } from '@/data/types';
import { porOrdem } from '@/state/navegacao';
import { useOrbita } from '@/state/store';
import { rotaParaHash } from '@/state/url';
import { formatarMesAno, plural } from '../formatacao';
import { IconeLuas } from '../icones';

const NUMERO = new Intl.NumberFormat('pt-BR');

export function AbaLuas({ corpo }: { corpo: CelestialBody }) {
  const modo = useOrbita((s) => s.modo);
  const explorarLuas = useOrbita((s) => s.explorarLuas);
  const voltar = useOrbita((s) => s.voltar);

  const luas = corpo.conteudo.luas;
  if (!luas) return null;

  const exploraveis = getChildren(corpo.id, { exploravel3D: true }).sort(porOrdem);
  const total = luas.totalConhecidas;
  const n = exploraveis.length;
  const fonte = corpo.fontes.find((f) => f.id === luas.fonteId);

  if (total === 0 || (total === null && n === 0)) {
    return (
      <p className="luas__vazio">
        {luas.mensagemSemLuas ?? `${corpo.nome} não tem luas conhecidas.`}
      </p>
    );
  }

  const explorando = modo === 'luas';

  return (
    <div className="luas">
      <p className="luas__resumo">
        {total !== null ? (
          <>
            <strong className="mono">{NUMERO.format(total)}</strong>{' '}
            {plural(total, 'lua conhecida', 'luas conhecidas')}
          </>
        ) : (
          'Total de luas em revisão'
        )}{' '}
        <span className="luas__data">(atualizado em {formatarMesAno(luas.atualizadoEm)})</span>
        {' · '}
        {n > 0 ? (
          <>
            <strong className="mono">{n}</strong> {plural(n, 'disponível', 'disponíveis')} para
            exploração 3D
          </>
        ) : (
          'nenhuma disponível para exploração 3D'
        )}
      </p>
      {fonte && (
        <p className="luas__fonte mono">
          Fonte:{' '}
          <a href={fonte.url} target="_blank" rel="noopener noreferrer">
            {fonte.titulo}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </p>
      )}

      {n > 0 && (
        <>
          <button
            type="button"
            className="botao botao--acento luas__explorar"
            aria-pressed={explorando}
            onClick={explorando ? voltar : explorarLuas}
          >
            <IconeLuas />
            Explorar luas
          </button>
          <ul role="list" className="luas__lista" aria-label={`Luas exploráveis`}>
            {exploraveis.map((lua) => (
              <li key={lua.id}>
                <a
                  href={rotaParaHash({ selecionado: lua.id, modo: 'astro' })}
                  className="luas__item"
                  style={{ '--cor-item': lua.aparencia.corAcento } as CSSProperties}
                >
                  <span className="luas__ponto" aria-hidden="true" />
                  <span className="luas__nome">{lua.nome}</span>
                  <span className="luas__classe mono">{lua.conteudo.classificacao}</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
