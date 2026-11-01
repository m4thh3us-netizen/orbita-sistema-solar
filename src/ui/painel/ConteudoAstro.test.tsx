import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBody } from '@/data';
import type { CelestialBody } from '@/data/types';
import { useInterface } from '@/state/interface';
import { criarEstadoInicial, useOrbita } from '@/state/store';
import { abasDisponiveis, resolverAba } from './abas';
import { ConteudoAstro } from './ConteudoAstro';

vi.mock('@/data', () => import('@/state/__tests__/fixture'));

const corpo = (id: string) => getBody(id) as CelestialBody;
const nomesDasAbas = () => screen.queryAllByRole('tab').map((t) => t.textContent);

function renderizar(id: string) {
  return render(<ConteudoAstro corpo={corpo(id)} idTitulo="titulo" />);
}

beforeEach(() => {
  useOrbita.setState(criarEstadoInicial());
  useInterface.setState({ aba: 'visao-geral' });
});

describe('abas condicionais', () => {
  it('mostra só as seções existentes, na ordem do contrato', () => {
    renderizar('terra');
    expect(nomesDasAbas()).toEqual(['Visão geral', 'Atmosfera', 'Luas', 'Curiosidades']);
  });

  it('esconde Luas quando conteudo.luas é nulo', () => {
    renderizar('tita');
    expect(nomesDasAbas()).toEqual(['Visão geral']);
  });

  it('abasDisponiveis / resolverAba', () => {
    expect(abasDisponiveis(corpo('saturno'))).toEqual([
      'visao-geral',
      'composicao',
      'atmosfera',
      'luas',
    ]);
    expect(resolverAba('atmosfera', ['visao-geral', 'atmosfera'])).toBe('atmosfera');
    expect(resolverAba('curiosidades', ['visao-geral', 'atmosfera'])).toBe('visao-geral');
    expect(resolverAba('luas', ['atmosfera'])).toBe('atmosfera');
    expect(resolverAba('luas', [])).toBeNull();
  });

  it('mantém a aba ao trocar de astro quando ela existe; senão volta para Visão geral', () => {
    act(() => useInterface.getState().setAba('atmosfera'));
    const { rerender } = renderizar('terra');
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Atmosfera');

    rerender(<ConteudoAstro corpo={corpo('saturno')} idTitulo="titulo" />);
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Atmosfera');

    rerender(<ConteudoAstro corpo={corpo('marte')} idTitulo="titulo" />);
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Visão geral');
    expect(useInterface.getState().aba).toBe('visao-geral');
  });

  it('segue o padrão ARIA de abas com setas', async () => {
    const usuario = userEvent.setup();
    renderizar('terra');
    const [visaoGeral] = screen.getAllByRole('tab');
    expect(visaoGeral).toHaveAttribute('tabindex', '0');
    visaoGeral.focus();
    await usuario.keyboard('{ArrowRight}');
    const atmosfera = screen.getByRole('tab', { name: 'Atmosfera' });
    expect(atmosfera).toHaveAttribute('aria-selected', 'true');
    expect(atmosfera).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Nitrogênio e oxigênio.');
    await usuario.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Curiosidades' })).toHaveFocus();
  });
});

describe('conteúdo', () => {
  it('renderiza Dado como lista de definição com nota e referência à fonte', () => {
    renderizar('terra');
    const painel = screen.getByRole('tabpanel');
    const termo = within(painel).getByText('Diâmetro');
    expect(termo.tagName).toBe('DT');
    expect(termo.closest('dl')).not.toBeNull();
    expect(within(painel).getByText('12.742 km', { exact: false }).tagName).toBe('DD');
    expect(within(painel).getByText('Diâmetro equatorial médio').tagName).toBe('DD');
  });

  it('mostra selo de representação artística, fontes e data de atualização', () => {
    renderizar('ceres');
    expect(screen.getByText(/Representação artística/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /NASA Fact Sheet/ })).toHaveAttribute(
      'href',
      'https://nssdc.gsfc.nasa.gov/',
    );
    expect(screen.getByText(/Atualizado em/)).toHaveTextContent('31 de outubro de 2026');
  });

  it('numa lua, oferece "Voltar a [pai]"', async () => {
    const usuario = userEvent.setup();
    act(() => useOrbita.getState().selecionar('tita'));
    renderizar('tita');
    await usuario.click(screen.getByRole('button', { name: 'Voltar a Saturno' }));
    expect(useOrbita.getState().selecionado).toBe('saturno');
  });
});

describe('aba Luas', () => {
  it('mostra total conhecido × exploráveis, a lista e o botão Explorar luas', async () => {
    const usuario = userEvent.setup();
    act(() => {
      useOrbita.getState().selecionar('saturno');
      useInterface.getState().setAba('luas');
    });
    renderizar('saturno');
    const painel = screen.getByRole('tabpanel');
    expect(painel).toHaveTextContent('274 luas conhecidas (atualizado em março de 2026)');
    expect(painel).toHaveTextContent('2 disponíveis para exploração 3D');
    expect(within(painel).getAllByRole('link', { name: /Encélado|Titã/ })).toHaveLength(2);

    const botao = within(painel).getByRole('button', { name: 'Explorar luas' });
    expect(botao).toHaveAttribute('aria-pressed', 'false');
    await usuario.click(botao);
    expect(useOrbita.getState().modo).toBe('luas');
    expect(botao).toHaveAttribute('aria-pressed', 'true');
  });

  it('usa a mensagem dos dados para astros sem luas', () => {
    act(() => useInterface.getState().setAba('luas'));
    renderizar('mercurio');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mercúrio não tem luas.');
    expect(screen.queryByRole('button', { name: 'Explorar luas' })).toBeNull();
  });

  it('com luas conhecidas mas nenhuma explorável, não oferece exploração', () => {
    act(() => useInterface.getState().setAba('luas'));
    renderizar('makemake');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      '1 lua conhecida (atualizado em outubro de 2026) · nenhuma disponível para exploração 3D',
    );
    expect(screen.queryByRole('button', { name: 'Explorar luas' })).toBeNull();
  });
});
