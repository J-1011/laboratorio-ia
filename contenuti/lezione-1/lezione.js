// Lesson 1: its card, its materials and its quiz. The format is in README.md.
registerLesson({
  numero: 1,
  titolo: "Come «ragiona» un'intelligenza artificiale?",
  sommario: "Un'intelligenza artificiale non capisce come una persona: prevede la parola successiva.",
  durata: "60 minuti",
  materiali: [
    { etichetta: "Slide per la scuola media", file: "slide-medie.pdf", tipo: "pdf" },
    { etichetta: "Slide per la scuola superiore", file: "slide-superiori.pdf", tipo: "pdf" },
    {
      etichetta: "Laboratorio",
      file: "laboratorio.ipynb",
      tipo: "notebook",
      // colab: "https://colab.research.google.com/...",   // optional, adds the Colab button
    },
  ],
  interattiva: "interattiva.js",
  quiz: {
    titolo: "Quiz della lezione 1",
    domande: [
      {
        id: "d1",
        testo: "Che cosa fa un'IA come ChatGPT quando scrive una frase?",
        opzioni: [
          { id: "a", testo: "Prevede la parola successiva, una alla volta" },
          { id: "b", testo: "Cerca la risposta su internet" },
          { id: "c", testo: "Prende una risposta già pronta da un archivio" },
          { id: "d", testo: "Capisce la domanda come farebbe una persona" },
        ],
        corretta: "a",
        spiegazione:
          "Il modello fa una cosa sola: prevede la parola dopo, poi rifà tutto il giro per quella dopo ancora. Mentre scrive non è collegato a internet, non ha frasi salvate e non capisce come una persona.",
      },
      {
        id: "d2",
        testo: "Fai due volte la stessa domanda a un'IA e ricevi due risposte diverse. Perché?",
        opzioni: [
          { id: "a", testo: "Ha imparato qualcosa di nuovo dalla tua prima domanda" },
          { id: "b", testo: "Ogni parola viene scelta tirando un dado truccato" },
          { id: "c", testo: "Ha cambiato idea su quello che pensa" },
        ],
        corretta: "b",
        spiegazione:
          "Il modello calcola quanto è probabile ogni parola, poi ne sceglie una tirando a sorte. Le parole più probabili escono più spesso, ma non sempre: per questo la risposta cambia. E non impara dalle tue chat.",
      },
      {
        id: "d3",
        testo: "Chiedi a un'IA di parlarti di un libro che non esiste. Che cosa può succedere?",
        opzioni: [
          { id: "a", testo: "Si accorge sempre che il libro non esiste" },
          { id: "b", testo: "Si blocca e non scrive niente" },
          { id: "c", testo: "Inventa una risposta scritta bene, ma falsa" },
        ],
        corretta: "c",
        spiegazione:
          "Per il modello scrivere una cosa vera e inventarne una sono la stessa operazione: mettere in fila parole probabili. Non si accorge di quando inventa, quindi quello che scrive va sempre controllato.",
      },
    ],
  },
});
