import type { SeedLesson } from "./shared/course-builder";

// Conteúdo (dados puros) do seed "teoria-musical" — separado do runner (teoria-musical.ts) pra
// poder ser importado por testes sem arrastar a cadeia de services/next-auth. Fonte completa em
// docs/curso-teoria-musical.md. Cada aula: 2–3 seções de texto, exemplos de partitura, 2
// atividades e uma avaliação de 10 perguntas (parte delas de treino de ouvido, com áudio).

export const TEORIA_LESSONS: SeedLesson[] = [
  // ═══════════════ MÓDULO 1 — O tempo e o ritmo ═══════════════
  {
    title: "Módulo 1 · Aula 1 — Pulso, andamento e BPM",
    sections: [
      {
        title: "O pulso: a batida que não muda",
        markdown:
          "O **pulso** é a batida regular que faz o pé bater sozinho no chão. Ele é constante do " +
          "começo ao fim de uma música (salvo quando ela desacelera de propósito). Toda a teoria do " +
          "ritmo é sobre **encaixar sons dentro desse pulso** — mais nada.\n\n" +
          "Um jeito de treinar: ponha qualquer música e ande pela sala no passo dela. Se você " +
          "consegue marchar sem tropeçar, achou o pulso. Se ficou na dúvida entre dois \"passos\" " +
          "possíveis (um o dobro do outro), os dois estão certos — é o mesmo pulso contado em " +
          "velocidades diferentes.",
      },
      {
        title: "Andamento e BPM",
        markdown:
          "**Andamento** é a velocidade do pulso, medida em **BPM** (batidas por minuto). 60 BPM é " +
          "uma batida por segundo — a do ponteiro do relógio. 120 é o dobro; 90 fica no meio.\n\n" +
          "Faixas típicas: **balada** 60–76, **louvor moderado** 84–100, **animado** 104–132, " +
          "**corrido** acima de 140. Cante \"Parabéns pra você\" a 60, depois a 100 BPM: mesma " +
          "música, sensação bem diferente. Escolher o andamento **é uma decisão de interpretação**, " +
          "não um detalhe.",
      },
      {
        title: "Tempo forte e tempo fraco",
        markdown:
          "Dentro do pulso, algumas batidas soam **mais fortes** que outras. Conte \"**UM** dois " +
          "**UM** dois\" numa marcha, ou \"**UM** dois três\" numa valsa. Esse acento que se repete " +
          "é o que organiza o pulso em **grupos** — e cada grupo é um **compasso** (próxima aula).\n\n" +
          "O primeiro tempo do grupo é sempre o mais forte. Num grupo de quatro, o terceiro tempo " +
          "recebe um acento secundário, mais leve.",
      },
    ],
    examples: [
      {
        title: "Metrônomo a 90 BPM",
        caption: "Quatro semínimas por compasso a 90 BPM. A primeira de cada grupo é o tempo forte.",
        abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=90\nK:A\nA A A A | A A A A |",
      },
      {
        title: "O mesmo compasso, mais devagar",
        caption: "Quatro semínimas por compasso a 60 BPM — bata o pulso junto e compare a energia com o exemplo a 90.",
        abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=60\nK:A\nA A A A | A A A A |",
      },
    ],
    quiz: [
      { text: "O pulso de uma música, ao longo dela, é:", options: ["Sempre acelerando", "Constante (salvo desacelerações de propósito)", "Diferente em cada compasso"], correctIndex: 1 },
      { text: "BPM quer dizer:", options: ["Batidas por música", "Batidas por minuto", "Barras por minuto"], correctIndex: 1 },
      { text: "Se o pulso está em 60 BPM, cada batida dura:", options: ["Meio segundo", "Um segundo", "Dois segundos"], correctIndex: 1 },
      { text: "120 BPM em relação a 60 BPM é:", options: ["A metade da velocidade", "O dobro da velocidade", "A mesma velocidade"], correctIndex: 1 },
      { text: "Numa marcha você conta o acento forte a cada:", options: ["2 tempos", "3 tempos", "5 tempos"], correctIndex: 0 },
      { text: "Numa valsa o acento forte volta a cada:", options: ["2 tempos", "3 tempos", "4 tempos"], correctIndex: 1 },
      { text: "Num compasso de quatro tempos, o acento secundário (mais leve) cai no tempo:", options: ["2", "3", "4"], correctIndex: 1 },
      { text: "Um louvor \"moderado\" costuma ficar por volta de:", options: ["50 BPM", "90 BPM", "160 BPM"], correctIndex: 1 },
      { text: "Ouça as batidas: o andamento está mais perto de", options: ["70 BPM", "120 BPM", "170 BPM"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:C\nc c c c | c c c c |" },
      { text: "Ouça as batidas: o andamento está mais perto de", options: ["60 BPM", "90 BPM", "132 BPM"], correctIndex: 2, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=132\nK:C\nc c c c | c c c c |" },
    ],
    activities: [
      {
        title: "Estimar o BPM de três músicas",
        instructions:
          "Ouça três músicas curtas. Para cada uma, bata o pulso com a mão e diga se o andamento está " +
          "mais perto de 60, de 90 ou de 120 BPM. Marque como concluída quando tiver feito as três.",
        format: "none",
      },
      {
        title: "Cantar a mesma frase em três andamentos",
        instructions:
          "Grave você cantando \"Parabéns pra você\" três vezes: uma bem devagar (~60), uma moderada " +
          "(~96) e uma animada (~120). Descreva em uma frase o que muda na sensação.",
        format: "audio",
      },
    ],
  },
  {
    title: "Módulo 1 · Aula 2 — Compasso: 2/4, 3/4, 4/4 e 6/8",
    sections: [
      {
        title: "O acento agrupa o pulso",
        markdown:
          "Quando você conta \"UM dois UM dois\", está sentindo compassos de **2**. \"UM dois três\" é " +
          "**3** (valsa). \"UM dois três quatro\" é **4** — o mais comum na música popular e nos " +
          "louvores.\n\n" +
          "Na partitura, a **fórmula de compasso** aparece como dois números no início. O **de cima** " +
          "diz **quantos tempos** há no compasso. O **de baixo** diz **qual figura vale um tempo** " +
          "(4 = semínima, 8 = colcheia). Então `3/4` é \"três semínimas por compasso\"; `4/4` às " +
          "vezes aparece escrito como um \"C\".",
      },
      {
        title: "Compasso composto: 6/8",
        markdown:
          "Em `6/8` você conta seis colcheias, mas **sente dois pulsos grandes**, cada um dividido em " +
          "três: \"**UM**-da-da **dois**-da-da\". É o balanço de canções de embalar, de barcarolas e " +
          "de muito louvor mais \"rodado\".\n\n" +
          "`3/4` e `6/8` têm o mesmo número de colcheias (seis). A diferença é **onde cai o acento**: " +
          "`3/4` acentua de duas em duas colcheias (três grupos), `6/8` de três em três (dois grupos).",
      },
      {
        title: "Anacruse: quando a música começa antes do 1",
        markdown:
          "Muita melodia não começa no tempo forte — ela entra com uma ou duas notas **antes** do " +
          "primeiro tempo 1. Isso é a **anacruse** (ou \"levada\"). O \"Pa-\" de \"Parabéns\" e o " +
          "\"Je-\" de \"Jesus Cristo mudou meu viver\" são anacruses.\n\n" +
          "Ao contar a música para começar, quem conduz precisa deixar espaço para essa entrada — a " +
          "contagem termina e a voz já entra \"em cima\" do primeiro tempo forte.",
      },
    ],
    examples: [
      { title: "Valsa em 3/4", caption: "Três semínimas por compasso, acento no primeiro tempo.", abc: "X:1\nM:3/4\nL:1/4\nQ:1/4=120\nK:A\nA A A | A A A |" },
      { title: "Balanço em 6/8", caption: "Seis colcheias, mas dois pulsos grandes: UM-da-da dois-da-da.", abc: "X:1\nM:6/8\nL:1/8\nQ:3/8=76\nK:A\nA A A A A A | A2 A2 A2 |" },
      { title: "Anacruse em 4/4", caption: "Duas colcheias entram antes do primeiro tempo forte.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nz4 z2 A A | B2 A2 A4 |" },
    ],
    quiz: [
      { text: "Numa fórmula de compasso, o número de cima diz:", options: ["Qual figura vale um tempo", "Quantos tempos há no compasso", "O andamento"], correctIndex: 1 },
      { text: "Em `2/4`, o número de baixo (4) significa:", options: ["Dois compassos", "A semínima vale um tempo", "Quatro instrumentos"], correctIndex: 1 },
      { text: "`4/4` às vezes é escrito como:", options: ["Um C", "Um S", "Um 8"], correctIndex: 0 },
      { text: "Uma valsa está em compasso de:", options: ["2", "3", "4"], correctIndex: 1 },
      { text: "`3/4` e `6/8` têm o mesmo número de colcheias. O que muda?", options: ["O andamento sempre", "Onde cai o acento", "A tonalidade"], correctIndex: 1 },
      { text: "Em `6/8` você sente:", options: ["6 pulsos iguais", "2 pulsos divididos em 3", "3 pulsos divididos em 2"], correctIndex: 1 },
      { text: "Anacruse é:", options: ["O último compasso da música", "Uma ou mais notas antes do primeiro tempo forte", "Um acorde de abertura"], correctIndex: 1 },
      { text: "Ouça e conte: quantos tempos por ciclo?", options: ["2", "3", "4"], correctIndex: 1, promptAbc: "X:1\nM:3/4\nL:1/4\nQ:1/4=120\nK:C\n!accent!c c c | !accent!c c c |" },
      { text: "Ouça e conte: quantos tempos por ciclo?", options: ["2", "3", "4"], correctIndex: 2, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=110\nK:C\n!accent!c c c c | !accent!c c c c |" },
      { text: "Ouça: este trecho está em compasso simples (acento de 2 em 2 colcheias) ou composto (3 em 3)?", options: ["Simples", "Composto (6/8)"], correctIndex: 1, promptAbc: "X:1\nM:6/8\nL:1/8\nQ:3/8=80\nK:C\n!accent!c c c !accent!c c c |" },
    ],
    activities: [
      { title: "Classificar quatro trechos por compasso", instructions: "Ouça quatro trechos e classifique cada um como 2, 3, 4 ou 6/8, contando junto até o acento forte voltar.", format: "none" },
      { title: "Bater a diferença entre 3/4 e 6/8", instructions: "Grave você batendo palma: primeiro seis colcheias agrupadas de 2 em 2 (3/4), depois de 3 em 3 (6/8). Deixe o acento bem claro.", format: "audio" },
    ],
  },
  {
    title: "Módulo 1 · Aula 3 — Figuras e valores",
    sections: [
      {
        title: "A árvore de divisão",
        markdown:
          "Toda figura é o **dobro ou a metade** da vizinha. A **semibreve** dura 4 tempos; a " +
          "**mínima**, 2; a **semínima**, 1; a **colcheia**, meio tempo (duas por tempo); a " +
          "**semicolcheia**, um quarto de tempo (quatro por tempo).\n\n" +
          "Cante: \"**tá**\" para semínima, \"**tá-á**\" para mínima, \"**ti-ti**\" para duas " +
          "colcheias, \"**ti-ri-ti-ri**\" para quatro semicolcheias. Cada silêncio também tem sua " +
          "figura: **pausa** de semibreve, de mínima, de semínima, etc.",
      },
      {
        title: "Ponto de aumento e ligadura de valor",
        markdown:
          "Um **ponto** ao lado da figura soma **metade do valor dela**. Semínima pontuada = 1 tempo + " +
          "meio = 1½ tempo — o ritmo \"**tá---ti**\" que abre tanta melodia.\n\n" +
          "Uma **ligadura de valor** é uma curva que une **duas notas da mesma altura** numa só, " +
          "somando as durações. Serve para prolongar um som **através da barra de compasso**, quando " +
          "nenhuma figura sozinha daria a duração certa.",
      },
    ],
    examples: [
      { title: "Leitura rítmica", caption: "Compasso 1: mínima + duas colcheias. Compasso 2: semínima pontuada + colcheia + duas colcheias. Compasso 4: semibreve.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:A\nA4 A2 A2 | A3 A A2 A2 | A2 A2 A A A A | A8 |" },
      { title: "Ligadura através da barra", caption: "A última nota do compasso 1 se prolonga no compasso 2 — um som só, dois compassos.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:A\nA A A A- | A A2 A |" },
    ],
    quiz: [
      { text: "Quantas colcheias cabem numa semínima?", options: ["Uma", "Duas", "Quatro"], correctIndex: 1 },
      { text: "Quantas semicolcheias cabem numa semínima?", options: ["Duas", "Três", "Quatro"], correctIndex: 2 },
      { text: "Num compasso 4/4, a semibreve ocupa:", options: ["Um tempo", "Dois tempos", "O compasso inteiro"], correctIndex: 2 },
      { text: "A mínima dura:", options: ["1 tempo", "2 tempos", "4 tempos"], correctIndex: 1 },
      { text: "A semínima pontuada dura:", options: ["1 tempo", "1 tempo e meio", "2 tempos"], correctIndex: 1 },
      { text: "O ponto de aumento soma:", options: ["O mesmo valor da figura", "Metade do valor da figura", "Um tempo fixo"], correctIndex: 1 },
      { text: "Uma ligadura de valor une duas notas:", options: ["De alturas diferentes", "Da mesma altura, somando a duração", "Só na leitura, sem mudar o som"], correctIndex: 1 },
      { text: "Silêncios na partitura são marcados por:", options: ["Pontos", "Pausas (uma figura para cada duração)", "Ligaduras"], correctIndex: 1 },
      { text: "Ouça: a primeira figura é uma semínima ou uma mínima?", options: ["Semínima", "Mínima"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:C\nc2 c c |" },
      { text: "Ouça as duas figuras: a segunda dura o dobro da primeira?", options: ["Sim", "Não, dura a metade"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=90\nK:C\nc c2 z |" },
    ],
    activities: [
      { title: "Leitura rítmica com palma", instructions: "Toque o primeiro exemplo em loop lento e bata cada figura com a palma, falando \"tá / tá-á / ti-ti / ti-ri-ti-ri\". Repita até acertar o compasso 2 sem hesitar.", format: "none" },
      { title: "Escrever um ritmo de 2 compassos", instructions: "Em texto, escreva um ritmo de 2 compassos em 4/4 usando \"tá\", \"tá-á\", \"ti-ti\" e pelo menos uma figura pontuada. Some os valores e confira que cada compasso dá 4 tempos.", format: "text" },
    ],
  },
  {
    title: "Módulo 1 · Aula 4 — Subdivisão, síncope e levada",
    sections: [
      {
        title: "Colcheias retas e em swing",
        markdown:
          "Duas colcheias podem ser **iguais** (\"ti-ti\", metade exata do tempo cada) ou " +
          "**desiguais** (\"tiii-ti\", a primeira mais longa) — o chamado *swing* ou *suingue*. Muita " +
          "música gospel, blues, jazz e parte do samba usa colcheias com algum grau de swing.\n\n" +
          "Não existe \"certo\" e \"errado\" — é uma escolha de estilo. Mas dentro de uma mesma " +
          "música o grau de swing costuma ser constante: todo mundo balança igual.",
      },
      {
        title: "Contratempo",
        markdown:
          "O **contratempo** é o \"**e**\" da contagem \"1 **e** 2 **e** 3 **e** 4 **e**\" — a metade " +
          "fraca do tempo.\n\n" +
          "O exercício que destrava o suingue: o pé marca os **tempos** (1-2-3-4) e a palma bate só " +
          "nos **contratempos** (os \"e\"). No começo parece impossível; depois de um tempo, fica " +
          "automático — e é exatamente o que a caixa da bateria faz num groove.",
      },
      {
        title: "Síncope",
        markdown:
          "**Síncope** é quando um som **começa numa parte fraca e se prolonga sobre a parte forte " +
          "seguinte**, \"roubando\" o acento. É o que dá o balanço em \"cka-**tchá**\".\n\n" +
          "Na prática, quase toda linha de melodia popular tem pelo menos uma síncope — é ela que " +
          "faz a melodia \"não bater igual\" ao acompanhamento e criar movimento.",
      },
    ],
    examples: [
      { title: "Reto x sincopado", caption: "Compasso 1: colcheias retas. Compasso 3: síncope (colcheia + semínima ligada ao tempo forte).", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nA2 A2 A2 A2 | A A A A A A A A | A2 A4 A2 | A A2 A2 A2 A |" },
      { title: "Só contratempo", caption: "As notas caem sempre no \"e\" do tempo — bata o pé nos tempos e ouça a tensão.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:A\nz A z A z A z A | z A z A z A z A |" },
    ],
    quiz: [
      { text: "Colcheias em swing são:", options: ["Sempre iguais", "Desiguais — a primeira um pouco mais longa", "Mais rápidas que colcheias retas"], correctIndex: 1 },
      { text: "O contratempo é:", options: ["O tempo forte", "A metade fraca do tempo (o \"e\")", "O último compasso"], correctIndex: 1 },
      { text: "No groove de bateria, quem toca o contratempo do compasso (2 e 4) é normalmente:", options: ["O bumbo", "A caixa", "O prato de ataque"], correctIndex: 1 },
      { text: "O que caracteriza a síncope?", options: ["Tocar mais rápido", "Um som começar no fraco e segurar sobre o forte", "Parar no meio do compasso"], correctIndex: 1 },
      { text: "Dentro de uma mesma música, o grau de swing costuma ser:", options: ["Diferente a cada compasso", "Constante — todos balançam igual", "Só no refrão"], correctIndex: 1 },
      { text: "Quase toda melodia popular tem pelo menos:", options: ["Um acorde diminuto", "Uma síncope", "Uma modulação"], correctIndex: 1 },
      { text: "Ouça as duas frases: qual está em swing?", options: ["A primeira", "A segunda"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=100\nK:C\nc c c c z4 | c3/2 c/2 c3/2 c/2 z4 |" },
      { text: "Ouça: as notas caem no tempo ou no contratempo?", options: ["No tempo", "No contratempo (o \"e\")"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:C\nz c z c z c z c |" },
      { text: "Ouça as duas frases: qual tem síncope?", options: ["A primeira", "A segunda"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:C\nc2 c4 c2 | c c c c c c c c |" },
      { text: "Reto e swing tocam as mesmas notas. O que muda é:", options: ["A afinação", "A divisão das colcheias (iguais x desiguais)", "O número de compassos"], correctIndex: 1 },
    ],
    activities: [
      { title: "Manter pé e contratempo juntos", instructions: "Com uma gravação tocando: marque os tempos com o pé e bata palma só nos contratempos por 8 compassos, sem perder o pé. Marque como concluída quando conseguir sem tropeçar.", format: "none" },
      { title: "Cantar a frase sincopada", instructions: "Cante a linha sincopada do primeiro exemplo junto do modelo (\"Cantar junto\"), prestando atenção em segurar a nota sobre o tempo forte.", format: "audio" },
    ],
  },
  {
    title: "Módulo 1 · Aula 5 — Como a bateria organiza o tempo",
    sections: [
      {
        title: "As três funções básicas",
        markdown:
          "Numa levada de música popular: o **bumbo** (grave, \"bum\") marca os tempos fortes, em " +
          "especial o **1**; a **caixa** (seca, \"tá\") marca o **contratempo do compasso** — nos " +
          "tempos **2 e 4** num 4/4, o chamado *backbeat*; o **chimbal** (ou prato de condução) toca " +
          "a **subdivisão**, mantendo as colcheias correndo para todo mundo se guiar.\n\n" +
          "Bater palma nos tempos 2 e 4 de um louvor animado é literalmente imitar a caixa.",
      },
      {
        title: "Backbeat, meio-tempo e viradas",
        markdown:
          "Quando a caixa muda de **2 e 4** para **1 e 3**, a sensação vira de marcha. Quando ela sai " +
          "e volta só na metade da velocidade, é o *meio-tempo* — usado para \"segurar\" um trecho " +
          "sem parar.\n\n" +
          "Nas quebras de frase (a cada 4 ou 8 compassos) a bateria faz uma **virada** — um mini-solo " +
          "de 1 ou 2 tempos que \"anuncia\" a próxima parte. E ela muda de **densidade**: mais leve " +
          "na estrofe (só chimbal e bumbo), cheia no refrão (prato aberto, caixa forte).",
      },
    ],
    examples: [
      { title: "Esqueleto de um groove (representado com notas)", caption: "Linha de cima = chimbal em colcheias; do meio = caixa em 2 e 4; de baixo = bumbo em 1 e no \"e\" do 3.", abc: "X:1\nM:4/4\nL:1/8\nV:1\nV:2\nV:3\nK:C\n[V:1] G G G G G G G G |\n[V:2] z2 c2 z2 c2 |\n[V:3] C2 z2 z C z2 |" },
    ],
    quiz: [
      { text: "O bumbo normalmente marca:", options: ["O contratempo", "Os tempos fortes, sobretudo o 1", "A subdivisão"], correctIndex: 1 },
      { text: "A caixa, no backbeat de um 4/4, toca nos tempos:", options: ["1 e 3", "2 e 4", "Todos"], correctIndex: 1 },
      { text: "A peça que mantém as colcheias correndo é:", options: ["O bumbo", "A caixa", "O chimbal"], correctIndex: 2 },
      { text: "Quando a caixa vai para 1 e 3, a sensação é de:", options: ["Valsa", "Marcha", "Balada"], correctIndex: 1 },
      { text: "Meio-tempo é quando a caixa:", options: ["Dobra de velocidade", "Espaça, tocando na metade da frequência", "Some de vez"], correctIndex: 1 },
      { text: "Uma virada de bateria serve para:", options: ["Acelerar a música", "Anunciar a mudança de parte, nas quebras de frase", "Afinar os tambores"], correctIndex: 1 },
      { text: "Comparada à estrofe, a bateria no refrão costuma ficar:", options: ["Mais contida", "Mais cheia (prato aberto, caixa forte)", "Igual"], correctIndex: 1 },
      { text: "Ouça o groove: a caixa está em 1 e 3 ou em 2 e 4?", options: ["1 e 3", "2 e 4"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nK:C\nz2 c2 z2 c2 | z2 c2 z2 c2 |" },
      { text: "Ouça: chimbal em colcheias contínuas ou espaçado?", options: ["Contínuas", "Espaçado"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nK:C\nG G G G G G G G |" },
      { text: "Bater palma nos tempos 2 e 4 de um louvor é imitar:", options: ["O bumbo", "A caixa", "O chimbal"], correctIndex: 1 },
    ],
    activities: [
      { title: "Identificar as peças de ouvido", instructions: "Ouça três levadas. Para cada uma, diga: a caixa está em 2 e 4 ou em 1 e 3? O chimbal está em colcheias ou mais espaçado? O bumbo reforça o 1?", format: "none" },
      { title: "Bater um groove simples", instructions: "Grave você marcando um groove com a boca ou palmas por 8 compassos: \"bum\" (bumbo) no 1, \"tá\" (caixa) no 2 e 4, e \"ts\" (chimbal) nas colcheias. Segure o andamento.", format: "audio" },
    ],
  },

  // ═══════════════ MÓDULO 2 — Altura e intervalos ═══════════════
  {
    title: "Módulo 2 · Aula 6 — Altura, as sete notas e a oitava",
    sections: [
      {
        title: "Grave, agudo e os sete nomes",
        markdown:
          "**Altura** é o quão **grave** (som \"gordo\", corda solta do baixo) ou **agudo** (som " +
          "\"fino\", assobio) é uma nota. Fisicamente é a velocidade da vibração — mais rápido, mais " +
          "agudo.\n\n" +
          "As notas se chamam **Dó, Ré, Mi, Fá, Sol, Lá, Si** e depois **repetem**: o Dó seguinte é " +
          "\"o mesmo som, mais agudo\". Essa distância de um nome até a próxima repetição dele é a " +
          "**oitava**. Duas notas a uma oitava soam tão parecidas que ganham o mesmo nome.",
      },
      {
        title: "Dó-móvel: a escala é um molde",
        markdown:
          "Neste curso usamos **dó-móvel**: \"Dó\" não é uma nota fixa, é o **primeiro grau** da " +
          "escala em que a música está. Em **Lá maior**, quem faz o papel de \"Dó\" é o **Lá**.\n\n" +
          "O que importa é a **sequência de distâncias** entre os graus — o molde — não os nomes " +
          "absolutos. Aprender a cantar \"Dó Ré Mi Fá Sol Lá Si Dó\" subindo e descendo, em qualquer " +
          "tom, é o alicerce de todo o resto do curso.",
      },
      {
        title: "Seu âmbito vocal",
        markdown:
          "**Âmbito** é a distância entre a nota mais grave e a mais aguda que você canta com " +
          "conforto. Cante a mais grave que alcança sem \"engrossar demais\", depois a mais aguda sem " +
          "gritar: esse é o seu âmbito de trabalho.\n\n" +
          "Isso importa na hora de escolher o **tom** de uma música e de distribuir vozes num grupo — " +
          "sobretudo com cantores de idade, que muitas vezes precisam de tons mais graves.",
      },
    ],
    examples: [
      { title: "Escala de Lá maior com os graus", caption: "Os graus 1 a 8 escritos sob cada nota da escala, subindo e descendo.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=76\nK:A\n\"_1\"A \"_2\"B \"_3\"c \"_4\"d | \"_5\"e \"_6\"f \"_7\"g \"_8\"a | a g f e | d c B A |" },
      { title: "A oitava", caption: "A mesma nota (Lá), grave e depois uma oitava acima — soam \"iguais\".", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=72\nK:A\nA a | A a |" },
    ],
    quiz: [
      { text: "Altura é:", options: ["O volume do som", "O quão grave ou agudo é o som", "A duração da nota"], correctIndex: 1 },
      { text: "Quantos nomes de nota existem antes de repetir?", options: ["Cinco", "Sete", "Doze"], correctIndex: 1 },
      { text: "A distância de um Dó até o próximo Dó chama-se:", options: ["Quinta", "Oitava", "Compasso"], correctIndex: 1 },
      { text: "Duas notas a uma oitava de distância:", options: ["Soam muito diferentes", "Soam tão parecidas que têm o mesmo nome", "Formam um acorde dissonante"], correctIndex: 1 },
      { text: "Em dó-móvel, \"Dó\" é:", options: ["Sempre a tecla branca central do piano", "O primeiro grau da escala da música", "A nota mais grave da voz"], correctIndex: 1 },
      { text: "Em Lá maior, quem faz o papel de grau 1 (\"Dó\")?", options: ["Dó", "Lá", "Sol"], correctIndex: 1 },
      { text: "Âmbito vocal é:", options: ["O andamento confortável para cantar", "A distância entre a nota mais grave e a mais aguda que você canta bem", "O número de músicas que você sabe"], correctIndex: 1 },
      { text: "Ouça as duas notas: elas estão a uma oitava de distância?", options: ["Sim", "Não"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\nC c |" },
      { text: "Ouça: a segunda nota é mais grave ou mais aguda?", options: ["Mais grave", "Mais aguda"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\nC G |" },
      { text: "Ouça a escala: ela sobe ou desce?", options: ["Sobe", "Desce"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=100\nK:C\nc B A G | F E D C |" },
    ],
    activities: [
      { title: "Cantar a escala nos dois sentidos", instructions: "Cante a escala de Lá maior ascendente e descendente três vezes junto do exemplo (\"Cantar junto\"). Depois cante só os graus 1–3–5–8 — o esqueleto do acorde.", format: "audio" },
      { title: "Anotar seu âmbito", instructions: "Em texto: qual a nota mais grave e a mais aguda que você canta com conforto? Que tom (aproximado) você escolheria para uma música cujo refrão sobe bastante?", format: "text" },
    ],
  },
  {
    title: "Módulo 2 · Aula 7 — Tom, semitom e a escala maior",
    sections: [
      {
        title: "A menor distância: o semitom",
        markdown:
          "**Semitom** é a menor distância entre duas notas na música ocidental — no piano, uma tecla " +
          "e a **imediatamente** seguinte (contando as pretas). **Tom** é o dobro: duas teclas de " +
          "distância.\n\n" +
          "Entre **Mi e Fá** e entre **Si e Dó** há só **semitom** (não existe tecla preta entre " +
          "eles). Entre todos os outros nomes vizinhos há um **tom**. Decorar esses dois pares é meio " +
          "caminho andado.",
      },
      {
        title: "A fórmula da escala maior",
        markdown:
          "Toda escala maior segue o mesmo molde de distâncias, do grau 1 ao 8:\n\n" +
          "**Tom – Tom – semitom – Tom – Tom – Tom – semitom.**\n\n" +
          "Comece em qualquer nota, siga essa receita e você tem uma escala maior. Comece no **Lá** e " +
          "a receita obriga a usar **Fá#, Dó# e Sol#** — por isso Lá maior \"tem três sustenidos\" na " +
          "armadura de clave.",
      },
      {
        title: "Os dois semitons são os pontos de encaixe",
        markdown:
          "Os dois semitons da escala — entre **3 e 4** e entre **7 e 8** — são onde a escala " +
          "\"aperta\" e quer resolver. O **7 subindo para o 8** (a \"sensível\" puxando para a " +
          "tônica) é o efeito que a harmonia funcional inteira vai explorar. Cante 7–8 várias vezes: " +
          "sente esse \"puxão\" para casa.",
      },
    ],
    examples: [
      { title: "Escala de Lá maior com tons e semitons", caption: "T = tom, st = semitom, entre cada par de graus.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\n\"_T\"A \"_T\"B \"_st\"c | \"_T\"d \"_T\"e \"_T\"f | \"_st\"g a2 |" },
      { title: "O puxão da sensível (7 → 8)", caption: "Sol# (grau 7) resolvendo no Lá (grau 8). Cante junto e sinta o repouso.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=76\nK:A\ng4 | g2 a2 | a4 |" },
    ],
    quiz: [
      { text: "Semitom é:", options: ["A menor distância entre duas notas", "Sempre entre teclas brancas", "O dobro de um tom"], correctIndex: 0 },
      { text: "Entre Mi e Fá há:", options: ["Um tom", "Um semitom", "Um tom e meio"], correctIndex: 1 },
      { text: "Entre Si e Dó há:", options: ["Um tom", "Um semitom", "Uma terça"], correctIndex: 1 },
      { text: "A fórmula da escala maior é:", options: ["st–T–T–st–T–T–T", "T–T–st–T–T–T–st", "T–st–T–st–T–st–T"], correctIndex: 1 },
      { text: "Lá maior usa quais sustenidos?", options: ["Fá# e Dó#", "Fá#, Dó# e Sol#", "Fá#, Dó#, Sol# e Ré#"], correctIndex: 1 },
      { text: "Os dois semitons da escala maior ficam entre os graus:", options: ["1–2 e 5–6", "3–4 e 7–8", "2–3 e 6–7"], correctIndex: 1 },
      { text: "A \"sensível\" é o grau que puxa para a tônica. É o grau:", options: ["4", "6", "7"], correctIndex: 2 },
      { text: "Ouça a escala: ela é maior ou tem o 3º grau abaixado (menor)?", options: ["Maior", "Menor"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=104\nK:C\nC D E F | G A B c |" },
      { text: "Ouça as duas notas: a distância é um tom ou um semitom?", options: ["Tom", "Semitom"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\nE F |" },
      { text: "Ouça as duas notas: tom ou semitom?", options: ["Tom", "Semitom"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\nC D |" },
    ],
    activities: [
      { title: "Montar Ré maior pela fórmula", instructions: "No teclado do editor, monte a escala de Ré maior aplicando T–T–st–T–T–T–st a partir do Ré. Confira: você deve ter usado Fá# e Dó#.", format: "none" },
      { title: "Cantar e descrever o 7→8", instructions: "Grave você cantando a escala de Lá maior e, no fim, repetindo três vezes só o Sol#–Lá (7–8). Descreva em uma frase a sensação do grau 7.", format: "audio" },
    ],
  },
  {
    title: "Módulo 2 · Aula 8 — Intervalos: número e qualidade",
    sections: [
      {
        title: "O número: conte as pontas",
        markdown:
          "O **número** do intervalo é quantos graus ele abrange, **contando a nota de partida e a de " +
          "chegada**. De Dó a Mi: Dó(1) Ré(2) Mi(3) → **terça**. De Dó a Sol → **quinta**. Da nota " +
          "até ela mesma → **uníssono**; até a oitava repetição → **oitava**.",
      },
      {
        title: "A qualidade: maior, menor, justa",
        markdown:
          "O número não basta. Uma terça pode ser **maior** (Dó–Mi, dois tons) ou **menor** " +
          "(Ré–Fá, tom e meio). As **segundas, terças, sextas e sétimas** vêm em maior/menor. As " +
          "**quartas, quintas e oitavas** são **justas** (não têm versão \"maior\"), com uma exceção " +
          "famosa: o **trítono** (quarta aumentada / quinta diminuta), tema da Aula 10.",
      },
      {
        title: "Melódico e harmônico",
        markdown:
          "Um intervalo **melódico** é as duas notas uma depois da outra (como numa melodia). Um " +
          "intervalo **harmônico** é as duas ao mesmo tempo (como num acorde). O nome é o mesmo; o " +
          "que muda é o jeito de ouvir. Treine cada intervalo dos dois modos, partindo sempre da " +
          "tônica (Lá), até conseguir prever o som antes de tocar.",
      },
    ],
    examples: [
      { title: "Intervalos a partir do Lá (melódicos)", caption: "2ª maior, 3ª maior, 4ª justa, 5ª justa, 6ª maior, 7ª maior e 8ª.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\n\"_2M\"A B | \"_3M\"A c | \"_4J\"A d | \"_5J\"A e | \"_6M\"A f | \"_7M\"A g | \"_8\"A a |" },
      { title: "3ª maior x 3ª menor", caption: "Primeiro Dó–Mi (dois tons, \"aberta\"), depois Ré–Fá (tom e meio, \"fechada\").", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:C\nC E | D F |" },
    ],
    quiz: [
      { text: "De Dó a Mi (contando Dó–Ré–Mi) o intervalo é uma:", options: ["Segunda", "Terça", "Quarta"], correctIndex: 1 },
      { text: "Ao contar um intervalo, você conta:", options: ["Só as notas do meio", "As duas notas das pontas incluídas", "Só a nota de chegada"], correctIndex: 1 },
      { text: "Quais intervalos vêm em \"maior\" e \"menor\"?", options: ["Quartas, quintas e oitavas", "Segundas, terças, sextas e sétimas", "Todos"], correctIndex: 1 },
      { text: "Quais intervalos são chamados \"justos\"?", options: ["2ª, 3ª e 6ª", "4ª, 5ª e 8ª", "Nenhum"], correctIndex: 1 },
      { text: "Intervalo melódico é:", options: ["As duas notas ao mesmo tempo", "As duas notas uma depois da outra", "Só o número, sem qualidade"], correctIndex: 1 },
      { text: "A 3ª maior tem:", options: ["Um tom e meio", "Dois tons", "Dois tons e meio"], correctIndex: 1 },
      { text: "Ouça o intervalo (melódico, ascendente):", options: ["3ª maior", "4ª justa", "5ª justa", "2ª maior"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA c" },
      { text: "Ouça o intervalo (harmônico):", options: ["3ª maior", "5ª justa", "6ª maior", "8ª"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[Ae]" },
      { text: "Ouça o intervalo (melódico, ascendente):", options: ["5ª justa", "6ª maior", "3ª menor"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA f" },
      { text: "Ouça o intervalo (melódico, ascendente):", options: ["3ª maior", "4ª justa", "5ª justa"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA d" },
    ],
    activities: [
      { title: "Treinador de intervalos — 10 rodadas", instructions: "Use o treinador de intervalos (bloco na aula, modo intervalo, tônicas Lá/Ré/Mi, conjunto 2M/3m/3M/4J/5J/6M, ascendente). Faça 10 rodadas e anote seu acerto.", format: "none" },
      { title: "Cantar intervalos a partir do Lá", instructions: "Grave você cantando, a partir do Lá: 3ª maior, 4ª justa, 5ª justa e 8ª — melódicos ascendentes. Confira contra o exemplo.", format: "audio" },
    ],
  },
  {
    title: "Módulo 2 · Aula 9 — Reconhecer intervalos por músicas-referência",
    sections: [
      {
        title: "A técnica da âncora",
        markdown:
          "O jeito mais rápido de aprender a **ouvir** intervalo é associar cada um ao **começo de " +
          "uma música** que você já conhece. Quando ouvir um salto e não souber o nome, cante a " +
          "música-âncora daquele salto e compare.\n\n" +
          "A âncora funciona melhor quando é automática para você — então adapte a tabela abaixo " +
          "para músicas do seu repertório e do dos seus alunos.",
      },
      {
        title: "Tabela de âncoras (ascendentes)",
        markdown:
          "| Intervalo | Música-âncora (primeiras notas) |\n|---|---|\n" +
          "| 2ª maior | \"Pa-**ra**béns pra você\" |\n" +
          "| 3ª maior | \"**A**-ti-rei o pau no gato\" |\n" +
          "| 4ª justa | abertura de muitos hinos (\"**Noi**-te feliz\") |\n" +
          "| 5ª justa | tema de *2001* (\"Assim falou Zaratustra\") |\n" +
          "| 6ª maior | \"**My** Bonnie lies over the ocean\" |\n" +
          "| 8ª justa | \"**Some**-where over the rainbow\" |",
      },
      {
        title: "Descendentes têm outras âncoras",
        markdown:
          "Um intervalo descendo soa diferente e pede outra âncora. 3ª maior descendo = \"**Do**-ré-mi\" " +
          "ao contrário; 4ª justa descendo = \"O **Cra**-vo brigou com a rosa\"; 5ª justa descendo = " +
          "tema dos *Flintstones*. Na prática você só precisa dominar bem os ascendentes primeiro.",
      },
    ],
    examples: [
      { title: "3ª maior ascendente", caption: "As duas primeiras notas de \"Atirei o pau no gato\", a partir do Lá.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=96\nK:A\nA c c c | c4 |" },
      { title: "8ª ascendente", caption: "O salto de \"Some-where\" (Somewhere over the rainbow), a partir do Dó.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=72\nK:C\nC c | B2 |" },
    ],
    quiz: [
      { text: "A técnica da âncora consiste em:", options: ["Decorar a partitura de cada intervalo", "Associar cada intervalo ao começo de uma música conhecida", "Tocar o intervalo mais devagar"], correctIndex: 1 },
      { text: "\"Parabéns pra você\" (pa-ra) começa com um intervalo de:", options: ["2ª maior", "3ª maior", "4ª justa"], correctIndex: 0 },
      { text: "\"Atirei o pau no gato\" (a-ti) começa com:", options: ["3ª maior", "4ª justa", "5ª justa"], correctIndex: 0 },
      { text: "O tema de *2001* / \"Zaratustra\" abre com:", options: ["4ª justa", "5ª justa", "8ª"], correctIndex: 1 },
      { text: "\"Somewhere over the rainbow\" (Some-where) abre com:", options: ["6ª maior", "7ª maior", "8ª justa"], correctIndex: 2 },
      { text: "Um intervalo descendo, comparado ao mesmo intervalo subindo:", options: ["Soa exatamente igual", "Soa diferente e pede outra âncora", "Não existe"], correctIndex: 1 },
      { text: "Ouça e escolha a âncora:", options: ["\"Atirei o pau no gato\" (3ª maior)", "\"Parabéns pra você\" (2ª maior)", "\"My Bonnie\" (6ª maior)"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nA c" },
      { text: "Ouça e escolha a âncora:", options: ["\"Noite feliz\" (4ª justa)", "\"Somewhere over the rainbow\" (8ª)", "\"Atirei o pau no gato\" (3ª maior)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nA a" },
      { text: "Ouça e escolha a âncora:", options: ["\"My Bonnie\" (6ª maior)", "\"Parabéns pra você\" (2ª maior)", "\"Zaratustra\" (5ª justa)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nA B" },
      { text: "Ouça e escolha a âncora:", options: ["\"Atirei o pau no gato\" (3ª maior)", "\"Zaratustra\" (5ª justa)", "\"Cravo brigou com a rosa\" (4ª descendo)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nA e" },
    ],
    activities: [
      { title: "Montar suas próprias âncoras", instructions: "Para cada um dos 7 intervalos da Aula 8, escreva em texto uma música que VOCÊ conhece que comece com ele. Pode ser diferente da tabela.", format: "text" },
      { title: "Cantar intervalo + âncora", instructions: "Grave você cantando: para 3ª maior, 4ª justa e 5ª justa, primeiro o intervalo solto (a partir do Lá) e logo em seguida o começo da música-âncora.", format: "audio" },
    ],
  },
  {
    title: "Módulo 2 · Aula 10 — Consonância, dissonância e o trítono",
    sections: [
      {
        title: "Repouso e tensão",
        markdown:
          "Alguns intervalos soam **estáveis, resolvidos** — dá para parar neles: **3ªs, 6ªs, 5ªs " +
          "justas, oitavas, uníssono** (as **consonâncias**). Outros soam **instáveis, pedindo " +
          "continuação**: **2ªs, 7ªs e o trítono** (as **dissonâncias**).\n\n" +
          "Não é \"feio\" contra \"bonito\" — a música usa a tensão **de propósito**, para depois " +
          "resolver. Sem tensão nenhuma, tudo soa parado.",
      },
      {
        title: "O trítono",
        markdown:
          "**Trítono** é a distância de **três tons** (quarta aumentada / quinta diminuta) — de Fá a " +
          "Si, por exemplo. É o intervalo mais tenso da música tonal, apelidado no passado de \"o " +
          "diabo na música\".\n\n" +
          "Ele é o **motor do acorde de dominante** (Aula 15): quando seu ouvido reconhece um " +
          "trítono, ele já **espera** a resolução.",
      },
      {
        title: "Como a tensão resolve",
        markdown:
          "A tensão resolve por **movimento de semitom em direções contrárias**. No trítono Fá–Si, o " +
          "**Fá desce para Mi** e o **Si sobe para Dó** — as duas notas \"se fecham\" numa terça (ou " +
          "sexta).\n\n" +
          "É esse gesto, repetido milhões de vezes na história da música, que o final \"V–I\" " +
          "produz. Ouvir e cantar essa resolução é ouvir a harmonia funcional inteira em miniatura.",
      },
    ],
    examples: [
      { title: "Trítono resolvendo", caption: "O trítono Fá–Si (harmônico) resolvendo em Mi–Dó, e depois um acorde de repouso.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\n[FB] [Ec] | [DG]2 |" },
      { title: "Consoante x dissonante", caption: "Primeiro uma 3ª maior (repouso), depois uma 7ª maior (tensão).", abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CE] | [CB] |" },
    ],
    quiz: [
      { text: "Consonâncias são intervalos que soam:", options: ["Sempre errados", "Estáveis, de repouso", "Mais altos"], correctIndex: 1 },
      { text: "Qual grupo é de consonâncias?", options: ["2ªs e 7ªs", "3ªs, 6ªs e 5ªs justas", "Trítono e 2ª menor"], correctIndex: 1 },
      { text: "O trítono tem:", options: ["Dois tons", "Três tons", "Quatro tons"], correctIndex: 1 },
      { text: "O trítono é o motor de qual acorde?", options: ["Da tônica", "Da dominante", "Da subdominante"], correctIndex: 1 },
      { text: "A tensão do trítono resolve por:", options: ["Salto de quinta", "Movimento de semitom em direções contrárias", "Repetição da mesma nota"], correctIndex: 1 },
      { text: "A música usa dissonância:", options: ["Por acidente", "De propósito, para depois resolver", "Só em música erudita"], correctIndex: 1 },
      { text: "Ouça o par de notas: repouso ou tensão?", options: ["Repouso", "Tensão"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CE]" },
      { text: "Ouça o par de notas: repouso ou tensão?", options: ["Repouso", "Tensão"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CB]" },
      { text: "Ouça: este par é um trítono?", options: ["Sim", "Não, é uma quinta justa"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[F=B]" },
      { text: "Ouça a sequência: a segunda sonoridade é mais tensa ou mais descansada que a primeira?", options: ["Mais tensa", "Mais descansada"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:C\n[F=B] [Ec] |" },
    ],
    activities: [
      { title: "Classificar oito pares", instructions: "Ouça oito pares de notas (harmônicos). Para cada um, escreva \"repouso\" ou \"tensão\". Depois confira com o professor.", format: "text" },
      { title: "Cantar a resolução do trítono", instructions: "Grave você cantando as duas notas do trítono Fá–Si e depois a resolução: Fá desce para Mi, Si sobe para Dó. Faça devagar.", format: "audio" },
    ],
  },

  // ═══════════════ MÓDULO 3 — Harmonia funcional ═══════════════
  {
    title: "Módulo 3 · Aula 11 — O acorde: a tríade",
    sections: [
      {
        title: "Empilhando terças",
        markdown:
          "Um acorde básico (**tríade**) são **três notas empilhadas em terças**: a **fundamental** " +
          "(dá o nome ao acorde), a **terça** acima dela, e a **quinta**. Em dó-móvel, a partir do " +
          "grau 1: graus **1–3–5** — o \"esqueleto\" que você já cantou na Aula 6.",
      },
      {
        title: "Maior ou menor: a terça decide",
        markdown:
          "Se a distância da fundamental à terça é uma **3ª maior** (dois tons), o acorde é " +
          "**maior** — som \"aberto, alegre\". Se é uma **3ª menor** (tom e meio), o acorde é " +
          "**menor** — som \"fechado, melancólico\". A quinta (justa) é a mesma nos dois.\n\n" +
          "Ou seja: **mexer só na nota do meio** troca o caráter do acorde inteiro. É a coisa mais " +
          "importante desta aula.",
      },
      {
        title: "Os acordes de Lá maior que você mais vai usar",
        markdown:
          "- **A** (Lá maior): Lá – Dó# – Mi\n" +
          "- **D** (Ré maior): Ré – Fá# – Lá\n" +
          "- **E** (Mi maior): Mi – Sol# – Si\n\n" +
          "São o **I**, o **IV** e o **V** de Lá maior — a Aula 13 mostra por que esses três, nessa " +
          "ordem, dão o esqueleto de milhares de músicas.",
      },
    ],
    examples: [
      { title: "A – D – E – A", caption: "As três tríades principais de Lá maior, tocadas em sequência.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"A\"[A,CE] \"D\"[D,FA] | \"E\"[E,GB] \"A\"[A,CE] |" },
      { title: "Maior vira menor", caption: "Primeiro Dó maior, depois Dó menor — só a nota do meio desceu meio tom.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=60\nK:C\n[CEG] [CE_G] |" },
    ],
    quiz: [
      { text: "Uma tríade é formada pelos graus:", options: ["1–2–3", "1–3–5", "1–4–5"], correctIndex: 1 },
      { text: "A nota que dá o nome ao acorde é a:", options: ["Terça", "Quinta", "Fundamental"], correctIndex: 2 },
      { text: "O que diferencia um acorde maior de um menor?", options: ["A quinta", "A terça (a nota do meio)", "A fundamental"], correctIndex: 1 },
      { text: "O acorde de Ré maior (D) tem as notas:", options: ["Ré–Fá–Lá", "Ré–Fá#–Lá", "Ré–Fá#–Lá#"], correctIndex: 1 },
      { text: "A tríade menor tem, da fundamental à terça, uma:", options: ["3ª maior (dois tons)", "3ª menor (tom e meio)", "4ª justa"], correctIndex: 1 },
      { text: "Em Lá maior, os acordes A, D e E são o:", options: ["I, ii e iii", "I, IV e V", "ii, IV e vi"], correctIndex: 1 },
      { text: "Ouça: a tríade é maior ou menor?", options: ["Maior", "Menor"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CEG]" },
      { text: "Ouça: a tríade é maior ou menor?", options: ["Maior", "Menor"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CE_G]" },
      { text: "Ouça as duas tríades: qual é a menor?", options: ["A primeira", "A segunda"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=60\nK:C\n[CEG] [CE_G] |" },
      { text: "Ouça o acorde de Lá maior. Quais notas ele tem?", options: ["Lá–Dó–Mi", "Lá–Dó#–Mi", "Lá–Ré–Mi"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[A,CE]" },
    ],
    activities: [
      { title: "Tocar as três tríades", instructions: "No seu instrumento, toque A, depois D, depois E, depois A de novo, ouvindo bem a nota do meio de cada um. Grave 20 segundos.", format: "audio" },
      { title: "Maior ↔ menor", instructions: "Grave você tocando A (Lá maior) e depois Am (Lá menor), alternando quatro vezes. Descreva em uma frase o que a terça faz.", format: "audio" },
    ],
  },
  {
    title: "Módulo 3 · Aula 12 — O campo harmônico de Lá maior",
    sections: [
      {
        title: "Um acorde sobre cada grau",
        markdown:
          "Se você empilha terças **usando só as notas da escala de Lá maior**, sai um acorde " +
          "diferente sobre cada grau:\n\n" +
          "| Grau | Acorde | Qualidade | Nº romano |\n|---|---|---|---|\n" +
          "| 1 | A | maior | **I** |\n| 2 | Bm | menor | ii |\n| 3 | C#m | menor | iii |\n" +
          "| 4 | D | maior | **IV** |\n| 5 | E | maior | **V** |\n| 6 | F#m | menor | vi |\n" +
          "| 7 | G#° | diminuto | vii° |\n\n" +
          "Maiúscula = maior, minúscula = menor. 90% do repertório em Lá usa só esses sete.",
      },
      {
        title: "Três funções",
        markdown:
          "Cada acorde cumpre um papel:\n\n" +
          "- **Tônica (repouso):** I, e com menos peso vi e iii. É \"casa\".\n" +
          "- **Subdominante (afastamento):** IV e ii. \"Saiu de casa, mas sem tensão.\"\n" +
          "- **Dominante (tensão):** V e vii°. \"Puxa de volta para a tônica.\"\n\n" +
          "A música respira indo **tônica → subdominante → dominante → tônica**, em mil variações.",
      },
      {
        title: "Por que números romanos",
        markdown:
          "Pensar em **I–IV–V** em vez de **A–D–E** deixa a progressão **transportável**: a mesma " +
          "sequência em Sol maior é G–C–D; em Dó maior é C–F–G. Você aprende a **função** uma vez e " +
          "aplica em qualquer tom. É a diferença entre decorar músicas e entender música.",
      },
    ],
    examples: [
      { title: "Os sete acordes de Lá maior", caption: "I, ii, iii, IV, V, vi, vii° — um sobre cada grau da escala.", abc: "X:1\nM:7/4\nL:1/1\nQ:1/4=80\nK:A\n\"I\"[A,CE] \"ii\"[B,DF] \"iii\"[C,EG] \"IV\"[D,FA] \"V\"[E,GB] \"vi\"[F,Ac] \"vii°\"[G,Bd] |" },
    ],
    quiz: [
      { text: "Em Lá maior, o acorde do grau IV é:", options: ["Ré maior (D)", "Ré menor", "Mi maior"], correctIndex: 0 },
      { text: "Em Lá maior, o grau ii é:", options: ["Si maior", "Si menor (Bm)", "Si diminuto"], correctIndex: 1 },
      { text: "A função do acorde V (dominante) é:", options: ["Dar repouso", "Afastar de casa sem tensão", "Criar tensão que puxa para a tônica"], correctIndex: 2 },
      { text: "Qual grupo é função de tônica (repouso)?", options: ["ii e IV", "I e vi", "V e vii°"], correctIndex: 1 },
      { text: "IV e ii cumprem a função de:", options: ["Tônica", "Subdominante", "Dominante"], correctIndex: 1 },
      { text: "Pensar em I–IV–V em vez de A–D–E serve para:", options: ["Soar mais bonito", "Poder transportar a progressão para qualquer tom", "Tocar mais rápido"], correctIndex: 1 },
      { text: "A mesma progressão I–IV–V, em Sol maior, é:", options: ["G–C–D", "G–D–A", "G–Bm–C"], correctIndex: 0 },
      { text: "Em Lá maior, Bm, C#m e F#m são acordes:", options: ["Maiores", "Menores", "Diminutos"], correctIndex: 1 },
      { text: "Ouça a sequência de dois acordes: o segundo é de repouso ou de tensão?", options: ["Repouso (tônica)", "Tensão (dominante)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"A\"[A,CE] \"E\"[E,GB] |" },
      { text: "Ouça: o acorde é maior (I/IV/V) ou menor (ii/iii/vi)?", options: ["Maior", "Menor"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n\"F#m\"[F,Ac]" },
    ],
    activities: [
      { title: "Campo harmônico de Sol maior", instructions: "Escreva em texto os sete acordes de Sol maior com seus números romanos (dica: Sol maior tem um sustenido, o Fá#).", format: "text" },
      { title: "Tocar tônica / subdominante / dominante", instructions: "Grave você tocando, em Lá: um acorde de cada função — A (tônica), D (subdominante), E (dominante), A de novo. Diga o nome da função ao tocar cada um.", format: "audio" },
    ],
  },
  {
    title: "Módulo 3 · Aula 13 — A cadência: como a música respira",
    sections: [
      {
        title: "Cadência é pontuação",
        markdown:
          "Cadência é o **jeito como uma frase musical termina** — o equivalente ao ponto, à vírgula " +
          "ou às reticências:\n\n" +
          "- **Autêntica (V → I):** o \"ponto final\". Máxima resolução — é como quase todo hino " +
          "acaba.\n" +
          "- **Plagal (IV → I):** o \"amém\" das igrejas. Resolução mais suave, sem a tensão do V.\n" +
          "- **Meia-cadência (… → V):** termina **no** V. É a \"vírgula\": a frase para, mas o ouvido " +
          "sabe que vem mais.\n" +
          "- **Deceptiva (V → vi):** o \"quase\". O V prepara o I e no último instante vai para o vi.",
      },
      {
        title: "O ciclo I–IV–V–I",
        markdown:
          "Toque, em Lá: **A (I) – D (IV) – E (V) – A (I)**, dois tempos cada. Você acabou de tocar o " +
          "esqueleto harmônico de milhares de músicas.\n\n" +
          "Sinta cada passo: o **D \"abre\"** (saiu de casa), o **E \"aperta\"** (tensão), o **A " +
          "\"resolve\"** (voltou). Esse ir-e-voltar é o que dá forma a uma frase.",
      },
      {
        title: "Ouvir \"parou na tensão\" x \"parou no repouso\"",
        markdown:
          "Treine isto de ouvido: alguém toca uma progressão curta e **para**. Se parou soando " +
          "\"aberto, pedindo mais\", parou no **V** (meia-cadência). Se parou soando \"acabou\", " +
          "chegou no **I**.\n\n" +
          "Cantar a **tônica** logo depois de a progressão parar ajuda: depois do I é fácil e " +
          "natural; depois do V soa \"esquisito\", porque a música ainda não voltou para casa.",
      },
    ],
    examples: [
      { title: "Melodia sobre I–IV–V–I", caption: "Uma frase simples em Lá maior sobre o ciclo I–IV–V–I.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:A\n\"A\" A2 A2 B2 A2 | \"D\" c2 B2 A4 | \"E\" B2 B2 c2 B2 | \"A\" A6 z2 |" },
      { title: "Autêntica x plagal", caption: "Primeiro V→I (\"ponto final\"), depois IV→I (\"amém\").", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:A\n\"E\"[E,GB] \"A\"[A,CE] | \"D\"[D,FA] \"A\"[A,CE] |" },
    ],
    quiz: [
      { text: "Cadência autêntica é:", options: ["IV → I", "V → I", "V → vi"], correctIndex: 1 },
      { text: "A cadência plagal (o \"amém\") é:", options: ["IV → I", "V → I", "I → V"], correctIndex: 0 },
      { text: "Uma frase que termina NO acorde V fez uma:", options: ["Cadência autêntica", "Meia-cadência (vírgula)", "Cadência plagal"], correctIndex: 1 },
      { text: "Na cadência deceptiva, o V vai para:", options: ["O I", "O vi", "O IV"], correctIndex: 1 },
      { text: "No ciclo I–IV–V–I em Lá, o acorde que \"resolve\" é:", options: ["D", "E", "A"], correctIndex: 2 },
      { text: "No ciclo I–IV–V–I, quem \"aperta\" (tensão) é:", options: ["I", "IV", "V"], correctIndex: 2 },
      { text: "Cantar a tônica depois de uma progressão é fácil quando ela parou:", options: ["No V", "No I", "Nunca é fácil"], correctIndex: 1 },
      { text: "Ouça a progressão: que cadência é essa?", options: ["Autêntica", "Plagal", "Deceptiva"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"E\"[E,GB] \"A\"[A,CE] |" },
      { text: "Ouça a progressão: ela terminou no repouso ou na tensão?", options: ["No repouso (I)", "Na tensão (V)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"A\"[A,CE] \"E\"[E,GB] |" },
      { text: "Ouça: V → I ou V → vi?", options: ["V → I (autêntica)", "V → vi (deceptiva)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"E\"[E,GB] \"F#m\"[F,Ac] |" },
    ],
    activities: [
      { title: "Repouso ou tensão — 6 progressões", instructions: "Ouça seis progressões curtas. Para cada uma, diga se terminou no repouso (I) ou na tensão (V). Depois cante a tônica de Lá logo após cada uma parar.", format: "none" },
      { title: "Tocar as quatro cadências", instructions: "Grave você tocando, em Lá: V→I, IV→I, uma frase que termina em E (meia-cadência) e V→vi. Nomeie cada uma.", format: "audio" },
    ],
  },
  {
    title: "Módulo 3 · Aula 14 — Progressões comuns e o loop de quatro acordes",
    sections: [
      {
        title: "O loop I–V–vi–IV",
        markdown:
          "Em Lá: **A – E – F#m – D**, repetindo. É, sem exagero, a progressão de centenas de " +
          "sucessos pop e de louvor. Como é um **loop** (volta ao começo sem cadência forte), dá " +
          "sensação de \"seguir girando\", sem um fim claro — perfeito para uma parte que se repete.",
      },
      {
        title: "A variante vi–IV–I–V",
        markdown:
          "Os mesmos quatro acordes começando pelo vi: **F#m – D – A – E**. Soa um pouco mais " +
          "\"melancólica no início, resolvida no fim\". Muitas músicas alternam as duas ordens entre " +
          "estrofe e refrão — mesmos acordes, sensação diferente só pela ordem.",
      },
      {
        title: "O blues de 12 compassos",
        markdown:
          "Forma fixa de 12 compassos usando só **I, IV, V** (A, D, E):\n\n" +
          "`| A | A | A | A |`\n`| D | D | A | A |`\n`| E | D | A | E |`\n\n" +
          "É a base do blues, do rock and roll e de muito gospel antigo. Vale decorar essa grade — " +
          "ela aparece o tempo todo.",
      },
    ],
    examples: [
      { title: "Ouvir o loop de 4 acordes", caption: "I–V–vi–IV em Lá maior. Ouça como ele \"gira\" sem parar.", abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=100\nK:A\n\"A\"[A,CE] | \"E\"[E,GB] | \"F#m\"[F,Ac] | \"D\"[D,FA] |" },
    ],
    quiz: [
      { text: "Em Lá, o loop I–V–vi–IV são os acordes:", options: ["A–E–F#m–D", "A–D–E–A", "A–Bm–C#m–D"], correctIndex: 0 },
      { text: "O loop de 4 acordes dá sensação de \"girar sem parar\" porque:", options: ["Acelera a cada volta", "Não tem uma cadência forte de encerramento", "Muda de tom"], correctIndex: 1 },
      { text: "A variante vi–IV–I–V usa:", options: ["Outros quatro acordes", "Os mesmos quatro acordes, em outra ordem", "Só três acordes"], correctIndex: 1 },
      { text: "O blues de 12 compassos usa quais funções?", options: ["Só I e vi", "I, IV e V", "Todos os sete do campo"], correctIndex: 1 },
      { text: "No blues de 12 compassos em Lá, o compasso 5 costuma ser:", options: ["A", "D", "E"], correctIndex: 1 },
      { text: "Alternar I–V–vi–IV e vi–IV–I–V entre estrofe e refrão muda:", options: ["Os acordes", "A sensação, só pela ordem", "O andamento"], correctIndex: 1 },
      { text: "Ouça o loop: em Lá, os acordes são:", options: ["A–E–F#m–D", "A–D–E–A", "A–F#m–Bm–E"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=112\nK:A\n[A,CE] | [E,GB] | [F,Ac] | [D,FA] |" },
      { text: "Ouça a progressão de 3 acordes: é um começo de blues (I–IV) ou uma cadência plagal (IV–I)?", options: ["Começo de blues (I–IV)", "Cadência plagal (IV–I)"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=100\nK:A\n[A,CE] | [D,FA] | [A,CE] |" },
      { text: "Ouça: o primeiro acorde do loop é maior ou menor?", options: ["Maior", "Menor"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=100\nK:A\n[A,CE] |" },
      { text: "Ouça: a progressão começa por um acorde de tônica ou por um menor (vi)?", options: ["Tônica (I)", "Menor (vi)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=100\nK:A\n[F,Ac] | [D,FA] | [A,CE] | [E,GB] |" },
    ],
    activities: [
      { title: "Identificar a progressão de 3 trechos", instructions: "Ouça três trechos. Identifique qual usa I–V–vi–IV, qual usa blues de 12 compassos e qual usa I–IV–V–I simples.", format: "none" },
      { title: "Tocar o loop e o blues", instructions: "Grave você tocando o loop A–E–F#m–D duas voltas e, em seguida, o blues de 12 compassos em Lá.", format: "audio" },
    ],
  },
  {
    title: "Módulo 3 · Aula 15 — A sétima da dominante (V7)",
    sections: [
      {
        title: "Adicionando a quarta nota",
        markdown:
          "Se em cima da tríade do V (E: Mi–Sol#–Si) você empilha **mais uma terça**, chega no **Ré** " +
          "— e tem o **E7** (Mi–Sol#–Si–Ré), o **acorde de sétima da dominante**. Essa nota extra é a " +
          "**sétima menor** contada da fundamental.",
      },
      {
        title: "O trítono escondido",
        markdown:
          "Dentro do E7, entre **Sol# e Ré**, mora um **trítono** (Aula 10). É ele que dá ao E7 " +
          "aquela \"coceira\" muito maior que a do E simples.\n\n" +
          "E ele resolve do jeito clássico: **Sol# sobe para Lá**, **Ré desce para Dó#** — as duas " +
          "notas se fecham exatamente nas notas do acorde de **A**. Por isso o E7 \"puxa\" tanto " +
          "para o Lá.",
      },
      {
        title: "Onde se usa",
        markdown:
          "O V7 aparece principalmente **logo antes da volta para a tônica** — no fim das frases e da " +
          "música inteira. Trocar o V por V7 nesse ponto é o **tempero harmônico mais básico e mais " +
          "usado que existe** no repertório popular e de igreja.",
      },
    ],
    examples: [
      { title: "E → A e depois E7 → A", caption: "Primeiro a tríade E resolvendo, depois o E7 — ouça a diferença de \"puxão\".", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:A\n\"E\"[E,GB] \"A\"[A,CE] | \"E7\"[E,GBd] \"A\"[A,CE] |" },
    ],
    quiz: [
      { text: "O E7 é o acorde E com uma nota a mais:", options: ["Uma terça abaixo", "Uma sétima acima da fundamental (o Ré)", "A mesma nota dobrada"], correctIndex: 1 },
      { text: "A nota extra do acorde de sétima da dominante é uma:", options: ["Sétima maior", "Sétima menor", "Sexta"], correctIndex: 1 },
      { text: "O que existe dentro do E7 e não dentro do E simples?", options: ["Uma oitava", "Um trítono (entre Sol# e Ré)", "Uma quinta justa"], correctIndex: 1 },
      { text: "No E7 → A, o Sol# resolve subindo para:", options: ["Sol", "Lá", "Fá#"], correctIndex: 1 },
      { text: "No E7 → A, o Ré resolve descendo para:", options: ["Dó#", "Dó", "Si"], correctIndex: 0 },
      { text: "O V7 costuma aparecer:", options: ["No comecinho da música", "Logo antes da volta para a tônica", "Só em música instrumental"], correctIndex: 1 },
      { text: "Trocar V por V7 no fim da frase é:", options: ["Um erro comum", "O tempero harmônico mais básico e usado", "Coisa só de jazz"], correctIndex: 1 },
      { text: "Ouça os dois acordes: qual \"puxa\" mais para a tônica?", options: ["O primeiro (tríade)", "O segundo (com sétima)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[E,GB] | [E,GBd] |" },
      { text: "Ouça: tríade simples ou acorde com sétima?", options: ["Tríade", "Com sétima"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[E,GBd]" },
      { text: "Ouça E7 → A: a resolução soa mais forte ou mais fraca que E → A?", options: ["Mais forte", "Mais fraca"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:A\n[E,GBd] [A,CE] |" },
    ],
    activities: [
      { title: "E x E7 alternados", instructions: "No instrumento, toque E → A e depois E7 → A, alternando quatro vezes. Grave e descreva em uma frase o que a sétima acrescenta.", format: "audio" },
      { title: "Achar o V7 numa música", instructions: "Em texto: pegue uma música que você toca em Lá (ou G, ou C) e diga onde entra o acorde de sétima da dominante — é sempre logo antes de qual acorde?", format: "text" },
    ],
  },

  // ═══════════════ MÓDULO 4 — Juntando tudo ═══════════════
  {
    title: "Módulo 4 · Aula 16 — Melodia sobre harmonia",
    sections: [
      {
        title: "Notas do acorde x notas de passagem",
        markdown:
          "Quando a melodia está sobre o acorde **A** (Lá–Dó#–Mi), as notas **Lá, Dó# e Mi** soam " +
          "\"apoiadas\" — são **notas do acorde**. As outras (Si, Ré, Fá#, Sol#) soam \"de caminho\": " +
          "a melodia passa por elas rápido, indo de uma nota do acorde para outra. São as **notas de " +
          "passagem** e **bordaduras**.",
      },
      {
        title: "A regra prática",
        markdown:
          "Nos **tempos fortes**, a melodia bem-comportada tende a estar numa **nota do acorde** " +
          "daquele momento. Nas partes fracas, ela pode \"enfeitar\" com notas de fora.\n\n" +
          "Compositores quebram isso de propósito (é o que gera as \"notas de tensão\" expressivas), " +
          "mas o padrão base é esse — e reconhecê-lo ajuda a **tirar melodia de ouvido** e a " +
          "**harmonizar** uma linha.",
      },
      {
        title: "Ouvindo isso na prática",
        markdown:
          "Toque o acorde A parado e cante o grau 1, depois o 2, depois o 3. O **1 e o 3 " +
          "\"encaixam\"** (são do acorde); o **2 fica \"pendurado\"**, querendo cair para o 1 ou " +
          "subir para o 3. Esse \"querer resolver\" da nota de passagem é a mesma força da cadência, " +
          "só que dentro da melodia.",
      },
    ],
    examples: [
      { title: "Nota de acorde x passagem", caption: "Sobre A: Lá e Dó# nos tempos fortes (nota de acorde), Si de passagem entre elas.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n\"A\" A2 B c2 A | \"D\" d2 c B2 A | \"E\" B2 c d2 B | \"A\" c2 B A4 |" },
    ],
    quiz: [
      { text: "Sobre o acorde A (Lá–Dó#–Mi), qual nota é \"de passagem\"?", options: ["Lá", "Si", "Mi"], correctIndex: 1 },
      { text: "Nota do acorde é a que:", options: ["Nunca aparece na melodia", "Pertence às notas do acorde tocado naquele momento", "Sempre cai em parte fraca"], correctIndex: 1 },
      { text: "Melodias bem-comportadas tendem a colocar, nos tempos fortes:", options: ["Notas de fora do acorde", "Notas do acorde", "Sempre a fundamental"], correctIndex: 1 },
      { text: "Uma nota de passagem geralmente aparece:", options: ["Num tempo forte, sustentada", "Numa parte fraca, de caminho entre duas notas do acorde", "Só no fim da frase"], correctIndex: 1 },
      { text: "Sobre A, cantando os graus 1–2–3, qual \"fica pendurado\"?", options: ["O 1", "O 2", "O 3"], correctIndex: 1 },
      { text: "Saber separar nota de acorde de nota de passagem ajuda a:", options: ["Tirar melodia de ouvido e harmonizar", "Afinar o instrumento", "Contar compassos"], correctIndex: 0 },
      { text: "Ouça a frase sobre o acorde A: a nota do tempo forte é do acorde ou de passagem?", options: ["Do acorde", "De passagem"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:A\n\"A\"c B A2 |" },
      { text: "Ouça: a segunda nota (Si, sobre o acorde A) soa \"apoiada\" ou \"pedindo para resolver\"?", options: ["Apoiada", "Pedindo para resolver"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:A\n\"A\"A B |" },
      { text: "Ouça a frase: ela termina numa nota do acorde (repouso) ou fora dele?", options: ["Nota do acorde", "Fora do acorde"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:A\n\"A\"B c A2 |" },
      { text: "Compositores colocam nota de fora do acorde no tempo forte:", options: ["Nunca", "De propósito, para criar tensão expressiva", "Só por erro"], correctIndex: 1 },
    ],
    activities: [
      { title: "Circular os tempos fortes", instructions: "Na partitura do exemplo, marque (em texto: compasso e nota) as notas que caem no tempo forte e verifique se cada uma pertence ao acorde escrito em cima.", format: "text" },
      { title: "Cantar graus sobre o acorde", instructions: "Grave você: toque/segure o acorde A e cante os graus 1, 2 e 3 em cima dele, repetindo. Descreva o que sente no grau 2.", format: "audio" },
    ],
  },
  {
    title: "Módulo 4 · Aula 17 — Forma musical",
    sections: [
      {
        title: "As partes com nome",
        markdown:
          "- **Introdução:** prepara o clima, muitas vezes com os acordes do refrão sem canto.\n" +
          "- **Estrofe (verso):** conta a \"história\", letra que muda a cada repetição, melodia " +
          "mais contida.\n" +
          "- **Refrão:** a parte que se repete igual, melodia no ponto mais alto — é o que todo mundo " +
          "lembra.\n" +
          "- **Ponte:** aparece uma vez, contrasta (outra harmonia ou região da voz), leva ao último " +
          "refrão.\n" +
          "- **Coda / final:** o encerramento — pode ser um refrão sumindo ou um acorde longo.",
      },
      {
        title: "Repetição e casas",
        markdown:
          "Na partitura, `:|` manda **repetir**. Quando a repetição termina diferente, usa-se **casa " +
          "1** e **casa 2**: na primeira vez você toca a casa 1; na volta, pula direto para a casa " +
          "2. É como uma música \"reaproveita\" um trecho mudando só o final.",
      },
      {
        title: "O mapa de forma",
        markdown:
          "Escrever a forma como uma linha de letras ajuda a ensaiar. Por exemplo:\n\n" +
          "**Intro – A – A – B – A – B – B – Coda** (A = estrofe, B = refrão).\n\n" +
          "É esse tipo de mapa que faz um ensaio render — todo mundo sabe o que vem depois do quê, " +
          "sem depender de \"sentir\".",
      },
    ],
    examples: [
      { title: "Repetição com casa 1 e casa 2 (representação)", caption: "O trecho se repete; a primeira vez fecha \"aberto\" (casa 1), a segunda \"resolve\" (casa 2).", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=96\nK:A\n|: A B c d :| e2 a2 |" },
    ],
    quiz: [
      { text: "A parte que se repete igual, com a melodia mais alta e \"grudenta\", é:", options: ["A estrofe", "O refrão", "A ponte"], correctIndex: 1 },
      { text: "A estrofe normalmente:", options: ["Repete a mesma letra sempre", "Tem letra que muda a cada repetição", "É a parte mais aguda da música"], correctIndex: 1 },
      { text: "A ponte serve para:", options: ["Repetir o refrão", "Trazer um contraste, uma vez, antes do último refrão", "Afinar a banda"], correctIndex: 1 },
      { text: "A introdução muitas vezes usa:", options: ["Uma parte totalmente nova", "Os acordes do refrão sem canto", "Só bateria"], correctIndex: 1 },
      { text: "O sinal `:|` na partitura significa:", options: ["Fim da música", "Repetir o trecho", "Aumentar o volume"], correctIndex: 1 },
      { text: "\"Casa 1\" e \"casa 2\" servem para:", options: ["Tocar mais alto", "Terminar a repetição de dois jeitos diferentes", "Trocar de tom"], correctIndex: 1 },
      { text: "Um mapa de forma serve para:", options: ["Afinar o instrumento", "Todo mundo saber a ordem das partes no ensaio", "Contar o andamento"], correctIndex: 1 },
      { text: "No mapa Intro–A–A–B–A–B–B–Coda, o \"B\" é:", options: ["A estrofe", "O refrão", "A ponte"], correctIndex: 1 },
      { text: "A coda é:", options: ["A primeira parte da música", "O encerramento", "Outro nome para estrofe"], correctIndex: 1 },
      { text: "Ouça as duas frases: a segunda é a repetição da primeira com um final diferente (casa 2)?", options: ["Sim", "Não, são frases sem relação"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=104\nK:C\nc d e f | c d e c | c d e f | c d e2 |" },
    ],
    activities: [
      { title: "Mapa de forma de uma música sua", instructions: "Escolha uma música que você toca. Escreva em texto o mapa de forma dela com os nomes das partes e quantos compassos cada uma tem.", format: "text" },
      { title: "Ouvir e mapear", instructions: "Ouça uma música conhecida três vezes e, a cada audição, anote uma parte da forma (onde começa a estrofe, onde entra o refrão, se tem ponte). Entregue o mapa.", format: "text" },
    ],
  },
  {
    title: "Módulo 4 · Aula 18 — Lendo uma lead sheet",
    sections: [
      {
        title: "O que é uma lead sheet",
        markdown:
          "É o **formato mínimo** de uma música: a **melodia** escrita na pauta e as **cifras** dos " +
          "acordes acima. Não diz qual levada tocar nem como distribuir as notas do acorde — isso " +
          "fica a critério de quem toca.\n\n" +
          "É como circula a maior parte do repertório popular e de igreja. Saber ler uma lead sheet " +
          "é o que te deixa \"pronto para tocar\" qualquer música com um papel na frente.",
      },
      {
        title: "Como se lê, na prática",
        markdown:
          "1. Veja o **tom** (armadura de clave) e a **fórmula de compasso**.\n" +
          "2. Passe o olho pelas **cifras**: elas já te dão a harmonia inteira (e, com o Módulo 3, a " +
          "função de cada uma).\n" +
          "3. A **melodia** te dá o ritmo e o contorno do canto.\n" +
          "4. Junte: baixo/mão esquerda faz a fundamental da cifra, harmonia preenche, a voz faz a " +
          "melodia.",
      },
      {
        title: "Cifras além da tríade",
        markdown:
          "`A` = Lá maior. `A7` = com sétima (dominante). `Am` = menor. `D/F#` = acorde de Ré com " +
          "Fá# no baixo. `Asus4` = a terça trocada pela quarta (aquele \"segura e resolve\").\n\n" +
          "Você não precisa de todas agora — reconhecer **`X`, `Xm` e `X7`** já cobre a maioria dos " +
          "louvores.",
      },
    ],
    examples: [
      { title: "Lead sheet de 8 compassos em Lá maior", caption: "Melodia com cifras — leia o tom, as cifras e o contorno antes de tocar.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:A\n\"A\" E2 A2 A2 B2 | \"D\" c2 B2 A4 | \"E\" B2 B2 c2 d2 | \"E7\" c4 B4 |\n\"A\" E2 A2 A2 B2 | \"D\" c2 B2 A2 F2 | \"E7\" B2 A2 G2 B2 | \"A\" A8 |]" },
    ],
    quiz: [
      { text: "Uma lead sheet traz:", options: ["Só a letra", "A melodia na pauta + as cifras acima", "Todas as vozes escritas"], correctIndex: 1 },
      { text: "O que NÃO está na lead sheet e fica por conta de quem toca?", options: ["A melodia", "As cifras", "A levada / o arranjo"], correctIndex: 2 },
      { text: "O primeiro passo ao pegar uma lead sheet nova é olhar:", options: ["O número de páginas", "O tom e a fórmula de compasso", "A última nota"], correctIndex: 1 },
      { text: "A cifra `A7` significa:", options: ["Lá menor", "Lá maior com sétima (dominante)", "Lá com quarta"], correctIndex: 1 },
      { text: "A cifra `Am` significa:", options: ["Lá maior", "Lá menor", "Lá com sétima"], correctIndex: 1 },
      { text: "`D/F#` quer dizer:", options: ["Dois acordes ao mesmo tempo", "Acorde de Ré com Fá# no baixo", "Ré diminuto"], correctIndex: 1 },
      { text: "`Asus4` é o acorde de Lá com:", options: ["A quinta abaixada", "A terça trocada pela quarta", "Uma sétima maior"], correctIndex: 1 },
      { text: "Reconhecer só `X`, `Xm` e `X7` já cobre:", options: ["A maioria dos louvores", "Só música erudita", "Nada de útil"], correctIndex: 0 },
      { text: "Ouça a frase da lead sheet: a cifra de baixo é uma tríade maior ou um acorde com sétima?", options: ["Tríade maior", "Com sétima"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=90\nK:A\n\"E7\"[E,GBd] c B2 |" },
      { text: "Numa lead sheet em Lá, você vê as cifras A, D, E7. As funções são:", options: ["I, IV, V7", "I, ii, V", "vi, IV, I"], correctIndex: 0 },
    ],
    activities: [
      { title: "Tocar a lead sheet do exemplo", instructions: "Toque a lead sheet de 8 compassos: cifras no instrumento harmônico + melodia cantada ou num instrumento melódico. Grave uma passada completa.", format: "audio" },
      { title: "Traduzir cifras em funções", instructions: "Em texto: escreva as cifras de uma parte de uma música sua (em Lá, Sol ou Dó) e ao lado de cada uma o número romano / a função.", format: "text" },
    ],
  },
  {
    title: "Módulo 4 · Aula 19 — Análise guiada do começo ao fim",
    sections: [
      {
        title: "O roteiro de análise",
        markdown:
          "Para qualquer música, responda nesta ordem:\n\n" +
          "1. **Tom e compasso.** Qual a tônica? Maior ou menor? Quantos tempos por compasso?\n" +
          "2. **Andamento e caráter.** BPM aproximado; a bateria marca o backbeat onde?\n" +
          "3. **Forma.** Mapa de partes (Intro / Estrofe / Refrão / …).\n" +
          "4. **Harmonia.** As cifras de cada parte, em números romanos e funções. Que cadência fecha " +
          "cada frase?\n" +
          "5. **Melodia.** Qual o âmbito? Move-se por graus conjuntos ou por saltos? Onde está o pico? " +
          "As notas dos tempos fortes são do acorde?",
      },
      {
        title: "Exemplo resolvido (resumo)",
        markdown:
          "\"Música simples em Lá maior, 4/4, ~92 BPM, backbeat em 2 e 4. Forma " +
          "Intro–A–B–A–B–B. Estrofe: `I – IV – V7 – I` (cadência autêntica). Refrão: `I – vi – IV – " +
          "V` (loop, meia-cadência antes de repetir). Melodia com âmbito de sexta, quase toda por " +
          "graus conjuntos, pico no grau 5 no começo do refrão; tempos fortes sobre notas do " +
          "acorde.\"",
      },
      {
        title: "Para onde ir agora",
        markdown:
          "O próximo passo natural é o curso **\"Jesus Cristo mudou meu viver\"**, que faz exatamente " +
          "essa análise, em detalhe, numa música só — e ainda mostra como criar a segunda voz e " +
          "montar o arranjo.",
      },
    ],
    examples: [
      { title: "Uma música simples para analisar", caption: "8 compassos em Lá maior — aplique o roteiro: tom, compasso, forma, harmonia (cifras), melodia.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:A\n\"A\" E2 A2 A2 B2 | \"D\" c2 B2 A4 | \"E7\" B2 c2 d2 c2 | \"A\" A8 |\n\"A\" c2 c2 e2 c2 | \"F#m\" B2 A2 F4 | \"D\" A2 B2 \"E7\" c2 B2 | \"A\" A8 |]" },
    ],
    quiz: [
      { text: "No roteiro de análise, o primeiro item é:", options: ["A melodia", "Tom e compasso", "O nome do compositor"], correctIndex: 1 },
      { text: "\"Backbeat em 2 e 4\" descreve:", options: ["A melodia", "O que a bateria faz", "A forma da música"], correctIndex: 1 },
      { text: "Traduzir as cifras em números romanos serve para:", options: ["Deixar mais bonito", "Enxergar as funções e poder transpor", "Contar compassos"], correctIndex: 1 },
      { text: "\"Âmbito de sexta\" quer dizer que a melodia:", options: ["Tem seis compassos", "Cabe numa distância de sexta entre a nota mais grave e a mais aguda", "Usa seis acordes"], correctIndex: 1 },
      { text: "Uma frase que fecha com V7 → I fez uma cadência:", options: ["Plagal", "Autêntica", "Deceptiva"], correctIndex: 1 },
      { text: "No exemplo resumido, o refrão usa a progressão:", options: ["I – IV – V7 – I", "I – vi – IV – V", "ii – V – I"], correctIndex: 1 },
      { text: "\"Melodia por graus conjuntos\" quer dizer:", options: ["Cheia de saltos grandes", "Movendo-se principalmente de nota vizinha em nota vizinha", "Sempre na mesma nota"], correctIndex: 1 },
      { text: "Ouça o trecho: ele está em modo maior ou menor?", options: ["Maior", "Menor"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:A\n\"A\"E2 A2 A2 B2 | \"E7\"c4 B4 | \"A\"A8 |" },
      { text: "Ouça a frase: ela termina resolvida (na tônica) ou aberta (na dominante)?", options: ["Resolvida", "Aberta"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=92\nK:A\n\"E7\"B c \"A\"A2 |" },
      { text: "Analisar uma música do começo ao fim é útil principalmente para:", options: ["Impressionar os outros", "Entender como ela funciona e conseguir arranjá-la / ensiná-la", "Cronometrar a duração"], correctIndex: 1 },
    ],
    activities: [
      { title: "Análise completa (entrega principal)", instructions: "Escolha uma música que você toca ou canta. Escreva a análise completa seguindo o roteiro: tom, compasso, andamento, forma, harmonia em números romanos, melodia. O professor devolve com nota e comentários.", format: "text" },
      { title: "Analisar o exemplo desta aula", instructions: "Aplique o roteiro ao exemplo de 8 compassos desta aula: escreva tom, compasso, a progressão de cada frase em números romanos e a cadência que fecha cada uma.", format: "text" },
    ],
  },
];
