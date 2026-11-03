// Lesson 1, interactive version: the slides as steps, each with something to do.
// The format is in README.md. This is the first part: slides 1 to 7.
registerInteractive({
  slide: [
    {
      titolo: "Come «ragiona» un'intelligenza artificiale?",
      passi: [
        {
          mostra: [{ tipo: "testo", testo: "Prima di cominciare, due domande veloci. Non ci sono risposte sbagliate." }],
          attivita: {
            tipo: "scelta",
            domanda: "Hai mai usato ChatGPT, o un altro assistente come lui?",
            opzioni: [
              { testo: "Sì", risposta: "Bene: oggi scopri che cosa succede dentro quando ti risponde." },
              { testo: "No", risposta: "Nessun problema: oggi scopri come funziona, anche senza averlo mai usato." },
            ],
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Sapresti spiegare come fa a rispondere?",
            opzioni: [
              { testo: "Sì", risposta: "Vediamo se alla fine la pensi ancora così." },
              { testo: "Più o meno", risposta: "È normale: sono in pochi a saperlo spiegare." },
              { testo: "No", risposta: "Va benissimo: è proprio quello che scopri oggi." },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Alla fine saprai una cosa che **molti adulti non sanno**, anche se usano questi programmi tutti i giorni.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Come fa ChatGPT a rispondere?",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Quando si fa questa domanda, di solito si sentono tre risposte. Per ognuna, decidi tu: è vera o falsa?",
            },
            { tipo: "scheda", etichetta: "RISPOSTA 1", dopo: "SBAGLIATO 01", titolo: "«Cerca su internet»" },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "È vera o falsa?",
            opzioni: [
              { testo: "Vera", risposta: "Lo pensano in tanti, ma è falsa." },
              { testo: "Falsa", risposta: "È falsa.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Mentre scrive la risposta, il modello **non è collegato a niente**: non va a cercarla da nessuna parte.",
            },
          ],
        },
        {
          mostra: [{ tipo: "scheda", etichetta: "RISPOSTA 2", dopo: "SBAGLIATO 02", titolo: "«Ha dentro tante risposte»" }],
          attivita: {
            tipo: "scelta",
            domanda: "È vera o falsa?",
            opzioni: [
              { testo: "Vera", risposta: "Sembra così, ma è falsa." },
              { testo: "Falsa", risposta: "È falsa.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Dentro il modello **non c'è nemmeno una frase salvata**: non ha un archivio di risposte pronte.",
            },
          ],
        },
        {
          mostra: [{ tipo: "scheda", etichetta: "RISPOSTA 3", dopo: "SBAGLIATO 03", titolo: "«Pensa come noi»" }],
          attivita: {
            tipo: "scelta",
            domanda: "È vera o falsa?",
            opzioni: [
              { testo: "Vera", risposta: "Sembra proprio così, ma è falsa." },
              { testo: "Falsa", risposta: "È falsa.", giusta: true },
            ],
          },
          poi: [{ tipo: "testo", testo: "Perché no? Lo scopri tra poco, in questa lezione." }],
        },
        {
          mostra: [
            { tipo: "testo", testo: "Sono sbagliate **tutte e tre**. Tienile a mente: alla fine saprai dire perché." },
          ],
        },
      ],
    },
    {
      titolo: "Partiamo da un'immagine: lo studente",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Immagina uno studente che ha letto tantissimo: libri, siti, giornali, conversazioni." },
            {
              tipo: "disegno",
              nome: "studente",
              didascalia: "Immagine ispirata a Sara Zan, «Explain me LLMs like I'm five» (2024)",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Secondo te, quanti libri ha letto?",
            opzioni: [
              { testo: "Cento", risposta: "Molti di più: milioni! Più di quanti tu potresti leggerne in mille vite." },
              { testo: "Diecimila", risposta: "Molti di più: milioni! Più di quanti tu potresti leggerne in mille vite." },
              { testo: "Milioni", risposta: "Più di quanti tu potresti leggerne in mille vite.", giusta: true },
            ],
          },
        },
        {
          mostra: [{ tipo: "testo", testo: "Però non è un genio: a volte dimentica le cose, a volte le confonde." }],
          attivita: {
            tipo: "scelta",
            domanda: "E quando non sa una risposta, che cosa fa?",
            opzioni: [
              { testo: "Dice «non lo so»", risposta: "Sarebbe bello, ma no: risponde lo stesso." },
              { testo: "Se la inventa", risposta: "Risponde lo stesso, anche quando non sa.", giusta: true },
            ],
          },
          poi: [{ tipo: "testo", testo: "**Ha letto tutto. Ma quando non sa, risponde lo stesso.**" }],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Tieni a mente questa immagine: ti serve solo per cominciare. Nella prossima slide la buttiamo via.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Uno studente capisce. Questo no.",
      passi: [
        {
          mostra: [{ tipo: "grande", stile: "scuro", testo: "Uno studente **capisce** quello che legge. Questo no." }],
          attivita: {
            tipo: "scelta",
            domanda: "Il modello sa descrivere il mare?",
            opzioni: [
              { testo: "Sì", risposta: "Lo descrive benissimo: ha letto milioni di frasi sul mare.", giusta: true },
              { testo: "No", risposta: "In realtà lo descrive benissimo: ha letto milioni di frasi sul mare." },
            ],
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "E sa che cosa vuol dire bagnarsi?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Non è mai stato al mare e non ha mai visto l'acqua. Ha solo letto parole sul mare.",
              },
              {
                testo: "No",
                risposta: "Non è mai stato al mare e non ha mai visto l'acqua. Ha solo letto parole sul mare.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Non sa che cos'è il mare. Non sa che cos'è un gatto. **E allora, che cosa fa?** Lo scopri nella prossima slide.",
            },
          ],
        },
      ],
    },
    {
      titolo: "L'idea di tutta la lezione",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Ecco la frase più importante della lezione. Completala tu." },
            { tipo: "frase", testo: "Fa una cosa sola: indovina la parola ___" },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Quale parola viene dopo?",
            opzioni: [
              { testo: "dopo", risposta: "Hai indovinato la parola che veniva dopo.", giusta: true },
              {
                testo: "giusta",
                risposta: "La parola è «dopo»: il modello non cerca la parola giusta, indovina quella che viene dopo.",
              },
              { testo: "difficile", risposta: "La parola è «dopo»: il modello indovina sempre la parola che viene dopo." },
            ],
          },
          poi: [
            { tipo: "grande", testo: "Fa una cosa sola: **indovina la parola dopo**." },
            { tipo: "testo", testo: "Hai appena fatto proprio questo: hai indovinato la parola che veniva dopo." },
          ],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Poesie, temi, barzellette, programmi per il computer: **tutto viene da qui**. Non c'è nient'altro.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Ti sembra poco?",
            opzioni: [
              {
                testo: "Sì, un po' deludente",
                risposta: "Lo pensano in tanti. Nelle prossime slide vedi perché invece è sorprendente.",
              },
              { testo: "No", risposta: "Bene: nelle prossime slide vedi quanto lontano si arriva con questa sola idea." },
            ],
          },
        },
      ],
    },
    {
      titolo: "Proviamo noi",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Adesso tocca a te. Completa la frase con la prima parola che ti viene in mente." },
            { tipo: "frase", testo: "Chi dorme non piglia ___" },
          ],
          attivita: {
            tipo: "completa",
            domanda: "Scrivi la parola che manca",
            attese: [
              {
                parole: ["pesci", "pesce"],
                risposta: "Proprio così: quasi tutti dicono «pesci». Era facile da indovinare.",
              },
            ],
            altrimenti: "Interessante! Quasi tutti però dicono «pesci»: era facile da indovinare.",
          },
        },
        {
          mostra: [
            { tipo: "testo", testo: "E adesso questa:" },
            { tipo: "frase", testo: "Ieri sono andato al mare e ho fatto un ___" },
          ],
          attivita: {
            tipo: "completa",
            domanda: "Scrivi la parola che manca",
            attese: [
              { parole: ["bagno"], risposta: "«Bagno» è la risposta più comune." },
              { parole: ["tuffo"], risposta: "«Tuffo» è una delle risposte più comuni." },
            ],
            altrimenti: "Va benissimo anche questa: qui ognuno pensa una parola diversa.",
            ricorda: "mare",
          },
          poi: [
            { tipo: "testo", testo: "Chi ha ragione? **Tutti.** Però alcune parole sono più probabili di altre." },
            {
              tipo: "testo",
              testo: "Hai appena fatto, con la tua testa, quello che fa il computer: da un pezzo di frase hai tirato fuori una parola probabile. Tu ci metti mezzo secondo, lui un millesimo.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Non c'è una risposta giusta",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Il computer prova a completare la stessa frase." },
            { tipo: "frase", testo: "Ieri sono andato al mare e ho fatto un ___" },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Secondo te, quale parola è la più probabile?",
            opzioni: [
              { testo: "bagno", risposta: "«Bagno» è la più probabile.", giusta: true },
              { testo: "tuffo", risposta: "«Tuffo» viene subito dopo «bagno»." },
              { testo: "giro", risposta: "«Giro» è possibile, ma meno probabile." },
              { testo: "castello", risposta: "«Castello» è possibile, ma è la meno probabile di queste." },
            ],
          },
          poi: [
            {
              tipo: "barre",
              voci: [
                { parola: "bagno", percento: 44 },
                { parola: "tuffo", percento: 33 },
                { parola: "giro", percento: 15 },
                { parola: "castello", percento: 8 },
              ],
              evidenzia: "mare",
            },
            {
              tipo: "testo",
              testo: "Il computer **non sceglie subito** una parola. Prima calcola **quanto è probabile ognuna**. Poi sceglie. Sono due cose diverse.",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Qui vedi solo quattro parole, ma la lista vera ne ha **decine di migliaia**: una per ogni parola che il computer conosce. C'è anche «frigorifero», con un numero piccolissimo.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Allora, il computer potrebbe scrivere «ho fatto un frigorifero»?",
            opzioni: [
              {
                testo: "Sì, ma quasi mai",
                risposta: "È nella lista anche lei, con un numero piccolissimo: quasi mai, ma può succedere.",
                giusta: true,
              },
              {
                testo: "No, mai",
                risposta: "In realtà sì: è nella lista anche lei, con un numero piccolissimo. Quasi mai, ma può succedere.",
              },
            ],
          },
        },
      ],
    },
  ],
});
