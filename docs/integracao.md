# Integração das três áreas

Mantido pela Interface (especialista 2). Registra como as áreas se encaixam, o que foi verificado com tudo junto e o que ainda depende de cada área.

## Estado em 31/10/2026

| Verificação         | Resultado                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run typecheck` | Passa (todas as áreas)                                                     |
| `npm run lint`      | Passa (todas as áreas)                                                     |
| `npm test`          | 14 arquivos, 417 testes passando (interface, estado, cena, câmera e dados) |
| `npm run build`     | Passa; sem aviso de tamanho de chunk                                       |
| `npm run preview`   | Build de produção abre `#/terra` com texturas reais e sem erros no console |

## Contrato

- `src/scene/index.ts` exporta `OrbitaCanvas` e `detectarWebGL` (área 1). O stub temporário da Interface foi substituído pela cena real.
- `src/data/index.ts` segue o contrato (área 3). Extras fora do contrato: `caminhoTextura1k` e a reexportação dos tipos.
- `src/state/store.ts` segue o contrato sem campos extras (área 2).
- Quem escreve o quê no store:
  - **Cena**: `setHover` (só mouse), `selecionar` (clique na cena), `setTransicao`, `setQualidade`.
  - **Interface**: todo o resto, incluindo `setOcupacaoInterface` e `setMovimentoReduzido`.
- `.rotulo-astro` e `.rotulo-astro--hover` estão definidos em `src/ui/tokens.css`. A cena acrescenta `data-tipo` e `--cor-acento-astro` em cada rótulo.
- `--linha` é uma borda completa (`1px solid …`); para usar só a cor, `--cor-linha`.

## Convenções combinadas entre as áreas

- **Raiz do projeto**: `projetos/`; caminhos do contrato relativos a ela.
- **three 0.186.1**, porque o `postprocessing` 6.39.5 exige `< 0.187`.
- **Node ≥ 22.18**, por causa do `scripts/baixar-texturas.mjs` (área 3), que importa `.ts` direto no Node.
- `.cache/` fica fora do git (originais das texturas, ~1,5 GB); `public/textures/` (~12 MB) vai para o repositório.
- **`Dado.valor`** já vem formatado, com espaço não separável entre número e unidade; a interface deixa o valor quebrar só nos espaços normais.
- **`ordem`** é a posição entre irmãos por distância e inclui planetas anões (Ceres = 5, Júpiter = 6); a interface não a usa como "Xº planeta".
- **"Explorar luas"** depende de `getChildren(id, { exploravel3D: true }).length > 0`, e não de `totalConhecidas` (Júpiter: 115 conhecidas, 4 exploráveis).
- `rotacaoAstroPausada` começa igual a `movimentoReduzido` (sugestão da área 1).
- **Gestos** descritos na ajuda: arrastar gira; roda/pinça aproxima; botão direito ou dois dedos deslocam; clique/toque seleciona. É o mapeamento do `CameraControls` usado pela área 1.
- **Depuração**: em desenvolvimento, `window.__orbitaCamera` (área 1).

## Fluxo integrado verificado no navegador

Testado em 1280×800, 1920×1080, 768×1024 e 375×667 com a cena e os dados reais:

- [x] A visão geral abre com o loader (fade de saída), o título e a nota de escala.
- [x] Selecionar pelo catálogo (busca "tita" → Titã e Titânia, com destaque) e por link direto atualiza painel, trilha, cor de acento, título da aba e URL.
- [x] Controles mostram estado (`aria-pressed`); `Espaço`, `R`, `O`, `N`, `/`, `?` e `←/→` funcionam; órbitas, nomes e velocidade persistem.
- [x] O painel mostra só as abas aplicáveis, com fontes numeradas, data e selo de representação artística.
- [x] Luas: "293 luas conhecidas (atualizado em outubro de 2026) · 2 disponíveis para exploração 3D", "Explorar luas" (`#/saturno/luas`) e lista clicável.
- [x] Voltar pelo botão, pela trilha, por `Esc` (catálogo → Titã → Saturno) e pelo voltar do navegador. `#/planeta-x` volta para `#/`.
- [x] O astro fica na área livre: Saturno à esquerda do painel lateral (desktop), Marte entre catálogo e painel (1920), Júpiter acima do sheet (tablet) e Saturno acima do sheet (celular, com os controles dentro do sheet).
- [x] O modal de ajuda prende o foco, fecha com `Esc` sem navegar e devolve o foco.
- [x] Movimento reduzido acompanhado ao vivo: `data-movimento-reduzido="true"`, durações de 140 ms e deslocamento 0 (emulado via Playwright).
- [x] Fallback (`?sem-3d`): sem canvas, 27 cartões com imagem, grupos, página do astro e `#/saturno/luas` com a grade de luas e os dois botões de voltar.

Não verificado:

- O fluxo completo com leitor de tela real (NVDA/VoiceOver): a semântica foi conferida pela árvore de acessibilidade e pelos testes.
- Toque real num aparelho; o arrasto do sheet foi testado com mouse emulado.
- 390×844 visualmente. Usa o mesmo layout compacto de 375×667, com mais altura livre.

## Pendências por área

### Cena (área 1)

Listadas em `docs/decisoes-cena.md`:

- Não verificados no navegador: toque real, perda de contexto, troca automática de qualidade e interrupção de voo.
- Luas internas (Fobos, Deimos) às vezes passam entre a câmera e o planeta.

Resolvido em 01/11/2026: na integração, o voo passava por enquadramentos intermediários (ex.: Júpiter enorme antes de Europa), porque o zoom terminava antes de o alvo chegar e o caminho reto cortava o planeta. A área 1 fez o voo contornar os astros no meio do caminho, com folga (Europa → Ganimedes: Júpiter ≥ 4 R da câmera e no máximo 29° na tela, antes 2,4 R e 49°). Detalhes em `docs/decisoes-cena.md`.

### Dados (área 3)

Listadas em `docs/dados.md`, seção "Pendências de verificação humana":

- Valores de Fobos, Haumea e Éris que dependem de artigos não abertos na verificação.
- Afirmações bem estabelecidas que não constam literalmente das páginas citadas.

### Interface (área 2)

- Nenhum bloqueio. Possíveis melhorias:
  - leitor de tela real;
  - teste de ponta a ponta automatizado (Playwright) para o fluxo acima;
  - otimização do chunk do three (~870 kB, ~227 kB gzip), já isolado para cache.
