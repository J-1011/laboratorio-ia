// Lesson 2: its card, its materials and its quiz. The format is in README.md.
registerLesson({
  numero: 2,
  titolo: "Attaccare un'IA con le parole",
  sommario: "Prompt injection: quando un pezzo di testo diventa un ordine che la macchina esegue.",
  durata: "60 minuti",
  materiali: [
    { etichetta: "Slide della lezione", file: "slide.pdf", tipo: "pdf" },
    { etichetta: "Laboratorio", file: "laboratorio.ipynb", tipo: "notebook" },
  ],
  quiz: {
    titolo: "Quiz della lezione 2",
    domande: [
      {
        id: "d1",
        testo: "Perché un'IA può eseguire un ordine nascosto dentro una pagina web?",
        opzioni: [
          { id: "a", testo: "Perché qualcuno ha rubato la sua password" },
          { id: "b", testo: "Perché per lei le istruzioni e il testo da leggere sono la stessa cosa: testo" },
          { id: "c", testo: "Perché obbedisce solo a chi scrive in maiuscolo" },
        ],
        corretta: "b",
        spiegazione:
          "Le istruzioni di chi ha costruito l'app, la tua domanda e le pagine lette dal web arrivano al modello come un unico nastro di testo. Lì dentro niente dice «da qui in poi, non fidarti»: un ordine scritto bene viene eseguito come gli altri.",
      },
      {
        id: "d2",
        testo: "Che cos'è un attacco indiretto?",
        opzioni: [
          { id: "a", testo: "L'attaccante nasconde l'ordine in una pagina o in un documento, e aspetta che qualcun altro lo faccia leggere all'IA" },
          { id: "b", testo: "L'attaccante scrive l'ordine direttamente nella chat dell'IA" },
          { id: "c", testo: "L'attaccante spegne il computer su cui gira l'IA" },
        ],
        corretta: "a",
        spiegazione:
          "L'attaccante non parla mai con l'IA. Mette l'ordine in una pagina web, una recensione o un curriculum, poi aspetta. Quando un utente qualsiasi chiede all'IA di riassumere quella pagina, l'ordine viene eseguito, anche se chi ha chiesto il riassunto non ha fatto niente di sbagliato. Per questo è la variante più pericolosa.",
      },
      {
        id: "d3",
        testo: "Nel laboratorio trovi il modo di far dire ad Artù la parola segreta. Che cosa fai?",
        opzioni: [
          { id: "a", testo: "Provo lo stesso trucco sul chatbot di un negozio vero" },
          { id: "b", testo: "Lo tengo per me, così lo posso usare ancora" },
          { id: "c", testo: "Lo racconto, e lo provo solo sul modello del laboratorio" },
        ],
        corretta: "c",
        spiegazione:
          "Si attacca solo il modello del laboratorio, mai i sistemi veri: attaccare un sistema che non è tuo, senza permesso, è illegale. E chi trova un buco lo racconta, non lo sfrutta: è la regola di tutta la sicurezza informatica.",
      },
    ],
  },
});
