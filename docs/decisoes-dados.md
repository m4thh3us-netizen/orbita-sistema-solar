# Decisões — Dados (especialista 3)

Decisões tomadas sem consulta, conforme as regras de colaboração. Os detalhes científicos estão em [`dados.md`](dados.md).

## Estrutura e API

1. **Imports com extensão `.ts` em `src/data/`.** O `tsconfig` permite (`allowImportingTsExtensions`), e assim o script de texturas importa os dados direto no Node 22.18+ (remoção de tipos nativa), sem build nem duplicação de números. Os imports internos são relativos e não dependem dos aliases `@/`.
2. **`types.ts` e `index.ts` seguem o contrato à risca.** Só adicionei comentários com as convenções e um export extra opcional, `caminhoTextura1k()`. Os tipos auxiliares (`Dado`, `Fonte`…) também são reexportados por `index.ts`.
3. **Construtores de `Dado` (`construtores.ts`).** Cada arquivo de astro passa só números e a fonte; a formatação pt-BR fica num lugar só. Isso também garante `valorNumerico` sempre em SI.
4. **Fonte única para a contagem de luas.** O `Dado` "Luas conhecidas" é gerado a partir do mesmo objeto de `conteudo.luas`.
5. **`bodies` em ordem de distância ao Sol, cada lua logo depois do seu planeta.** `getChildren` ordena por `ordem`.
6. **`ordem` = posição por distância entre irmãos**, contando os planetas anões: Ceres é 5 e Júpiter é 6. A interface não deve exibir `ordem` como "número do planeta".
7. **`exploravel3D: true` para os 26 astros.** Todos são navegáveis na cena; não há corpo só listado.
8. **`esquema.ts` (Zod), `texturas.ts` (manifesto) e os testes ficam em `src/data/` sem ser importados pela aplicação**, por isso não entram no bundle.

## Conteúdo

9. **Espaço não separável (U+00A0) entre número e unidade e menos tipográfico (U+2212)** em todos os valores, para evitar quebra de linha no meio de "12.742 km".
10. **Massa e gravidade num único `Dado`**, com a comparação entre parênteses: "6,42 × 10²³ kg (0,107 × Terra)". Mantém a lista compacta.
11. **Gravidade dos planetas:** valor equatorial com rotação, da tabela da NSSDCA, referência da Terra = 9,8 m/s². Luas: g = GM/r², do JPL.
12. **Temperatura sempre em °C no `valor` e o que ela representa, com o valor em K, na `nota`.** Faixas usam o construtor `faixaTemperatura`.
13. **Abas omitidas quando não há atmosfera relevante:** Mercúrio, Lua, Fobos, Deimos, Europa, Ganimedes, Calisto, Encélado, Titânia, Oberon, Caronte, Ceres, Haumea, Makemake e Éris. As exosferas aparecem nas curiosidades. Io e Tritão têm a aba, por causa das atmosferas de SO₂ e N₂.
14. **Valores sem fonte confiável foram omitidos, não estimados.** A lista e os candidatos estão em `dados.md`. Fontes citadas mas não abertas ficam com `acessadoEm: ''` e entram nas pendências.
15. **Obliquidade desconhecida (Haumea, Makemake, Éris) = 0**, só como convenção de renderização; ela não aparece como `Dado`.
16. **Rotação de Éris: 15,79 dias** (síncrona com Disnomia, artigos de 2023), em vez dos 25,9 h ainda citados pela NASA e pelo JPL, que o próprio JPL marca como incertos.
17. **Sinal da rotação das luas relativo ao pai.** Titânia, Oberon e Caronte são positivas; Tritão é negativo, porque orbita ao contrário. Assim a cena pode montar as luas no referencial equatorial do pai.

## Aparência e texturas

18. **Cores de acento** escolhidas e verificadas por teste: contraste ≥ 4,5:1 sobre `#05060A` (a menor razão é 6,6:1, Netuno) e ΔE76 ≥ 12 entre quaisquer duas (o mínimo é 12,8).
19. **Atmosfera visual** também em Júpiter e Saturno (0,2, sutil), no Sol (brilho da coroa) e em Plutão (névoa azul de 0,15 vista pela New Horizons). Tritão ficou sem atmosfera visual, por ser tênue demais.
20. **Anéis:**
    - Saturno: do anel C ao A (74.658–136.780 km). Os anéis D, F, G e E ficaram de fora por serem tênues ou estreitos.
    - Júpiter: do halo ao anel de Tebe, com alfa bem baixo.
    - Urano: do anel 6 ao ε.
    - Netuno: do Galle ao Adams.
    - Haumea: 2.252–2.322 km.
    - Todos são mostrados. Os de Júpiter, Netuno e Haumea quase não aparecem, e é proposital.
21. **Vênus usa o mapa das nuvens** do Solar System Scope, o que se vê de fora, e não o da superfície.
22. **Fobos usa o mosaico Viking (domínio público)**, e não o da Mars Express, que tem licença ESA com compartilhamento obrigatório.
23. **Texturas procedurais** para Deimos, Titânia e Oberon, já que não há mosaico global público. Usam relevo sombreado, crateras em lei de potência e semente fixa, então são reprodutíveis.
24. **Mosaicos em cinza tingidos** com uma cor próxima da real (Europa, Ganimedes, Calisto, Titã, Plutão, Caronte), e lacunas sem dados preenchidas com o tom médio. Tudo está registrado em `CREDITS.md`.
25. **Mapas normalizados:** longitude 0° no centro e leste à direita. Os mosaicos do USGS com longitude 180° no centro foram rolados meia largura.
26. **Originais em `.cache/texturas-originais/`** (cerca de 1,5 GB), fora do bundle. Pedi à Interface que inclua `.cache/` no `.gitignore`.
