# Decisões da cena 3D

Código em `src/scene/`, `src/camera/` e `src/assets/`. Exporta `OrbitaCanvas` e `detectarWebGL` por `src/scene/index.ts`.

## Escalas (`src/scene/escala.ts`, testadas em `escala.test.ts`)

| Grandeza | Fórmula | Efeito |
|---|---|---|
| Raio | `0,6 · √(r/6371 km)` até 80 000 km; acima disso, continua com raiz quarta; piso suave `√(r² + 0,045²)` | Terra = 0,6; Mercúrio ≈ 0,37; Júpiter ≈ 2,0; Sol ≈ 3,65 (≈ 6 Terras, não domina) |
| Distância ao Sol | `2 + 24 · ln(1 + d/UA)`, aplicada ao raio vetor real a cada instante | Mercúrio ≈ 10, Terra ≈ 19, Júpiter ≈ 46, Netuno ≈ 85. A ordem vale a cada instante (Plutão cruza Netuno) |
| Distância das luas | `Rpai · (1,25 + 1,1 · ln(a/Rpai_km))` | Sempre fora do pai; Encélado fora dos anéis de Saturno |
| Período orbital | Proporcional entre 88 d e 2 anos (Terra = 60 s em 1×); abaixo, expoente 0,25; acima, expoente 0,55 | Netuno ≈ 23 min/volta em vez de 2,7 h; Fobos ≈ 3,5 s em vez de 0,05 s |
| Rotação axial | `20 s · (|P|/24 h)^0,4`, com sinal | Vênus ≈ 3 min/volta, ainda perceptível |

Retrógrados: seguimos a convenção de `src/data/types.ts`. Obliquidade > 90° já descreve a rotação retrógrada (Vênus, Urano, Plutão giram com |P| em torno do eixo invertido). O sinal do período só vale com obliquidade ≤ 90°. Na órbita, inclinação > 90° (Tritão, 157,3°) já inverte o sentido; `retrograda` só é usado se a inclinação não o descrever. Luas síncronas giram exatamente o ângulo orbital, então o meridiano 0 fica sempre voltado para o pai.

Os dados não trazem nodo ascendente, argumento do periapse nem fase inicial. A cena sorteia os três de forma determinística pelo hash do id, então as posições são ilustrativas. Luas regulares orbitam no plano equatorial do pai (o sistema de Urano fica "de pé"). Luas com a > 40 raios do pai (a Lua) usam o plano orbital do planeta, coerente com a referência dos dados.

Relógio próprio (`relogio.ts`): acumula segundos de cena, com dt limitado a 0,1 s, então não há salto ao pausar, retomar ou trocar de aba. Mudanças de velocidade e de pausa são suavizadas (~0,2 s), exceto com movimento reduzido.

## Câmera (`src/camera/`)

- O `CameraControls` do Drei cuida da entrada; `ControleCamera` decide o destino.
- Voos de 1,2 a 1,8 s: interpolação de Hermite em alvo, azimute, ângulo polar e log da distância, partindo da posição **e da velocidade** atuais e chegando com a velocidade do astro. Por isso uma nova seleção no meio do voo não dá tranco. Uma lombada afasta e eleva a câmera no meio de voos longos, para ela não atravessar o Sol.
- Desvio de obstáculos nos voos. (1) Enquanto o alvo viaja, a distância da câmera tem um piso de 1,2 × o caminho que falta, então o zoom não termina antes do deslocamento. (2) O caminho do alvo contorna, com a lombada, astros que ficam no meio, a até 3,5 raios (Júpiter entre duas luas, o Sol entre Terra e Marte). (3) A câmera é empurrada suavemente (C¹) para fora de 2 raios de qualquer astro que não seja o destino; são 3 raios quando a pose final fica longe dele. O empurrão some nos últimos 20% do voo. Medido: Europa → Ganimedes passa a ≥ 4 R de Júpiter (antes 2,4 R, com Júpiter ocupando 49° da tela); Marte → visão geral passa a ≥ 3,5 R do Sol (antes 2,5 R).
- Enquadramento: `setViewOffset` desloca a projeção para o centro da área livre (`ocupacaoInterface`). A distância faz o astro ocupar uma fração do menor lado livre. Quando os painéis mudam, o zoom só é refeito se o usuário não o tiver alterado (±8%).
- Seguimento: `moveTo` no astro a cada quadro, mantendo o ângulo escolhido pelo usuário. Se o usuário arrasta no meio do voo, assume o controle e um resíduo decai suavemente até o astro.
- Limites: zoom de 1,5× o raio até max(8×, 1,5× o enquadramento). Na visão geral, o alvo fica numa caixa e a distância vai de 9 a 420. Modo luas: enquadra a órbita da lua mais distante. Lua selecionada: câmera do lado de fora da órbita, girada ~29°, com o planeta ao fundo.
- Movimento reduzido: fade de 110 + 160 ms (cortina na própria cena), sem rotação automática da câmera (que, sem ele, gira devagar na visão geral após 7 s parada), sem cintilação e sem giro dos cinturões.

## Seleção

Colisores invisíveis com raio max(2,5 × raio; 14 px, ou 22 px em telas de toque). O filtro de eventos (`eventos.ts`) ordena os acertos pela distância, na tela, entre o ponteiro e o disco do astro, e não pela profundidade: Fobos ganha de Marte mesmo dentro do colisor dele. Clique só conta com até 5 px de movimento (12 px no toque). Toque não gera hover.

## Materiais e shaders

- Iluminação: ponto no Sol sem decaimento (intensidade 3,3) e ambiente de 0,16 para preencher o lado noturno. Os shaders próprios usam a mesma fórmula do `MeshStandardMaterial`.
- Sol: fBm simplex animado, granulação, manchas e escurecimento de borda, em HDR. A coroa é um quad aditivo. O bloom é seletivo por luminância (limiar 1,15, só o Sol passa), com tone mapping AgX depois. A textura do Sol nos dados não é usada: o shader animado substitui.
- Terra: shader próprio com luzes noturnas pelo ângulo com o Sol, especular só no oceano (do mapa, ou derivado do azul do mapa diurno) e terminador quente. Nuvens numa camada separada. O mapa normal não é usado.
- Atmosfera: duas cascas de fresnel aditivo (halo pelo lado de trás e véu). `intensidade` ≥ 0,6 adiciona névoa sobre o disco (Vênus, Titã).
- Anéis: UV radial, iluminação dos dois lados e, na qualidade alta, sombra analítica do planeta (interseção do raio de cada fragmento até o Sol com a esfera). A sombra dos anéis no planeta não foi feita.
- Sem textura: `corBase` com relevo procedural no shader (rochoso, gasoso com faixas e Grande Mancha Vermelha, gelo com fissuras, vulcânico). Parâmetros por astro em `estilos.ts`. Haumea é um elipsoide; Fobos e Deimos são deformados por ruído.

## Texturas (`src/assets/texturas.ts`)

- Primeiro a versão 1K (`caminhoTextura1k`). Ao selecionar um astro, carregam a versão de alta e os mapas normal, noturno e especular. Sem uso por 20 s, a textura sai da GPU (contagem de referências).
- KTX2 opcional: `public/textures/manifest.json` = `{ "versao": 1, "variantes": { "textures/terra/mapa.webp": { "ktx2": "textures/terra/mapa.ktx2" } } }`. O transcodificador vem do jsDelivr, na versão do three. Se falhar, usa WebP.
- Erro ou ausência de arquivo vira `null` e o procedural assume. Usa o `DefaultLoadingManager`, então o `useProgress` funciona.

## Qualidade (`qualidade.ts`, `ControleQualidade.tsx`)

`PerformanceMonitor` desce ou sobe um nível (faixa de 42 a 58 fps em telas de 60 Hz). Cada nível define o DPR máximo (2 / 1,5 / 1), partículas, estrelas, segmentos de esfera, sombra dos anéis, bloom (desligado na baixa), MSAA, anisotropia e textura de alta. Começa em `media` em telas de toque ou pequenas.

## Robustez e acessibilidade

O wrapper do canvas tem `aria-hidden` e nada nele recebe foco. Na perda de contexto WebGL, espera a restauração; depois recria o canvas (até 2×) e, se ainda falhar, mostra uma mensagem curta. Um error boundary isola falhas da cena.

Cinturões: o tamanho de cada rocha na tela é limitado no vertex shader (~2 px). De longe mantêm o tamanho natural; na vista de um planeta viram pontos, não pedregulhos. Fora da visão geral, as órbitas que não são do sistema em foco ficam com 30% da opacidade.

Depuração: em desenvolvimento, `window.__orbitaCamera` expõe os controles, a câmera e o estado do voo.

## Pendências conhecidas

- Não verificados no navegador: toque real, perda de contexto, troca automática de qualidade, fade do movimento reduzido e interrupção de voo (o painel do navegador estava oculto e com quadros limitados).
- Luas internas (Fobos, Deimos) às vezes passam entre a câmera e o planeta na vista individual; é coerente com as distâncias ilustrativas, mas pode incomodar.
