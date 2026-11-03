// Lesson 1, interactive version: the slides as steps, each with something to do.
// One version for both classes; the slides only in the superiori deck are marked.
// The format is in README.md.
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
            {
              tipo: "testo",
              testo: "Alcuni assistenti, è vero, possono anche fare ricerche sul web. Ma è una **funzione aggiunta dopo**, sopra il modello: come un'app in più sul telefono. E per tantissime risposte non si attiva nemmeno.",
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
              {
                testo: "Cento",
                risposta: "Molti di più: milioni di libri, cioè miliardi di pagine. Più di quanti tu potresti leggerne in mille vite.",
              },
              {
                testo: "Diecimila",
                risposta: "Molti di più: milioni di libri, cioè miliardi di pagine. Più di quanti tu potresti leggerne in mille vite.",
              },
              {
                testo: "Milioni",
                risposta: "Milioni di libri, cioè miliardi di pagine. Più di quanti tu potresti leggerne in mille vite.",
                giusta: true,
              },
              {
                testo: "Miliardi",
                risposta: "Troppi: in tutto il mondo non esistono miliardi di libri. Sono milioni di libri. Miliardi, semmai, sono le pagine.",
              },
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
    {
      titolo: "Come ha fatto a imparare?",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Prima di rispondere a chiunque, il modello ha passato tantissimo tempo a leggere." },
            { tipo: "scheda", etichetta: "HA LETTO", titolo: "Miliardi di pagine", testo: "Libri, siti, giornali, chat." },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Secondo te, quelle pagine sono ancora salvate dentro il modello?",
            opzioni: [
              { testo: "Sì, tutte", risposta: "Sembra logico, ma no: non le ha salvate. Non ce le ha dentro." },
              { testo: "No", risposta: "Non le ha salvate: non ce le ha dentro.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "scheda",
              etichetta: "MA NON RICORDA",
              titolo: "Ha imparato gli schemi",
              testo: "Quali parole stanno vicine a quali altre. Ha tenuto lo schema, non il testo.",
            },
          ],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "E se oggi gli scrivi una cosa nuova, la impara?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Lo pensano quasi tutti, ma no: il modello con cui parli non impara niente mentre chatti.",
              },
              { testo: "No", risposta: "Il modello con cui parli non impara niente mentre chatti.", giusta: true },
            ],
          },
          poi: [
            { tipo: "scheda", etichetta: "E POI BASTA", titolo: "Non impara dalle tue chat", testo: "Finito di leggere, si ferma lì." },
            {
              tipo: "testo",
              testo: "Però le chat possono servire più avanti, per costruire **versioni nuove** del modello. Anche per questo non conviene scrivere ai chatbot cose personali. Ne parliamo nella lezione 3.",
            },
          ],
        },
        {
          mostra: [{ tipo: "testo", testo: "Ti ricordi le tre risposte sbagliate dell'inizio? Adesso puoi smontarne una." }],
          attivita: {
            tipo: "scelta",
            domanda: "«Non ha salvato le pagine che ha letto.» Quale risposta sbagliata smonta?",
            opzioni: [
              {
                testo: "«Cerca su internet»",
                risposta: "Quella cade per un altro motivo: mentre scrive non è collegato a niente. Questa frase smonta «Ha dentro tante risposte».",
              },
              {
                testo: "«Ha dentro tante risposte»",
                risposta: "Se non ha salvato le pagine, non ha nemmeno un magazzino di risposte pronte.",
                giusta: true,
              },
              {
                testo: "«Pensa come noi»",
                risposta: "Quella la smontiamo più avanti. Questa frase smonta «Ha dentro tante risposte»: senza pagine salvate, niente risposte pronte.",
              },
            ],
          },
          poi: [
            { tipo: "grande", testo: "Niente internet. Niente magazzino di frasi. **Solo schemi**, imparati una volta e poi fermi lì." },
          ],
        },
      ],
    },
    {
      titolo: "Dentro la scatola: tre mestieri",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Per arrivare a quella lista di numeri, il computer fa **tre lavori**, uno dopo l'altro. Adesso li apriamo uno per uno.",
            },
            { tipo: "scheda", etichetta: "01", titolo: "Le parole diventano numeri", testo: "Il computer non sa leggere. Sa solo contare." },
            { tipo: "scheda", etichetta: "02", titolo: "L'attenzione guarda la frase", testo: "Quali parole della frase contano davvero?" },
            { tipo: "scheda", etichetta: "03", titolo: "Esce la lista dei numeri", testo: "Un voto per ogni parola che conosce." },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Quale dei tre ti sembra il più difficile?",
            opzioni: [
              {
                testo: "Le parole diventano numeri",
                risposta: "Sembra il più facile, ma senza numeri il computer non può fare niente: è da lì che comincia tutto.",
              },
              { testo: "L'attenzione", risposta: "Hai buon fiuto: l'attenzione è il cuore di tutta la macchina." },
              {
                testo: "La lista dei numeri",
                risposta: "Sembra il più semplice, eppure lì c'è la decisione più interessante della lezione.",
              },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "L'attenzione è il cuore del **Transformer**: l'architettura con cui sono costruite tutte queste IA.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "«Transformer»: ti fa venire in mente qualcosa?",
            opzioni: [
              { testo: "I robot dei cartoni animati", risposta: "Lo so: si chiama come i robot. Ma non c'entrano niente!" },
              { testo: "Niente", risposta: "Meglio così: con i robot dei cartoni animati non c'entra niente." },
            ],
          },
          poi: [{ tipo: "testo", testo: "Il nostro Transformer è una macchina fatta di calcoli. Eccola, nella prossima slide." }],
        },
      ],
    },
    {
      titolo: "La catena di montaggio",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Gli stessi tre lavori, visti dentro la macchina. Segui la frase dall'alto in basso." },
            {
              tipo: "flusso",
              entra: "Ieri sono andato al",
              nome: "TRANSFORMER",
              voci: [
                {
                  etichetta: "01",
                  titolo: "Le parole diventano numeri",
                  testo: "La frase viene tagliata a pezzetti, e ogni pezzetto riceve il suo posto.",
                },
                {
                  etichetta: "02 · × 12 VOLTE",
                  titolo: "L'attenzione guarda la frase",
                  testo: "Questo pezzo non c'è una volta sola: è ripetuto uguale, uno sopra l'altro.",
                },
                { etichetta: "03", titolo: "Esce la lista dei numeri", testo: "Un voto per ogni parola che conosce." },
              ],
              esce: "mare",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Quante volte fa il secondo lavoro, l'attenzione?",
            opzioni: [
              { testo: "Una volta", risposta: "Guarda l'etichetta: «× 12 volte». È ripetuto uguale, uno sopra l'altro." },
              { testo: "12 volte", risposta: "È ripetuto uguale, uno sopra l'altro.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Il 12 è un esempio vero: i modelli piccoli ne hanno una dozzina, quelli grandi più di cento.",
            },
          ],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "È uscita la parola «mare». E adesso?",
            opzioni: [
              {
                testo: "Fine: il lavoro è finito",
                risposta: "«Mare» torna all'inizio, e la macchina rifà tutto il giro per la parola dopo.",
              },
              {
                testo: "Si ricomincia, per la parola dopo",
                risposta: "«Mare» torna all'inizio, e la macchina rifà tutto il giro.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "grande",
              testo: "E poi **ricomincia da capo**: la parola scelta torna all'inizio, e la macchina rifà tutto il giro.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Mestiere 1: le parole diventano numeri",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Il computer sa solo contare. Allora taglia la frase in pezzetti, chiamati **token**, e dà a ogni pezzetto un numero.",
            },
            {
              tipo: "pezzi",
              voci: [
                { testo: "Ieri", numero: 8421 },
                { testo: "sono", numero: 319 },
                { testo: "andato", numero: 5107 },
                { testo: "al", numero: 64 },
                { testo: "mare", numero: 2290 },
              ],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "8421 è più grande di 319. Vuol dire che «Ieri» conta più di «sono»?",
            opzioni: [
              { testo: "Sì", risposta: "Il numero è solo un'etichetta, come il numero sulla maglia di un calciatore." },
              {
                testo: "No",
                risposta: "Il numero è solo un'etichetta, come il numero sulla maglia di un calciatore.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Questi numeri sono inventati per l'esempio. Il trucco però è vero: ogni pezzetto ha il suo numero, sempre lo stesso.",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Leggiamo così anche noi: a blocchi, non lettera per lettera. Nessuno legge C-A-S-A: leggi «casa», tutta insieme. Un pezzetto però non è sempre una parola intera.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Secondo te, come taglia «straordinariamente»?",
            opzioni: [
              {
                testo: "stra-or-di-na-ria-men-te",
                risposta: "Quelle sono le sillabe, come a scuola. Il computer usa pezzi più grossi: stra · ordinaria · mente.",
              },
              {
                testo: "stra · ordinaria · mente",
                risposta: "Usa pezzi più grossi delle sillabe: quelli che ha visto più spesso nei testi.",
                giusta: true,
              },
              {
                testo: "Non la taglia",
                risposta: "È una parola lunga e poco comune: la taglia in tre pezzi, stra · ordinaria · mente.",
              },
            ],
          },
          poi: [{ tipo: "pezzi", voci: [{ testo: "stra" }, { testo: "ordinaria" }, { testo: "mente" }] }],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "E il tuo nome? Secondo te resta intero?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Dipende: i nomi comuni spesso restano interi, quelli rari si spezzano in 3 o 4 pezzi. Nel laboratorio puoi provare con il tuo.",
              },
              {
                testo: "No",
                risposta: "Dipende: i nomi rari si spezzano in 3 o 4 pezzi, quelli comuni spesso restano interi. Nel laboratorio puoi provare con il tuo.",
              },
            ],
          },
        },
      ],
    },
    {
      titolo: "La mappa delle parole",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "I numeri non sono messi a caso. Ogni parola ha un posto su una **mappa**: le parole che si usano in modo simile stanno vicine.",
            },
            {
              tipo: "mappa",
              parole: [
                { parola: "frutta", x: 35, y: 10, gruppo: 2 },
                { parola: "pera", x: 15, y: 15, gruppo: 2 },
                { parola: "razzo", x: 88, y: 20, gruppo: 3 },
                { parola: "mela", x: 25, y: 45, gruppo: 2 },
                { parola: "computer", x: 60, y: 45, gruppo: 1 },
                { parola: "banana", x: 12, y: 75, gruppo: 2 },
                { parola: "arancia", x: 38, y: 80, gruppo: 2 },
                { parola: "autostrada", x: 88, y: 80, gruppo: 3 },
              ],
            },
          ],
          attivita: {
            tipo: "completa",
            domanda: "«computer» sta vicino a «mela». Perché, secondo te? Scrivi la tua idea.",
            attese: [
              {
                parole: ["apple", "mac", "macintosh", "iphone", "ipad"],
                risposta: "Esatto: Apple! In inglese «apple» vuol dire «mela», ed è una marca di computer.",
              },
            ],
            altrimenti: "Bella idea! Il motivo è una marca famosa: Apple. In inglese «apple» vuol dire «mela».",
          },
          poi: [
            {
              tipo: "testo",
              testo: "Nessuno ha spiegato al computer che Apple fa i computer. Ha solo notato che «mela» e «computer» compaiono spesso negli stessi testi. La mappa nasce **dal leggere, non dal capire**.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Vicine o lontane",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Ecco tre gruppi di parole. **Quanto sono vicine** dice quanto si somigliano." },
            {
              tipo: "mappa",
              parole: [
                { parola: "pera", x: 62, y: 8, gruppo: 2 },
                { parola: "mela", x: 45, y: 12, gruppo: 2 },
                { parola: "banana", x: 55, y: 30, gruppo: 2 },
                { parola: "gatto", x: 28, y: 38, gruppo: 1 },
                { parola: "razzo", x: 88, y: 40, gruppo: 3 },
                { parola: "cane", x: 12, y: 50, gruppo: 1 },
                { parola: "cavallo", x: 20, y: 72, gruppo: 1 },
                { parola: "autostrada", x: 90, y: 85, gruppo: 3 },
              ],
              dopo: [{ parola: "tigre", x: 36, y: 56, gruppo: 1 }],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Dove metteresti «tigre»?",
            opzioni: [
              {
                testo: "Vicino a cane, gatto e cavallo",
                risposta: "È un animale, come loro: si usa in frasi simili. Eccola sulla mappa.",
                giusta: true,
              },
              {
                testo: "Vicino a mela, pera e banana",
                risposta: "«Tigre» si usa in frasi come quelle di cane e gatto: va vicino agli animali. Eccola sulla mappa.",
              },
              {
                testo: "Vicino a razzo e autostrada",
                risposta: "«Tigre» è un animale: va vicino a cane, gatto e cavallo. Eccola sulla mappa.",
              },
            ],
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "La mappa vera ha solo due direzioni, come questa?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Quella vera ha centinaia di direzioni, a volte migliaia. Sullo schermo ne possiamo disegnare solo due.",
              },
              {
                testo: "No, ne ha di più",
                risposta: "Ne ha centinaia, a volte migliaia. Sullo schermo ne possiamo disegnare solo due.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "grande",
              testo: "La distanza **è** il significato: vicine vuol dire che si somigliano, lontane che non c'entrano.",
            },
            {
              tipo: "testo",
              testo: "Una mappa vera, con migliaia di parole in inglese, è su **projector.tensorflow.org**.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Mestiere 2: l'attenzione",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "La stessa parola può voler dire cose diverse. A decidere sono **le parole che le stanno intorno**.",
            },
          ],
          attivita: {
            tipo: "parole",
            testo: "Marco ha mangiato una pesca matura.",
            parola: "pesca",
            domanda: "Qui «pesca» è il frutto. Tocca le parole che te lo fanno capire, poi premi Conferma.",
            giuste: ["mangiato", "matura"],
            risposta: "Sono «mangiato» e «matura»: si mangia un frutto, ed è il frutto che diventa maturo.",
          },
        },
        {
          attivita: {
            tipo: "parole",
            testo: "Marco è andato a pesca sul lago.",
            parola: "pesca",
            domanda: "Qui invece «pesca» vuol dire prendere i pesci. Quali parole te lo dicono?",
            giuste: ["andato", "lago"],
            risposta: "Sono «andato» e «lago»: si va a pesca, e i pesci stanno nel lago.",
          },
          poi: [
            { tipo: "grande", testo: "Hai appena fatto tu quello che fa **l'attenzione** del computer." },
            {
              tipo: "testo",
              testo: "È come quando prendi appunti: non scrivi ogni parola, scegli quelle che contano. Parole come «il», «di», «che» non pesano quasi niente.",
            },
            {
              tipo: "testo",
              testo: "Il computer non capisce che è il frutto: **collega** «pesca» a «mangiato» e «matura», e si comporta come se lo fosse. Lo fa con i numeri.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Come assegna i pesi: Q, K, V",
      superiori: true,
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Vediamo come fa, in concreto. Ogni parola della frase fa **una domanda** alle altre, e le altre rispondono.",
            },
            {
              tipo: "scheda",
              etichetta: "Q · QUERY",
              titolo: "«Che cosa sto cercando?»",
              testo: "La domanda che ogni parola fa alle altre.",
            },
            {
              tipo: "scheda",
              etichetta: "K · KEY",
              titolo: "«Che cosa posso offrire?»",
              testo: "L'etichetta con cui ogni parola si presenta.",
            },
            {
              tipo: "scheda",
              etichetta: "V · VALUE",
              titolo: "«Ecco il mio contenuto.»",
              testo: "L'informazione che passa, pesata dal punteggio.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Pensa a un motore di ricerca. Che cosa assomiglia alla Query?",
            opzioni: [
              {
                testo: "Quello che scrivi nella casella",
                risposta: "Le Key sono i titoli dei risultati, il Value è il contenuto delle pagine. Il punteggio dice quanto conta ogni pagina.",
                giusta: true,
              },
              {
                testo: "I titoli dei risultati",
                risposta: "Quelli assomigliano alle Key. La Query è quello che scrivi nella casella, il Value è il contenuto delle pagine.",
              },
              {
                testo: "Il contenuto delle pagine",
                risposta: "Quello assomiglia al Value. La Query è quello che scrivi nella casella, le Key sono i titoli dei risultati.",
              },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Nella frase «Marco è andato a pesca sul lago», la parola «pesca» manda la sua Query: «Posso voler dire due cose: chi mi aiuta a scegliere?»",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Quale Key risponde meglio?",
            opzioni: [
              {
                testo: "«lago»: sono un luogo d'acqua",
                risposta: "Il punteggio è alto: il Value di «lago» entra con un peso forte nei numeri di «pesca».",
                giusta: true,
              },
              {
                testo: "«sul»: sono una parolina che collega",
                risposta: "Risponde anche lei, ma il punteggio è basso: entra con un peso quasi zero. Vince «lago», un luogo d'acqua.",
              },
            ],
          },
          poi: [
            { tipo: "testo", testo: "Ecco un esempio di pesi, con numeri inventati:" },
            {
              tipo: "barre",
              voci: [
                { parola: "lago", percento: 52 },
                { parola: "andato", percento: 28 },
                { parola: "Marco", percento: 12 },
                { parola: "sul", percento: 8 },
              ],
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "E non lo fa una volta sola: lo fa **in più modi insieme**, con tante «teste». Una segue la grammatica, una il significato, una chi fa che cosa. Si chiama **multi-head attention**.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Chi ha deciso che una testa segua la grammatica?",
            opzioni: [
              {
                testo: "Gli ingegneri, una testa alla volta",
                risposta: "Nessuno l'ha programmato: le teste si sono specializzate da sole, durante l'addestramento.",
              },
              {
                testo: "Nessuno: è successo da solo",
                risposta: "Le teste si sono specializzate da sole, durante l'addestramento.",
                giusta: true,
              },
            ],
          },
        },
      ],
    },
    {
      titolo: "Il Transformer",
      superiori: true,
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Tutto questo sta dentro un'architettura che si chiama **Transformer**. Nasce nel **2017**, in un articolo di Google, con un titolo che è già un riassunto.",
            },
            { tipo: "frase", testo: "Attention Is All You ___" },
          ],
          attivita: {
            tipo: "completa",
            domanda: "Completa il titolo: è in inglese.",
            attese: [
              {
                parole: ["need"],
                risposta: "Esatto: «l'attenzione è tutto quello che ti serve». Gli autori dicevano: basta questo meccanismo, buttate via il resto. E avevano ragione.",
              },
            ],
            altrimenti: "Il titolo è «Attention Is All You Need»: l'attenzione è tutto quello che ti serve. Gli autori dicevano: basta questo meccanismo, buttate via il resto.",
          },
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "PRIMA DEL 2017",
              titolo: "Una parola alla volta, in fila",
              testo: "I modelli di prima leggevano il testo parola per parola.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Che problema avevano, secondo te, con un testo lungo?",
            opzioni: [
              {
                testo: "Alla fine avevano dimenticato l'inizio",
                risposta: "Il Transformer invece legge tutta la frase insieme.",
                giusta: true,
              },
              {
                testo: "Erano troppo veloci",
                risposta: "Al contrario: erano lenti, e verso la fine di un testo lungo avevano già dimenticato l'inizio. Il Transformer invece legge tutta la frase insieme.",
              },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "IL TRANSFORMER",
              titolo: "Fa i conti in parallelo",
              testo: "Migliaia di calcoli nello stesso istante, invece che in coda. È questo che permette di addestrare modelli così grandi.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "La T di GPT sta per…",
            opzioni: [
              { testo: "Testo", risposta: "Sta per Transformer. Quella T che usi tutti i giorni è proprio questa macchina." },
              { testo: "Transformer", risposta: "Quella T che usi tutti i giorni è proprio questa macchina.", giusta: true },
              { testo: "Turbo", risposta: "Sta per Transformer. Quella T che usi tutti i giorni è proprio questa macchina." },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Senza i conti in parallelo ChatGPT non esisterebbe: non perché mancasse l'idea, ma perché addestrarlo avrebbe richiesto secoli.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Mestiere 3: esce la lista dei numeri",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Alla fine di tutto questo lavoro, che cosa esce? **Non una parola**: una lista. Un voto per ogni parola che il computer conosce.",
            },
            { tipo: "scheda", etichetta: "LA DOMANDA", titolo: "«Di che colore è il cielo?»" },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Nella lista c'è anche «pizza». Secondo te, quanto vale?",
            opzioni: [
              { testo: "Zero", risposta: "Vale pochissimo, come «frigorifero» nella slide 7. Ma non zero: è una differenza importante." },
              {
                testo: "Pochissimo, ma non zero",
                risposta: "Vale pochissimo, come «frigorifero» nella slide 7. Ma non zero: è una differenza importante.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "barre",
              voci: [
                { parola: "blu", percento: 70 },
                { parola: "grigio", percento: 15 },
                { parola: "rosa", percento: 2 },
                { parola: "pizza", percento: 0.001 },
              ],
            },
            {
              tipo: "testo",
              testo: "Vuol dire che, una volta ogni centomila, il computer potrebbe davvero scrivere «il cielo è pizza».",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "La lista vera non ha 4 righe, ma **decine di migliaia**. E viene rifatta da capo per ogni parola che scrive.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Allora, quale parola sceglie?",
            opzioni: [
              {
                testo: "«blu», è ovvio",
                risposta: "Sembra ovvio. E invece qui c'è la decisione più interessante della lezione: la vedi tra poco.",
              },
              {
                testo: "Non lo so",
                risposta: "Bene il dubbio: qui c'è la decisione più interessante della lezione. La vedi tra poco.",
              },
            ],
          },
        },
      ],
    },
    {
      titolo: "Da punteggi a probabilità: la softmax",
      superiori: true,
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Quelle percentuali non escono direttamente dalla rete. La rete produce **punteggi grezzi**, chiamati **logits**: grandi, piccoli, anche negativi.",
            },
            {
              tipo: "tabella",
              colonne: ["Parola", "Logit"],
              righe: [
                ["bagno", "1,2"],
                ["tuffo", "0,9"],
                ["giro", "0,1"],
                ["castello", "−0,5"],
              ],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Può esistere una probabilità negativa, come −0,5?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Una probabilità va da 0 a 1. Serve una trasformazione che renda tutto positivo e faccia sommare tutto a 1. Si chiama softmax.",
              },
              {
                testo: "No",
                risposta: "Una probabilità va da 0 a 1. Serve una trasformazione che renda tutto positivo e faccia sommare tutto a 1. Si chiama softmax.",
                giusta: true,
              },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "**Primo passo**: l'esponenziale di ogni punteggio. Diventano tutti positivi, e chi era avanti si stacca ancora di più.",
            },
            {
              tipo: "tabella",
              colonne: ["Parola", "Logit", "exp"],
              righe: [
                ["bagno", "1,2", "3,32"],
                ["tuffo", "0,9", "2,46"],
                ["giro", "0,1", "1,11"],
                ["castello", "−0,5", "0,61"],
              ],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Secondo passo: la somma. Quanto fa, più o meno, 3,32 + 2,46 + 1,11 + 0,61?",
            opzioni: [
              { testo: "circa 6,5", risposta: "Rifai il conto: fa circa 7,5. Con tutti i decimali, 7,49." },
              { testo: "circa 7,5", risposta: "Con tutti i decimali fa 7,49.", giusta: true },
              { testo: "circa 8,5", risposta: "Rifai il conto: fa circa 7,5. Con tutti i decimali, 7,49." },
            ],
          },
        },
        {
          mostra: [{ tipo: "testo", testo: "**Terzo passo**: ogni esponenziale si divide per la somma." }],
          attivita: {
            tipo: "scelta",
            domanda: "Quanto fa 3,32 diviso 7,49?",
            opzioni: [
              { testo: "circa 0,44", risposta: "Ecco il 44% di «bagno», quello della slide 7!", giusta: true },
              { testo: "circa 2,25", risposta: "Fa circa 0,44: ecco il 44% di «bagno», quello della slide 7!" },
              { testo: "circa 0,13", risposta: "Fa circa 0,44: ecco il 44% di «bagno», quello della slide 7!" },
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
            },
            {
              tipo: "testo",
              testo: "In breve: **y = softmax(u)**, e le probabilità sommano a 1: 0,44 + 0,33 + 0,15 + 0,08 = 1,00. Nel laboratorio rifai questo conto in Python, e vedi che torna.",
            },
          ],
        },
      ],
    },
    {
      titolo: "La catena di montaggio, di nuovo",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Ti ricordi la catena di montaggio? Adesso hai visto da vicino tutti e tre i lavori. Raccontala tu.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Entra la frase «Ieri sono andato al». Che cosa succede per prima cosa?",
            opzioni: [
              {
                testo: "Le parole diventano numeri",
                risposta: "La frase viene tagliata in token, e ogni token riceve il suo posto sulla mappa.",
                giusta: true,
              },
              {
                testo: "Esce la lista dei numeri",
                risposta: "Quello è l'ultimo lavoro. Il primo è trasformare le parole in numeri: i token, e il loro posto sulla mappa.",
              },
              {
                testo: "L'attenzione guarda la frase",
                risposta: "Quello è il secondo lavoro. Il primo è trasformare le parole in numeri: i token, e il loro posto sulla mappa.",
              },
            ],
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Poi c'è l'attenzione, «× 12 volte». Che cosa vuol dire?",
            opzioni: [
              {
                testo: "È ripetuta 12 volte, una sopra l'altra",
                risposta: "Ogni volta guarda di nuovo la frase, e pesa le parole che contano.",
                giusta: true,
              },
              { testo: "Legge solo 12 parole", risposta: "Vuol dire che il blocco dell'attenzione è ripetuto 12 volte, uno sopra l'altro." },
              { testo: "Ci mette 12 secondi", risposta: "Vuol dire che il blocco dell'attenzione è ripetuto 12 volte, uno sopra l'altro." },
            ],
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "E alla fine, che cosa esce?",
            opzioni: [
              { testo: "Una parola sola", risposta: "Prima esce una lista, con un voto per ogni parola. Poi se ne sceglie una." },
              {
                testo: "Una lista, un voto per ogni parola",
                risposta: "Poi, da quella lista, se ne sceglie una. Qui è uscita «mare».",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "flusso",
              entra: "Ieri sono andato al",
              nome: "TRANSFORMER",
              voci: [
                {
                  etichetta: "01",
                  titolo: "Le parole diventano numeri",
                  testo: "La frase viene tagliata a pezzetti, e ogni pezzetto riceve il suo posto.",
                },
                {
                  etichetta: "02 · × 12 VOLTE",
                  titolo: "L'attenzione guarda la frase",
                  testo: "Questo pezzo non c'è una volta sola: è ripetuto uguale, uno sopra l'altro.",
                },
                { etichetta: "03", titolo: "Esce la lista dei numeri", testo: "Un voto per ogni parola che conosce." },
              ],
              esce: "mare",
            },
            { tipo: "testo", testo: "Se hai risposto bene a tutte e tre, la prima metà della lezione ha funzionato!" },
          ],
        },
      ],
    },
    {
      titolo: "E adesso come sceglie?",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Il computer ha la sua lista: bagno 44%, tuffo 33%, giro 15%, castello 8%. Adesso deve **sceglierne una**.",
            },
            { tipo: "scheda", etichetta: "IDEA 1", titolo: "Prendere sempre la prima", testo: "Ogni volta la parola più probabile." },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Dove sta il problema, secondo te?",
            opzioni: [
              {
                testo: "Risponderebbe sempre uguale",
                risposta: "Stessa domanda, stessa identica risposta, per sempre. E con le parole più scontate viene fuori un testo noioso e ripetitivo.",
                giusta: true,
              },
              {
                testo: "Sarebbe troppo lento",
                risposta: "Anzi, sarebbe velocissimo. Il problema è che risponderebbe sempre la stessa identica cosa, con un testo noioso e ripetitivo.",
              },
              {
                testo: "Nessun problema",
                risposta: "Sembra la scelta giusta. Ma così risponderebbe sempre la stessa identica cosa, con un testo noioso e ripetitivo.",
              },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "IDEA 2 · QUELLA CHE SI USA",
              titolo: "Tirare un dado truccato",
              testo: "Come una ruota della fortuna: «bagno» occupa il 44% della ruota, «castello» solo l'8%.",
            },
            {
              tipo: "barre",
              voci: [
                { parola: "bagno", percento: 44 },
                { parola: "tuffo", percento: 33 },
                { parola: "giro", percento: 15 },
                { parola: "castello", percento: 8 },
              ],
            },
          ],
          attivita: {
            tipo: "dado",
            domanda: "Tira tu il dado truccato, 6 volte. Che parole escono?",
            voci: [
              { parola: "bagno", percento: 44 },
              { parola: "tuffo", percento: 33 },
              { parola: "giro", percento: 15 },
              { parola: "castello", percento: 8 },
            ],
            lanci: 6,
            risposta: "Di solito esce «bagno», ogni tanto «castello». Ogni lancio può dare una parola diversa.",
          },
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Ti è mai capitato di rifare la stessa domanda a ChatGPT e avere una risposta diversa?",
            opzioni: [
              { testo: "Sì", risposta: "Ecco perché: non prende la più probabile, tira il dado." },
              { testo: "No", risposta: "Prova, prima o poi: la risposta cambia. Non prende la più probabile, tira il dado." },
              {
                testo: "Non l'ho mai usato",
                risposta: "Se lo userai, vedrai che la risposta cambia: non prende la più probabile, tira il dado.",
              },
            ],
          },
          poi: [
            { tipo: "grande", testo: "Ogni risposta è **un lancio di dadi**." },
            {
              tipo: "testo",
              testo: "E la parola più probabile non è sempre la migliore: una poesia è piena di parole che nessuno si aspetta.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Greedy, campionamento e temperatura",
      superiori: true,
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "L'idea 1 ha un nome: **decodifica greedy**, cioè «avida». A ogni passo prende il massimo e non si volta indietro.",
            },
            {
              tipo: "scheda",
              etichetta: "IN NOTAZIONE",
              titolo: "w = argmax P(w | testo precedente)",
              testo: "«Fra tutte le parole del vocabolario, dammi quella con la probabilità più alta.»",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Con bagno 0,44 · tuffo 0,33 · giro 0,15 · castello 0,08, che cosa dà argmax?",
            opzioni: [
              {
                testo: "bagno",
                risposta: "Il massimo, 0,44. E lo darà ogni volta: per questo si dice che è deterministica.",
                giusta: true,
              },
              { testo: "tuffo", risposta: "argmax prende il massimo: «bagno», con 0,44. E lo darà ogni volta: è deterministica." },
              { testo: "Una a caso", risposta: "Tirare a sorte è il campionamento. argmax prende sempre il massimo, «bagno»." },
            ],
          },
        },
        {
          mostra: [
            {
              tipo: "testo",
              testo: "L'idea 2, il **campionamento**, ha una manopola: la **temperatura**. Prova a girarla e guarda le barre.",
            },
            {
              tipo: "temperatura",
              voci: [
                { parola: "bagno", punteggio: 1.2 },
                { parola: "tuffo", punteggio: 0.9 },
                { parola: "giro", punteggio: 0.1 },
                { parola: "castello", punteggio: -0.5 },
              ],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Con la temperatura bassa, che cosa succede?",
            opzioni: [
              {
                testo: "Vince quasi sempre «bagno»",
                risposta: "La ruota si sbilancia sulle parole sicure: il testo diventa piatto e prevedibile.",
                giusta: true,
              },
              {
                testo: "Le parole si avvicinano",
                risposta: "Quello succede con la temperatura alta. Con quella bassa vince quasi sempre «bagno»: il testo diventa piatto.",
              },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Con la temperatura alta succede il contrario: le parole si avvicinano, e il testo diventa creativo… e poi delirante.",
            },
          ],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Per scrivere una mail formale, che temperatura conviene?",
            opzioni: [
              {
                testo: "Bassa",
                risposta: "Serve un testo preciso e prevedibile. Per inventare una storia, invece, conviene alzarla.",
                giusta: true,
              },
              { testo: "Alta", risposta: "Meglio bassa: serve un testo preciso. La temperatura alta va bene per inventare una storia." },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Come funziona: la temperatura divide i logits prima della softmax. Nel laboratorio la giri tu, e vedi il computer impazzire.",
            },
          ],
        },
      ],
    },
    {
      titolo: "E poi ricomincia da capo",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Il computer non scrive la risposta tutta insieme. Scrive **una parola**, la rimette in fondo alla frase, e rifà tutto il giro.",
            },
            { tipo: "scheda", etichetta: "LA DOMANDA", titolo: "«Cosa mangiano i gatti?»" },
            { tipo: "frase", testo: "I ___" },
          ],
          attivita: {
            tipo: "completa",
            domanda: "Fai tu il computer: che parola viene dopo «I»?",
            attese: [
              {
                parole: ["gatti"],
                risposta: "Proprio come il computer: «I gatti». Poi rilegge «I gatti» e cerca la parola dopo.",
              },
            ],
            altrimenti: "Poteva uscire anche questa. Il computer, qui, ha scelto «gatti». Poi rilegge «I gatti» e cerca la parola dopo.",
          },
        },
        {
          mostra: [
            {
              tipo: "tabella",
              colonne: ["Giro", "Il testo fin qui"],
              righe: [
                ["1", "I"],
                ["2", "I gatti"],
                ["3", "I gatti mangiano"],
                ["4", "I gatti mangiano pesce"],
                ["5", "I gatti mangiano pesce e"],
                ["6", "I gatti mangiano pesce e crocchette."],
              ],
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Ogni riga è un giro completo dei tre lavori. Per una risposta di 200 parole, quanti giri?",
            opzioni: [
              { testo: "1", risposta: "Un giro per ogni parola: per 200 parole, 200 giri." },
              { testo: "3", risposta: "Un giro per ogni parola: per 200 parole, 200 giri." },
              { testo: "200", risposta: "Un giro completo per ogni parola.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Ecco perché la risposta compare **a pezzetti** sullo schermo: la stai guardando mentre viene costruita.",
            },
          ],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Quando ha scritto «I gatti», sa già come finirà la frase?",
            opzioni: [
              {
                testo: "Sì, ha già deciso",
                risposta: "Non ha un piano: costruisce la frase un pezzo alla volta, guidato da quello che ha appena scritto.",
              },
              {
                testo: "No",
                risposta: "Non ha un piano: costruisce la frase un pezzo alla volta, guidato da quello che ha appena scritto.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "E come fa a fermarsi? Ha una parola speciale che vuol dire «ho finito». Anche quella esce tirando il dado.",
            },
          ],
        },
      ],
    },
    {
      titolo: "Quindi non capisce. E si vede.",
      passi: [
        {
          mostra: [
            {
              tipo: "testo",
              testo: "Torniamo alla domanda dell'inizio. Il computer non sa che cos'è un gatto: sa quali parole stanno vicino a «gatto». Da qui nascono **tre cose** molto concrete.",
            },
            {
              tipo: "scheda",
              etichetta: "01",
              titolo: "Si inventa le cose",
              testo: "Libri, date, personaggi: scritti benissimo e completamente falsi.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Gli chiedi la trama di un libro che non esiste, con un titolo che sembra vero. Che cosa fa?",
            opzioni: [
              { testo: "Dice che non esiste", risposta: "Quasi mai: di solito inventa tutto, con personaggi e finale." },
              { testo: "Inventa una trama", risposta: "Quasi sempre inventa tutto, con personaggi e finale.", giusta: true },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Per lui ogni domanda è un'interrogazione: meglio inventare che dire «non lo so». Scrivere una cosa vera e inventarne una sono **la stessa operazione**: mettere in fila parole probabili.",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "02",
              titolo: "Ripete i pregiudizi",
              testo: "Ha imparato dai testi scritti da noi. Se lì dentro c'erano pregiudizi, ha imparato anche quelli.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Perché ripete un pregiudizio?",
            opzioni: [
              {
                testo: "Perché è cattivo",
                risposta: "Non è cattivo e non ha opinioni: ripete uno schema che ha visto tante volte nei testi.",
              },
              {
                testo: "Perché l'ha visto scritto tante volte",
                risposta: "Non è cattivo e non ha opinioni: ripete uno schema che ha visto tante volte.",
                giusta: true,
              },
              {
                testo: "Perché qualcuno l'ha programmato così",
                risposta: "Nessuno l'ha programmato: ripete uno schema che ha visto tante volte nei testi scritti da noi.",
              },
            ],
          },
          poi: [
            {
              tipo: "testo",
              testo: "Per esempio, certi mestieri li completa più spesso al maschile, altri al femminile: perché così li ha visti scritti.",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "03",
              titolo: "Non sa che giorno è",
              testo: "Ha smesso di leggere a una certa data. Di quello che è successo dopo, non sa niente.",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Gli chiedi chi ha vinto l'ultimo campionato. Che cosa può succedere?",
            opzioni: [
              {
                testo: "Risponde sempre giusto",
                risposta: "Si è fermato a una certa data, quindi spesso sbaglia. A meno che le informazioni non gliele dia tu, o una ricerca sul web aggiunta sopra il modello.",
              },
              {
                testo: "Può sbagliare",
                risposta: "Si è fermato a una certa data. A meno che le informazioni non gliele dia tu, o una ricerca sul web aggiunta sopra il modello.",
                giusta: true,
              },
            ],
          },
          poi: [
            {
              tipo: "grande",
              stile: "scuro",
              testo: "Non sono difetti da sistemare con un aggiornamento: sono **la conseguenza di come funziona**.",
            },
          ],
        },
        {
          attivita: {
            tipo: "scelta",
            domanda: "Allora, secondo te, è intelligente?",
            opzioni: [
              {
                testo: "Sì",
                risposta: "Fa cose che sembrano intelligenti, è vero. Ma con un meccanismo che non somiglia per niente al nostro modo di pensare.",
              },
              {
                testo: "No",
                risposta: "Eppure fa cose che sembrano intelligenti. Solo che il meccanismo non somiglia per niente al nostro modo di pensare.",
              },
              {
                testo: "Dipende",
                risposta: "Proprio così: dipende da che cosa chiamiamo intelligenza. Fa cose che sembrano intelligenti, con un meccanismo che non somiglia per niente al nostro.",
              },
            ],
          },
        },
      ],
    },
    {
      titolo: "Da portare a casa",
      passi: [
        {
          mostra: [
            { tipo: "testo", testo: "Ti ricordi le tre risposte sbagliate dell'inizio? Adesso sai dire perché." },
            { tipo: "scheda", etichetta: "SBAGLIATO 01", titolo: "«Cerca su internet»" },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Perché è sbagliata?",
            opzioni: [
              {
                testo: "Mentre scrive non è collegato a niente",
                risposta: "Il modello in sé non cerca niente: la ricerca sul web, quando c'è, è aggiunta sopra.",
                giusta: true,
              },
              {
                testo: "Perché internet è lento",
                risposta: "Il motivo è un altro: mentre scrive, il modello non è collegato a niente. La ricerca sul web, quando c'è, è aggiunta sopra.",
              },
            ],
          },
        },
        {
          mostra: [{ tipo: "scheda", etichetta: "SBAGLIATO 02", titolo: "«Ha dentro tante risposte»" }],
          attivita: {
            tipo: "scelta",
            domanda: "Perché è sbagliata?",
            opzioni: [
              {
                testo: "Ha imparato solo gli schemi",
                risposta: "Non ha salvato le pagine: ha imparato quali parole stanno vicine a quali altre.",
                giusta: true,
              },
              {
                testo: "Le risposte sono troppe",
                risposta: "Il motivo è un altro: non ha salvato nessuna pagina. Ha imparato solo gli schemi, cioè quali parole stanno vicine a quali altre.",
              },
            ],
          },
        },
        {
          mostra: [{ tipo: "scheda", etichetta: "SBAGLIATO 03", titolo: "«Pensa come noi»" }],
          attivita: {
            tipo: "scelta",
            domanda: "Perché è sbagliata?",
            opzioni: [
              {
                testo: "Indovina la parola dopo, con i numeri",
                risposta: "Non capisce: fa i conti e tira un dado truccato, una parola alla volta.",
                giusta: true,
              },
              {
                testo: "Pensa più veloce di noi",
                risposta: "In realtà non pensa: indovina la parola dopo, con i numeri, una parola alla volta.",
              },
            ],
          },
        },
        {
          mostra: [
            { tipo: "testo", testo: "**01** L'IA indovina la parola dopo. Tutto il resto nasce da qui." },
            { tipo: "testo", testo: "**02** Le parole diventano numeri su una mappa: quelle simili stanno vicine." },
            { tipo: "testo", testo: "**03** L'attenzione decide quali parole della frase contano di più." },
            { tipo: "testo", testo: "**04** Non esce una parola: esce una lista di numeri. Poi si tira un dado truccato." },
            { tipo: "testo", testo: "**05** Scrive una parola alla volta, e non sa come finirà la frase." },
            {
              tipo: "grande",
              stile: "scuro",
              testo: "Non c'è un cervellino dentro la scatola. C'è una macchina che **indovina la parola dopo**, e lo fa molto bene.",
            },
          ],
        },
        {
          mostra: [
            {
              tipo: "scheda",
              etichetta: "LA PROSSIMA VOLTA",
              titolo: "Se segue il testo che legge… che cosa succede se qualcuno ci nasconde dentro dei messaggi?",
            },
          ],
          attivita: {
            tipo: "scelta",
            domanda: "Tu che cosa pensi?",
            opzioni: [
              { testo: "Li segue", risposta: "Interessante… Lo scopri nella lezione 2." },
              { testo: "Li ignora", risposta: "Davvero? Lo scopri nella lezione 2." },
              { testo: "Non lo so", risposta: "Lo scopri nella lezione 2." },
            ],
          },
        },
      ],
    },
  ],
});
