# Decisões — Interface

Código em `src/ui/`, `src/state/`, `src/fallback/`, `src/App.tsx`, `src/main.tsx` e nas configs da raiz.

## Projeto e ferramentas

- **Raiz**: a raiz do repositório. Os caminhos do contrato são relativos a ela.
- **Versões fixas** (sem `^`): React 19.3.1, R3F 9.8.2, Drei 10.7.9, @react-three/postprocessing 3.2.2, postprocessing 6.39.5, Zustand 5.0.16, Vite 8.3.5, Vitest 5.0.5.
  - **three 0.186.1**: o `postprocessing` 6.39.5 exige `three < 0.187`.
  - **TypeScript 5.9.3**: o `typescript-eslint` 8.72 aceita `< 6.1`; a 5.9 é a linha mais testada com o resto.
  - **ESLint 9**: o `eslint-plugin-jsx-a11y` ainda não declara suporte ao ESLint 10.
- **Node ≥ 22.18** em `engines`: o `scripts/baixar-texturas.mjs` (área 3) importa `.ts` com a remoção de tipos nativa do Node.
- **Aliases**: `@/*` → `src/*` (`@/data`, `@/state`, `@/ui`, `@/scene`…), no `tsconfig.app.json` e no `vite.config.ts`.
- **tsconfig**: o strict do template Vite, com `verbatimModuleSyntax`, `noUnusedLocals/Parameters` e `erasableSyntaxOnly`. Não ativei `noUncheckedIndexedAccess` para não impor fricção às outras áreas.
- **ESLint**: `react-hooks` 7 (regras do React Compiler), `jsx-a11y` recomendado, `react-refresh`. Dois ajustes:
  - `no-redundant-roles` aceita `role="list"` em `<ul>/<ol>`: o Safari/VoiceOver remove a semântica de lista quando `list-style: none`.
  - `react-hooks/immutability` desligada só em `src/scene`, `src/camera` e `src/assets`: o laço `useFrame` do R3F muta uniforms e materiais por design, fora do ciclo de render.
- **Testes** em jsdom, com `@/data` substituído por uma fixture (`src/state/__tests__/fixture.ts`), para os testes da interface não quebrarem quando o conteúdo científico mudar.
- **Code splitting**: `Fallback`, `Ajuda` e `Creditos` via `lazy()`. Grupos de chunk (`rolldownOptions.output.codeSplitting`) separam three, R3F/Drei e React, que mudam pouco entre deploys.
- **Fontes**: Bricolage Grotesque (display e texto, eixo `opsz`) e JetBrains Mono (dados), self-hosted via Fontsource com `font-display: swap`. Uma família expressiva com tamanho óptico serve aos títulos grandes e ao texto corrido, mantendo a identidade em duas famílias.

## Estado e navegação

- **Store do contrato** (`useOrbita`) sem nenhum campo extra. O estado puramente de interface (catálogo, modal, aba, sheet, carregado) fica em `useInterface`, para a cena não re-renderizar por causa de painéis.
- **Só astros com `exploravel3D: true` entram na navegação** (`selecionar`, URL, catálogo, ←/→). Assim a cena nunca recebe um astro que não sabe desenhar.
- **`voltar()`**: luas → astro · lua → pai (modo `astro`) · astro → visão geral. A lua volta ao pai no modo `astro`, e não `luas`, para cada passo subir exatamente um nível da URL (`#/saturno/tita` → `#/saturno`).
- **`explorarLuas()`** só age se houver luas exploráveis (`getChildren(id, { exploravel3D: true })`). Júpiter tem 115 luas conhecidas e 4 exploráveis; Makemake tem 1 conhecida e nenhuma explorável.
- **`rotacaoAstroPausada` começa igual a `movimentoReduzido`** (sugestão da área 1); a pessoa pode retomar pela barra.
- **URL**:
  - Formas canônicas: `#/`, `#/saturno`, `#/saturno/luas`, `#/saturno/tita`. `#/tita` é aceito e reescrito para `#/saturno/tita` com `replaceState`.
  - Qualquer parte inválida (ID desconhecido, lua com o pai errado, `luas` sem luas exploráveis, caminho longo demais, `%` malformado) volta para `#/`, em vez de parar no nível válido mais fundo.
  - Estado → URL com `pushState`: cada navegação vira uma entrada do histórico, então o voltar do navegador percorre o caminho real. `''`, `#` e `#/` são equivalentes, para a primeira visita não sujar a URL.
  - As sincronizações começam em `main.tsx`, antes do primeiro render: um link direto já abre no astro, sem passar pela visão geral.
  - Links da interface (trilha, luas, cartões do fallback) são `<a href="#/...">` de verdade, para copiar e abrir em nova aba. "Pular para o conteúdo" usa `preventDefault`, para não virar rota.
- **←/→**: no nível do Sol, percorrem Sol + filhos do Sol pela `ordem` (que inclui os planetas anões, conforme a área 3). Numa lua, percorrem as luas irmãs exploráveis. No modo luas, → vai para a primeira lua. Há volta circular.
- **Preferências** (órbitas, nomes, velocidade) em `localStorage['orbita:preferencias']`. Toda leitura e escrita passa por `try/catch`, e valores inválidos são descartados campo a campo.

## Composição e layout

- **Breakpoints por capacidade, não por aparelho**:
  - Painel lateral com `(min-width: 900px), (orientation: landscape) and (min-width: 640px)`; abaixo disso, bottom sheet. Assim o tablet em retrato (768×1024) usa sheet e o celular deitado usa painel lateral.
  - Layout compacto com `(max-width: 639px), (max-height: 500px)`: barra de controles com menu "mais" e catálogo em tela cheia.
  - Com `(min-width: 1440px)`, o catálogo fica aberto ao lado do painel depois de escolher um astro. Abaixo disso ele fecha, porque com os dois abertos em 1280 px sobram ~500 px para a cena e a barra de controles.
- **Ocupação**: cada painel mede o que cobre (ResizeObserver, e também ao fim de transições e animações, que mudam a posição sem mudar o tamanho) e publica o máximo por borda em `ocupacaoInterface`. Medidos: topo (barra superior), right (painel lateral), left (catálogo aberto no desktop) e bottom (barra de controles ou sheet). Os valores também viram `--ocupacao-*` no `<html>`; a barra de controles usa isso para centralizar entre catálogo e painel.
- **Celular**: no estado "meio" (375×667), a barra de controles e a nota flutuando sobre o sheet cobriam o astro. Agora os controles compactos ficam na primeira linha do sheet (ao lado da alça) e a nota logo abaixo, sem nada flutuando na área livre. O recolhido (184 px) mostra controles, nota, tipo, nome e classificação.
- **Bottom sheet**: alça é um `<button>` grande. Arrastar ajusta a altura; soltar encaixa no estado mais próximo da posição projetada pela velocidade ("arremesso"). Arrastar abaixo do recolhido fecha, que é o mesmo que `voltar()`. Clique ou Enter alternam os estados; ↑/↓ sobem e descem um estado. Cada abertura vinda da visão geral começa no meio; trocar de astro mantém a altura.
- **Introdução** no canto inferior esquerdo, acima da barra; some com fade ao selecionar. Ganhou um botão "Abrir catálogo", que é a porta de entrada pelo teclado e o alvo natural do "Pular para o conteúdo".
- **Hierarquia de títulos**: `h1` oculto ("Órbita — explorador 3D do Sistema Solar"), `h2` para a introdução e para o nome do astro, `h3` dentro das seções.

## Painel e conteúdo

- `ConteudoAstro` é um componente só, usado no painel lateral, no sheet e no fallback.
- **Abas**: ordem fixa do contrato; aparecem só as seções existentes, e "Luas" quando `conteudo.luas !== null`. Ativação automática com ←/→, Home e End. A aba é guardada no estado da interface. Se o novo astro não a tem, volta para Visão geral, e essa troca fica registrada (Terra/Atmosfera → Mercúrio → Vênus mostra Visão geral). Entrar no modo luas (botão, atalho ou link direto) abre a aba Luas.
- **Dados**: `<dl>` com `dt` (rótulo) e `dd` (valor em mono, mais a nota num segundo `dd`). A fonte de cada dado aparece como número sobrescrito que remete à lista numerada do rodapé, sem botões minúsculos (alvo de toque). Os valores quebram linha quando o painel é estreito; o rótulo nunca fica abaixo de ~7em.
- **Aba Luas**: "X luas conhecidas (atualizado em mês de ano) · N disponíveis para exploração 3D". Sem luas exploráveis: "nenhuma disponível para exploração 3D" e sem botão. Com `totalConhecidas` igual a 0, mostra `mensagemSemLuas`. "Explorar luas" é um toggle (`aria-pressed`): pressionado no modo luas, e clicar de novo volta ao astro.
- **Selo "Representação artística"** com texto oculto explicando o que significa para leitores de tela.
- **Datas** em pt-BR por extenso (`12 de março de 2025`, `março de 2026`). `yyyy-mm-dd` é lido como data local, para não voltar um dia por causa do fuso.

## Controles, atalhos e anúncios

- **Toggles com rótulo fixo e `aria-pressed`** ("Pausar simulação" pressionado = pausada), como recomenda o padrão de toggle button. A dica visual (`data-dica`) muda ("Retomar simulação · Espaço"), mas o nome acessível não.
- **Velocidade e filtros** são radiogroups com tabindex móvel. A velocidade tem nomes acessíveis "0,25 vezes" etc., porque "×" é lido como "sinal de multiplicação".
- **Atalhos** ficam desligados em campos de texto, com modal aberto, quando um componente já tratou a tecla (`defaultPrevented`) e com Ctrl/Meta/Alt (AltGr é permitido, por causa de teclados ABNT2). `Espaço` não é capturado quando o foco está num botão, link, aba ou rádio, que já usam a tecla. ←/→ são ignorados dentro de tablist, radiogroup e listbox.
- **Esc em camadas**: menu "mais" → catálogo → `voltar()`. O `<dialog>` trata o próprio Esc (evento `cancel`), e os atalhos globais ficam desligados enquanto ele está aberto.
- **Anúncios**: "Astro selecionado: Saturno. Gigante gasoso." em vez de "Saturno selecionado", porque a concordância de gênero ("Terra selecionada", "Titã selecionada") exigiria um dado que o contrato não tem. Também anuncia modo luas, volta ao astro, visão geral e cada controle.
- **Resgate de foco**: se uma navegação remove o elemento focado, o foco vai para `<main id="conteudo">` em vez de cair no `<body>`.

## Visual

- **Tokens** conforme o contrato. `--linha` é a borda completa (`1px solid …`); `--cor-linha` é só a cor. Extras: `--cor-superficie(-forte)`, `--cor-acento-suave`, `--deslocamento`, `--margem`, `--alvo-toque` e `--seguro-*`.
- **Acento**: `--cor-acento` registrada com `@property` (transição de cor de 420 ms). O `corAcento` de cada astro é clareado até 4,5:1 sobre o fundo antes de ir para a interface, porque alguns acentos (azuis e vermelhos escuros) não passariam no AA como texto ou anel de foco.
- **Rótulos da cena** (`.rotulo-astro`): mono 11 px em caixa alta com um ponto na `--cor-acento-astro` que a cena define. `data-tipo="lua"` deixa o rótulo menor; hover com sublinhado de 1 px na cor do astro.
- **Movimento reduzido**: `data-movimento-reduzido` no `<html>` e `@media (prefers-reduced-motion)` zeram `--deslocamento` e encurtam `--duracao-media` para 140 ms. O loader para de girar.
- **Legibilidade sobre a cena**: gradiente escuro atrás da barra superior, fundo translúcido atrás da nota de escala e sombra de texto no título. Mantêm o AA mesmo quando há um astro claro atrás.

## Loader

- Ligado ao `useProgress` do Drei (DefaultLoadingManager, o mesmo do carregador de texturas da cena).
- Fica no mínimo 900 ms, para a cena registrar as texturas antes de o progresso ser lido e para não piscar. Sai quando `active` fica falso. Tem um limite de 15 s, para uma textura travada não prender a interface.
- O fade de saída libera a introdução (`carregado`).

## Fallback sem WebGL

- `detectarWebGL()` (área 1) decide no primeiro render. Um error boundary em volta da cena também cai no modo catálogo se o 3D quebrar depois.
- `?sem-3d` força o modo catálogo, para testar num navegador com WebGL.
- O fallback é uma página rolável com a mesma identidade:
  - aviso curto, título, busca e filtros;
  - grade agrupada de cartões com disco estático: o `mapa` recortado com sombreamento, ou um círculo na `corBase`, que também é usado se a imagem falhar;
  - página do astro com o mesmo `ConteudoAstro` e a grade de luas no modo luas.
- Usa a mesma URL e o mesmo store. A cada navegação, volta ao topo e leva o foco ao título.
