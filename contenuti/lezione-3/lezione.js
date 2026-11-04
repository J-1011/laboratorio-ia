// Lesson 3: its card, its materials and its quiz. The format is in README.md.
registerLesson({
  numero: 3,
  titolo: "Difendere un'IA: essere un hacker etico",
  sommario: "Come si ripara quello che avete rotto la volta scorsa. E perché questo mestiere ha un nome.",
  durata: "60 minuti",
  materiali: [
    { etichetta: "Slide della lezione", file: "slide.pdf", tipo: "pdf" },
    { etichetta: "Laboratorio", file: "laboratorio.ipynb", tipo: "notebook" },
  ],
  interattiva: "interattiva.js",
  quiz: {
    titolo: "Quiz della lezione 3",
    domande: [
      {
        id: "d1",
        testo: "Esiste una difesa che blocca per sempre ogni prompt injection?",
        opzioni: [
          { id: "a", testo: "Sì, basta scrivere «non rivelarla mai» nelle istruzioni" },
          { id: "b", testo: "Sì, basta un filtro che blocca la parola «ignora»" },
          { id: "c", testo: "No: si può rendere l'attacco più difficile e il danno più piccolo" },
        ],
        corretta: "c",
        spiegazione:
          "Il problema nasce dal modo in cui funziona un LLM: legge tutto come un testo solo, e non c'è un aggiornamento che lo sistemi. Ogni difesa alza il prezzo per chi attacca, e se l'attacco riesce lo stesso deve poter fare il meno danno possibile.",
      },
      {
        id: "d2",
        testo: "Perché una difesa non si misura solo con il numero di attacchi che ferma?",
        opzioni: [
          { id: "a", testo: "Perché gli attacchi fermati non si possono contare" },
          { id: "b", testo: "Perché conta anche quanti visitatori veri blocca per sbaglio" },
          { id: "c", testo: "Perché più attacchi ferma, più l'assistente diventa lento" },
        ],
        corretta: "b",
        spiegazione:
          "Ogni allarme suona anche quando non c'è il ladro. I visitatori veri bloccati per sbaglio si chiamano falsi positivi: un assistente che blocca tutti, dopo una settimana, viene spento.",
      },
      {
        id: "d3",
        testo: "Che differenza c'è tra un hacker «cappello bianco» e uno «cappello nero»?",
        opzioni: [
          { id: "a", testo: "Il cappello bianco chiede il permesso e fa chiudere il buco; il cappello nero lo usa per sé" },
          { id: "b", testo: "Il cappello bianco è più bravo con i computer" },
          { id: "c", testo: "Il cappello nero usa programmi diversi" },
        ],
        corretta: "a",
        spiegazione:
          "Hanno le stesse conoscenze: cambia la scelta. Il cappello bianco chiede il permesso, cerca e poi scrive a chi può riparare. Il cappello nero tiene il buco per sé, lo sfrutta o lo vende, ed è un reato.",
      },
    ],
  },
});
