# Dados científicos do Órbita

Este documento explica de onde vêm os números e textos de `src/data/`, como foram verificados, o que ainda está incerto e como manter tudo atualizado.

- **Verificação:** 31/10/2026.
- **Área:** Dados (`src/data/`).
- **Validação automática:** `npm run validar-dados`.

## Metodologia

1. **Fontes, nesta ordem de preferência:**
   1. NASA NSSDCA Planetary Fact Sheets, para planetas, Lua, Plutão e Sol.
   2. JPL Solar System Dynamics, para satélites (`sats/phys_par` e `sats/elem`) e planetas anões (Small-Body Database).
   3. NASA Science, para contagem de luas, descrições e curiosidades.
   4. Artigos científicos, só quando as anteriores não cobrem o dado.
2. **Sem valores inventados.** Quando não encontrei um valor confiável, o `Dado` foi omitido e o motivo está em [Valores omitidos](#valores-omitidos).
3. **Valores derivados** são cálculos simples a partir de valores publicados, sempre indicados na `nota` do dado:
   - massa a partir do parâmetro gravitacional GM, com G = 6,6743 × 10⁻¹¹ m³ kg⁻¹ s⁻² (CODATA 2018);
   - gravidade superficial pela fórmula g = GM/r²;
   - diâmetro como 2 × raio;
   - período de rotação das luas síncronas igual ao período orbital;
   - semieixo em km a partir de UA, com 1 UA = 149.597.870,7 km;
   - razões usadas nas curiosidades, como "2,5 vezes a massa dos outros planetas".
4. **Cada `Dado` relevante tem `fonteId`.** Cada astro lista suas `fontes` e tem `atualizadoEm`.
5. **Fontes com `acessadoEm` vazio** foram citadas sem que a página tivesse sido aberta na verificação: os valores vieram de resumos e trechos encontrados na busca. Elas estão listadas em [Pendências de verificação humana](#pendências-de-verificação-humana).
6. **Consistência conferida pelos testes:**
   - 3ª lei de Kepler para todas as órbitas, cruzando período, semieixo e massa do corpo central (tolerância de 3 %; 8 % em Caronte, que tem cerca de 11 % da massa do sistema);
   - diâmetro exibido compatível com o raio usado pela cena;
   - ordem por distância;
   - contraste e distinção das cores de acento.

## Convenções

| Campo | Convenção |
|---|---|
| `Dado.valor` | pt-BR: vírgula decimal, ponto de milhar, espaço não separável (U+00A0) entre número e unidade, sinal de menos tipográfico (U+2212). |
| `Dado.valorNumerico` | Sempre em SI: m, kg, m/s², K, s, Pa. Porcentagens como fração (0,965). |
| `fisico.raioMedioKm` | Raio volumétrico médio. Para os gigantes, o diâmetro exibido é o equatorial a 1 bar (até 3,5 % maior). |
| `fisico.inclinacaoAxialGraus` | Obliquidade em relação ao plano da própria órbita. Acima de 90° indica rotação retrógrada (Vênus, Urano, Plutão). |
| `fisico.periodoRotacaoHoras` | Período sideral. Negativo = retrógrado. Planetas: em relação à eclíptica (convenção da NSSDCA). Luas: em relação ao sentido de rotação do pai. Por isso Titânia, Oberon e Caronte são positivas e Tritão é negativo. |
| `orbita.inclinacaoGraus` | Planetas e planetas anões: em relação à eclíptica. Luas: em relação ao plano de Laplace ou ao equador do pai (JPL), **exceto a Lua**, cuja referência é a eclíptica (5,145°). |
| `orbita` dos planetas anões | Elementos osculantes do JPL SBDB (época JD 2461200,5). Os períodos diferem alguns anos dos valores arredondados da NASA Science, e a nota avisa. |
| `ordem` | Posição por semieixo maior entre os filhos do mesmo pai. Não é o "número do planeta": Ceres é 5 e Júpiter é 6. |
| Texturas | Caminhos relativos a `/public`, sem barra inicial (`textures/terra/mapa.webp`). A versão 1K tem o sufixo `-1k`; use `caminhoTextura1k()`. Mapas equirretangulares 2:1, com longitude 0° no centro e leste à direita. Nas luas síncronas, a longitude 0° (centro do mapa) é a face voltada para o planeta (convenção IAU). |
| Anéis | `aneis.webp` é uma faixa radial com alfa: x = 0 corresponde a `raioInternoKm` e x = 1 a `raioExternoKm`. |

**Aviso para a cena:** não aplique o sinal negativo da rotação junto com uma obliquidade acima de 90°, senão a rotação inverte duas vezes. Gire com |período| em torno do eixo já inclinado.

## Fontes

O catálogo completo, com URL e data de acesso, está em `src/data/fontes.ts`. Resumo:

| Id | Fonte | Uso |
|---|---|---|
| `nssdca-*` | NASA NSSDCA Fact Sheets: tabela comparativa, Sol, Lua, cada planeta, Plutão e os anéis de Júpiter, Saturno, Urano e Netuno | Valores físicos e orbitais, atmosferas, anéis |
| `jpl-sats-fisicos`, `jpl-sats-orbitais` | JPL SSD, parâmetros físicos e elementos médios de satélites | Raio, GM e órbita das 13 luas; órbitas de Fobos e Deimos vêm da NSSDCA |
| `jpl-sbdb-*` | JPL Small-Body Database (Ceres, Haumea, Makemake, Éris) | Órbitas, rotação, diâmetro e GM de Ceres |
| `nasa-*` | Páginas da NASA Science | Contagem de luas, temperaturas de algumas luas, curiosidades |
| artigos | Ortiz et al. 2017; Ragozzine & Brown 2009; Sicardy et al. 2011; Brown & Schaller 2007; Szakáts et al. 2023; Bernstein et al. 2023; MGS/TES 1998 | Haumea, Éris e temperatura de Fobos |

## Valores com grande incerteza

Cada um tem uma `nota` explicando a ressalva:

- **Haumea:** o diâmetro de ~1.740 km é o valor de referência da NASA, mas o corpo é um elipsoide alongado com eixo maior ≥ 2.322 km. A gravidade foi omitida, porque varia muito na superfície. A massa tem incerteza de ~1 %.
- **Makemake:** o diâmetro é aproximado. O período de rotação de 22,83 h pode errar em até ~30 %, segundo o próprio JPL, porque a curva de luz foi observada só em parte. A massa não foi medida.
- **Éris:**
  - O diâmetro vem de uma ocultação em 2010 (2.326 km); a NASA arredonda para ~2.400 km.
  - A gravidade foi calculada com massa e raio de artigos diferentes.
  - A rotação de 15,79 dias, síncrona com Disnomia, é de 2023. O JPL e a NASA ainda citam 25,9 h, valor que o próprio JPL marca como incerto em ~30 %.
- **Temperaturas de planetas anões e luas:**
  - Plutão mostra a faixa da NSSDCA (24–38 K) e a média da NASA Science (−232 °C), porque as fontes divergem.
  - Éris é uma faixa de estimativas.
  - Fobos usa medidas pontuais de 1998.
- **Titânia e Oberon:** o GM tem incerteza de 2–3 %, e por isso também a massa e a gravidade.

### Divergências entre fontes e a escolha feita

| Valor | Divergência | Escolha |
|---|---|---|
| Temperatura média de Marte | Tabela da NSSDCA: −65 °C. Ficha de Marte: ~214 K (−59 °C). | Ficha de Marte, a mais detalhada |
| Temperatura de Plutão | NSSDCA: 24–38 K (o texto da página converte para −247 a −233 °C, de forma inconsistente). NASA Science: média de −232 °C, faixa de −240 a −226 °C. | Faixa em K da NSSDCA, convertida, mais a média da NASA, as duas com fonte |
| Massa de Deimos | NSSDCA: 2,4 × 10¹⁵ kg. GM do JPL: 1,44 × 10¹⁵ kg. | JPL, a fonte preferida para satélites |
| Caronte | Diâmetro: 1.212 km (JPL) ou 1.214 km (NASA). Distância: 19.596 km (NSSDCA), 19.600 km (JPL) ou 19.640 km (NASA). | JPL |
| Gravidade dos planetas | A tabela da NSSDCA usa o valor equatorial com rotação; as fichas individuais usam a média. | Tabela, exceto Marte (3,73) e Lua (1,62), das fichas; a diferença some no arredondamento |

## Valores omitidos

| Astro | Omitido | Motivo e candidatos para verificação futura |
|---|---|---|
| Io, Europa, Calisto, Titânia, Oberon, Caronte, Deimos | Temperatura | As páginas consultadas não trazem valor primário. Candidato para Europa: no máximo −160 °C no equador e −220 °C nos polos (fontes secundárias; JPL PIA01144 cita ~130 K ao meio-dia). |
| Ceres, Haumea, Makemake | Temperatura | Sem valor publicado em fonte preferida. Candidato para Ceres: máximo de ~235 K com o Sol a pino (Dawn/VIR, preliminar). |
| Makemake | Massa e gravidade | A órbita da lua MK2 ainda não permite medir a massa com confiança. |
| Haumea | Gravidade | A forma alongada torna enganoso um valor único. |
| Tritão | Pressão na superfície | Não está nas páginas consultadas (a Voyager 2 mediu ~14 µbar; falta fonte). |
| Titã | Pressão em bar | Exibida como "≈ 1,6 × Terra", conforme a NASA ("cerca de 60 % maior"); o valor da Huygens (~1,5 bar) não foi aberto em fonte primária. |
| Haumea, Makemake, Éris | Obliquidade | Desconhecida. `inclinacaoAxialGraus: 0` é só uma convenção de renderização e não aparece como `Dado`. As luas síncronas também usam ~0° (estado de Cassini), exceto a Lua (6,68°). |

## Pendências de verificação humana

Valores que dependem de fontes não abertas na verificação (`acessadoEm` vazio em `fontes.ts`):

| Valor | Onde | Fonte a conferir |
|---|---|---|
| Fobos: −112 °C na sombra e −4 °C ao sol | `marte.ts` | `mgs-fobos-1998` |
| Anel de Haumea: raio de ~2.287 km, largura de ~70 km, eixo maior ≥ 2.322 km | `haumea.ts`, `texturas.ts` | `ortiz-2017-haumea` |
| Massa de Haumea: 4,006 × 10²¹ kg | `haumea.ts` | `ragozzine-2009-haumea` |
| Raio de Éris: 1.163 km | `eris.ts` | `sicardy-2011-eris` |
| Massa de Éris: 1,66 × 10²² kg (e a gravidade e a curiosidade de "27 % mais massa" derivadas dela) | `eris.ts` | `brown-2007-eris` |
| Rotação de Éris: 15,7859 dias | `eris.ts` | `szakats-2023-eris`, `bernstein-2023-eris` |

Afirmações em textos e curiosidades que são conhecimento bem estabelecido, mas **não constam literalmente** das páginas abertas:

- **Lua:** 12 astronautas Apollo (1969–1972).
- **Marte:** Olympus Mons; Valles Marineris; descoberta de Fobos e Deimos por Asaph Hall (1877); destino de Fobos em "dezenas de milhões de anos"; nenhuma outra lua passa tão perto da superfície do seu planeta; significado dos nomes.
- **Júpiter:** a Grande Mancha Vermelha é acompanhada desde o século XIX; camadas de nuvens; hidrogênio metálico.
- **Saturno:** hexágono polar; partículas dos anéis "do tamanho de casas".
- **Titã:** dunas orgânicas; lagos perto dos polos; Huygens como o pouso mais distante já feito.
- **Urano:** descoberta em 1781; a Voyager 2 como única sonda; nomes de Shakespeare e Pope; atmosfera mais fria.
- **Netuno:** descoberta em 1846 por cálculo; volta completa em 2011; ventos mais rápidos; núcleo do tamanho aproximado da Terra.
- **Tritão:** única grande lua retrógrada; uma das superfícies mais frias; composição dos gelos.
- **Plutão:** Sputnik Planitia no "coração"; compostos orgânicos; possível oceano; congelamento da atmosfera.
- **Caronte:** interpretação dos cânions.
- **Ceres:** Dawn em órbita de 2015 a 2018; sais em Occator.
- **Haumea:** "um dos giros mais rápidos".
- **Éris:** gatilho da categoria de planeta anão; "disco disperso"; superfície muito clara.
- **Hipóteses** sobre a falta de luas em Mercúrio e Vênus.
- **Estrutura interna** descrita de forma qualitativa: zonas do Sol, camadas da Terra, núcleo de Io e terrenos de Ganimedes.

## Representação artística

`representacaoArtistica: true` marca os corpos **sem mapeamento global real**:

| Astro | Justificativa | Textura |
|---|---|---|
| Haumea, Makemake, Éris | Nunca foram fotografados com resolução; só há curvas de luz e espectros. | "Fictional" do Solar System Scope (CC BY 4.0) |
| Titânia, Oberon | A Voyager 2 (1986) fotografou só o hemisfério iluminado, o sul, e não há mosaico global público. | Procedural (crateras; vales em Titânia; fundos escuros em Oberon) |
| Tritão | A Voyager 2 (1989) cobriu só parte da lua, sobretudo o sul. | Mosaico real do USGS; a área sem imagens foi preenchida com a cor média |
| Deimos | Há imagens da Viking e da MRO, mas nenhum mosaico global público no acervo do USGS. | Procedural |

Também têm lacunas, mas **não** são artísticos, porque a maior parte da superfície é real:

- **Plutão e Caronte:** o sul estava na noite polar em 2015 e foi preenchido com o tom médio.
- **Europa, Ganimedes e Calisto:** pequenas lacunas polares preenchidas.
- **Titã:** mosaico real da superfície em infravermelho (938 nm), tingido de laranja.

Mapas originalmente em cinza (Europa, Ganimedes, Calisto, Titã, Plutão, Caronte) foram tingidos com uma cor próxima da real. Todos os ajustes estão em `CREDITS.md`.

## Como atualizar a contagem de luas

As contagens mudam com frequência; Saturno passou de 274 para 293 em 2025–2026.

1. Abra a página da NASA Science do planeta. A URL está em `src/data/fontes.ts`: `nasa-jupiter-luas`, `nasa-saturno-luas`, `nasa-urano-luas`, `nasa-netuno-luas`, `nasa-luas` (Marte e Plutão), `nasa-haumea`, `nasa-makemake` ou `nasa-eris`.
2. No arquivo do sistema (por exemplo, `src/data/saturno.ts`), mude o número em `luas(293, 'nasa-saturno-luas')`.
3. Registre a data da nova conferência:
   - se atualizou só esse astro, passe-a como 4º argumento: `luas(300, 'nasa-saturno-luas', undefined, '2027-03-15')`;
   - se conferiu todos, mude `LUAS_VERIFICADAS_EM` em `src/data/construtores.ts` e `VERIFICADO_EM` em `src/data/fontes.ts`.
4. Rode `npm run validar-dados`.

O `Dado` "Luas conhecidas" e `conteudo.luas` são gerados do mesmo objeto, então não há dois lugares para atualizar. As curiosidades evitam citar o número.

Contagens em 31/10/2026: Terra 1, Marte 2, Júpiter 115, Saturno 293 ("em agosto de 2026"), Urano 29 ("em agosto de 2026"), Netuno 16, Plutão 5, Haumea 2, Makemake 1 (provisória), Éris 1, Mercúrio, Vênus e Ceres 0.

## Como adicionar um astro

1. Crie a entrada no arquivo do sistema, ou um arquivo novo, usando os construtores de `construtores.ts` (`diametro`, `massa`, `temperatura`…), que já formatam em pt-BR.
2. Inclua a entrada em `bodies`, em `src/data/index.ts`.
3. Adicione a textura em `src/data/texturas.ts` e o crédito em `creditos.ts` e `CREDITS.md`. Depois rode `npm run baixar-texturas -- --somente=<id>`.
4. Se for um id fora do escopo original, inclua-o na lista `ESCOPO` de `src/data/dados.test.ts`.
5. Rode `npm run validar-dados`.

## Texturas

- `npm run baixar-texturas` baixa os originais para `.cache/texturas-originais/` (cerca de 1,5 GB, fora do bundle) e gera `public/textures/<id>/<tipo>.webp` (2K) e `<tipo>-1k.webp` (1K), com cerca de 12 MB no total.
- Opções: `--somente=terra,lua`, `--forcar` e `--sem-download` (só as procedurais).
- O anel de Saturno do Solar System Scope foi calibrado radialmente pelas bordas dos anéis B e A e pela Divisão de Cassini (69.669–141.867 km, erro de ~1.000–2.000 km) e recortado do anel C ao A.
- Os anéis de Júpiter, Urano, Netuno e Haumea são gerados a partir dos raios e larguras publicados. O alfa é ilustrativo e acompanha a profundidade óptica.
