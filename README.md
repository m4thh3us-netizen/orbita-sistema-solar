# Órbita

Explorador 3D do Sistema Solar: Sol, 8 planetas, 5 planetas anões e 14 luas, com dados científicos citados, fontes e data de atualização. A cena 3D é a protagonista; a interface fica nas bordas, translúcida, e funciona inteira pelo teclado.

- **Visão geral → astro → luas → lua**, com trilha (`Sistema Solar → Saturno → Titã`), botão de voltar, `Esc` e o voltar do navegador.
- **Links diretos**: `#/saturno`, `#/saturno/luas`, `#/saturno/tita`.
- **Catálogo** com busca que ignora acentos ("tita" encontra "Titã") e filtros por tipo.
- **Painel** com abas (só as que existem para cada astro), dados em ficha técnica, fontes e selo de representação artística.
- **Celular**: bottom sheet arrastável com três alturas; os controles moram dentro dele, então nada cobre o astro.
- **Sem WebGL**: modo catálogo com os mesmos dados e a mesma URL.

## Executar

Requer **Node 22.18 ou mais novo** (o script de texturas importa `.ts` direto no Node; o resto funciona a partir do Node 20.19).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script                    | O que faz                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`             | Servidor de desenvolvimento (Vite)                                                         |
| `npm run build`           | Typecheck (`tsc -b`) + build de produção em `dist/`                                        |
| `npm run preview`         | Serve o build de produção                                                                  |
| `npm run typecheck`       | TypeScript strict em todo o projeto                                                        |
| `npm run lint`            | ESLint (TypeScript, React Hooks, jsx-a11y)                                                 |
| `npm test`                | Vitest: interface, estado, cena e dados                                                    |
| `npm run validar-dados`   | Só os testes de consistência dos dados                                                     |
| `npm run baixar-texturas` | Baixa e converte as texturas para `public/textures/` (originais em `.cache/`, fora do git) |
| `npm run format`          | Prettier                                                                                   |

Para ver o modo sem WebGL num navegador que tem WebGL, abra `http://localhost:5173/?sem-3d`.

## Arquitetura

Três áreas desenvolvidas em paralelo, ligadas por um contrato fixo:

| Área          | Pastas                                                                | Responsabilidade                                                                 |
| ------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1 · Cena 3D   | `src/scene`, `src/camera`, `src/assets`                               | Canvas, câmera, materiais, desempenho. Exporta `OrbitaCanvas` e `detectarWebGL`. |
| 2 · Interface | `src/ui`, `src/state`, `src/fallback`, `App.tsx`, `main.tsx`, configs | HTML/CSS, estado, navegação, acessibilidade, fallback, integração.               |
| 3 · Dados     | `src/data`, `public/textures`, `CREDITS.md`, `docs/dados.md`          | Dados tipados, textos, fontes, texturas licenciadas.                             |

```
                     ┌──────────────────────┐
  URL (#/saturno) ⇄  │  useOrbita (Zustand) │  ⇄  localStorage (órbitas, nomes, velocidade)
                     └─────────┬────────────┘
             lê/escreve        │        lê/escreve
        ┌──────────────────────┴──────────────────────┐
  OrbitaCanvas (cena)                          Interface (HTML)
  selecionar, setHover, setTransicao,          selecionar, voltar, controles,
  setQualidade                                 setOcupacaoInterface, movimentoReduzido
        └──────────────── src/data (bodies, getBody, getChildren, getAncestors) ───┘
```

- **Store** (`src/state/store.ts`): exatamente o contrato `OrbitaState`. A interface lê com seletores finos (`useOrbita(s => s.selecionado)`, `useShallow` para grupos).
- **Estado local da interface** (`src/state/interface.ts`): catálogo aberto, modal, aba, altura do sheet. Fica fora do contrato para a cena não re-renderizar por causa de painéis.
- **URL** (`src/state/url.ts`): sincronização nos dois sentidos. Estado → URL com `pushState`; `popstate`/`hashchange` → estado. ID inválido volta para `#/`.
- **Ocupação** (`src/ui/ocupacao.ts`): cada painel mede a área que cobre (ResizeObserver) e publica em `ocupacaoInterface`; a câmera desloca a projeção para centralizar o astro na área livre. Os mesmos valores viram variáveis CSS (`--ocupacao-*`) para os painéis se posicionarem entre si.
- **Tokens** (`src/ui/tokens.css`): cores, fontes, linhas, durações e easing; `--cor-acento` muda com o astro (com transição via `@property` e contraste AA garantido).

### Estrutura da interface

```
src/
  App.tsx              detecta WebGL → cena + interface + loader, ou fallback (lazy)
  main.tsx             fontes, tokens, sincronizações (URL, preferências, movimento, <html>)
  state/               store do contrato, URL, preferências, movimento reduzido, navegação ←/→
  ui/
    Interface.tsx      camadas: topo, catálogo, conteúdo (introdução + painel), rodapé, modais
    BarraTopo.tsx      marca, trilha, "Voltar ao Sistema Solar", catálogo, ajuda
    catalogo/          busca sem acento, filtros, listbox agrupada
    painel/            painel lateral, bottom sheet, conteúdo do astro, abas, aba Luas
    Rodape.tsx         barra de controles (completa e compacta) e nota de escala
    modais/            <dialog> de ajuda e créditos (lazy)
    atalhos.ts         atalhos globais
    Loader.tsx         carregamento ligado ao useProgress do Drei
  fallback/            modo catálogo sem WebGL (lazy)
```

## Decisões técnicas

As decisões completas estão em [`docs/decisoes-interface.md`](docs/decisoes-interface.md), [`docs/decisoes-cena.md`](docs/decisoes-cena.md) e [`docs/decisoes-dados.md`](docs/decisoes-dados.md). Resumo da interface:

- **Hash routing**: links diretos funcionam em qualquer hospedagem estática, sem regras de reescrita.
- **Sincronizações antes do primeiro render**: um link direto já abre no astro certo, sem passar pela visão geral.
- **`<dialog>` nativo** para modais: `showModal()` deixa o resto inerte (foco preso); ao fechar, o foco volta para quem abriu.
- **Celular**: controles e nota de escala dentro do bottom sheet, para nenhum elemento flutuar sobre o astro.
- **Code splitting**: fallback, ajuda e créditos sob demanda; three.js, R3F e React em chunks próprios para cache entre deploys.
- **Versões fixas**: React 19.3 · R3F 9.8 · Drei 10.7 · three 0.186 (o `postprocessing` 6.39 exige < 0.187) · Zustand 5 · Vite 8 · TypeScript 5.9.

## Acessibilidade

- Tudo navegável pelo teclado: catálogo (combobox + listbox), abas (padrão ARIA), controles e atalhos.
- Link "Pular para o conteúdo", foco visível na cor de acento, ordem de tabulação lógica.
- Região `aria-live` anuncia seleção ("Astro selecionado: Saturno"), modos e controles.
- Botões só com ícone têm `aria-label`; alternáveis usam `aria-pressed`; velocidade e filtros são radiogroups.
- Conteúdo científico em HTML semântico (`<dl>` para dados, `<time>`, listas e títulos).
- `prefers-reduced-motion` é acompanhado ao vivo: a interface troca deslizes por fades curtos e a cena troca voos por cortes suaves.
- Alvos de toque ≥ 44 px e `env(safe-area-inset-*)` respeitado.

### Atalhos

| Tecla           | Ação                                              |
| --------------- | ------------------------------------------------- |
| `Esc`           | Volta um nível (ou fecha menu, catálogo ou modal) |
| `Espaço`        | Pausa/retoma a simulação                          |
| `←` `→`         | Astro anterior/próximo pela ordem                 |
| `R` · `O` · `N` | Restaurar câmera · órbitas · nomes                |
| `/`             | Buscar no catálogo                                |
| `?`             | Ajuda                                             |

Ficam desligados enquanto o foco está num campo de texto.

## Como adicionar um astro

1. **Dados** (área 3): crie o objeto em `src/data/` seguindo `CelestialBody` (veja `docs/dados.md`, seção "Como adicionar um astro"), inclua-o em `bodies` e rode `npm run validar-dados`.
2. **Texturas**: registre a origem em `src/data/texturas.ts`, rode `npm run baixar-texturas` e atualize `CREDITS.md`.
3. **Interface**: nada a fazer. Catálogo, filtros, trilha, URL, abas, aba Luas e fallback leem tudo dos dados. Um astro só entra na navegação se `exploravel3D: true`.
4. **Cena**: escala, órbita e materiais derivam dos dados; ajustes finos de aparência ficam em `src/scene/`.

## Deploy

O build é estático (`dist/`) e usa rotas por hash, então não precisa de reescritas.

**Vercel**: importe o repositório; o preset Vite já usa `npm run build` e `dist`. Em _Settings → General → Node.js Version_, escolha 22.x ou mais novo.

**Netlify**: build command `npm run build`, publish directory `dist`, variável `NODE_VERSION=22`.

Para publicar numa subpasta (ex.: GitHub Pages em `/orbita/`), rode `npm run build -- --base=/orbita/`; texturas e fontes usam `import.meta.env.BASE_URL`.

## Créditos e licenças

- Texturas e fontes de dados: [`CREDITS.md`](CREDITS.md) (também no modal "Créditos" do app).
- Tipografia self-hosted via Fontsource, com `font-display: swap`:
  - [Bricolage Grotesque](https://github.com/ateliertriay/bricolage), de Mathieu Triay (SIL Open Font License 1.1): display e texto, com eixo de tamanho óptico.
  - [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono), da JetBrains (SIL Open Font License 1.1): dados e rótulos.
