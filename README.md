# Sito delle lezioni del Museo CTRL+Alt

Questo sito accompagna i laboratori del Museo CTRL+Alt di Pavia su come funzionano
i modelli linguistici e su come si possono attaccare e difendere. Gli studenti ci
trovano i materiali di ogni lezione e, alla fine, un breve quiz.

È un sito statico: solo file HTML, CSS e JavaScript. Non c'è un server da tenere
acceso, non c'è un database e nessuno fa il login. Si può pubblicare su un servizio
come GitHub Pages o Vercel, oppure aprire direttamente dal computer.

## 1. Vedere il sito sul proprio computer

**Il modo più semplice:** fare doppio clic su `index.html`.

**Per una prova più vicina a come sarà online:** aprire un terminale nella cartella del
progetto (in VS Code: menu **Terminal > New Terminal**) e scrivere:

```
py -m http.server 8000 --bind 127.0.0.1
```

Poi aprire <http://127.0.0.1:8000> nel browser. Per spegnere: `Ctrl+C` nel terminale.

`--bind 127.0.0.1` è importante: senza, tutta la cartella del progetto, compresi
`resources/` e i materiali originali delle lezioni, diventa raggiungibile da altri
dispositivi sulla rete.

Dopo una modifica basta ricaricare la pagina. Se il browser mostra ancora la versione
vecchia, premere `Ctrl+F5`.

## 2. Pubblicare il sito

Il sito si pubblica tramite git: il servizio prende i file dal repository. **Non caricare
la cartella a mano**: contiene anche `lesson_env/`, `resources/` e i materiali originali
delle lezioni, che il file `.gitignore` tiene fuori dal repository.

Prima di pubblicare, leggere il punto 7 sulla pagina per i docenti.

**GitHub Pages.** Nel repository, aprire **Settings > Pages** e scegliere di pubblicare dal
ramo principale, cartella `/ (root)`. Il sito compare dopo qualche minuto all'indirizzo
`https://<nome-utente>.github.io/<nome-repository>/`. Con il piano gratuito il repository
deve essere pubblico.

**Vercel.** Importare il repository senza impostare nessun comando di build: i file vanno
pubblicati così come sono. Vercel può pubblicare anche da un repository privato. Il piano
gratuito è pensato per progetti personali e non commerciali: controllare le condizioni.

Ogni modifica mandata al repository arriva online dopo qualche minuto.

## 3. Aggiungere una lezione

Ogni lezione è una cartella dentro `contenuti/`, con un file `lezione.js` e i materiali:

```
contenuti/
  elenco.js             l'elenco delle cartelle delle lezioni
  lezione-4/
    lezione.js          scheda, materiali e quiz della lezione
    interattiva.js      facoltativo: la versione interattiva delle slide (punto 5)
    slide.pdf
    laboratorio.ipynb
```

1. Copiare la cartella `contenuti/lezione-1` e rinominare la copia, per esempio `lezione-4`.
2. Mettere nella cartella i file della nuova lezione.
3. Aggiornare `lezione.js`:

   ```js
   registerLesson({
     numero: 4,
     titolo: "Il titolo della lezione",
     sommario: "Una frase che spiega di cosa parla.",
     durata: "60 minuti",
     materiali: [
       { etichetta: "Slide", file: "slide.pdf", tipo: "pdf" },
       {
         etichetta: "Laboratorio",
         file: "laboratorio.ipynb",
         tipo: "notebook",
         colab: "https://colab.research.google.com/...", // facoltativo: aggiunge il pulsante Colab
       },
     ],
     interattiva: "interattiva.js", // facoltativo: vedi il punto 5
     quiz: {
       titolo: "Quiz della lezione 4",
       domande: [
         // vedi il punto 4
       ],
     },
   });
   ```

4. Aggiungere il nome della cartella in `contenuti/elenco.js`:

   ```js
   listLessons([
     "lezione-1",
     "lezione-4",
   ]);
   ```

5. Ricaricare la pagina iniziale e controllare che la lezione compaia.

Regole:

- `numero` deve essere diverso per ogni lezione: è il numero nell'indirizzo della pagina.
- `tipo` può essere solo `pdf` (per un file `.pdf`) o `notebook` (per un file `.ipynb`).
- In `file` va solo il nome del file, identico a quello vero, **maiuscole e minuscole
  comprese**. Su Windows il sito funziona anche se le maiuscole sono diverse, ma online no.
- Si possono elencare più PDF, per esempio le slide delle medie e quelle delle superiori.
  In quel caso ogni PDF si apre solo quando lo studente lo sceglie.
- I testi stanno fra virgolette `"..."`, e ogni voce finisce con una virgola. Un apostrofo
  dentro un testo va bene; le virgolette doppie invece vanno scritte `\"`.

Se una lezione ha un errore, il sito la salta e tiene online le altre. In cima alla pagina
iniziale compare un riquadro **"Avviso per chi gestisce il sito"** che dice quale file
correggere, per esempio:

```
contenuti/lezione-4/lezione.js, quiz, domanda 2: 'corretta' vale 'e', ma le opzioni sono: a, b, c
```

### Aggiornare un materiale

Per sostituire le slide o il notebook di una lezione, salvare il file nuovo al posto di
quello vecchio, con lo stesso nome, per esempio `contenuti/lezione-1/slide-medie.pdf`.
Per i documenti dei docenti vedere il punto 7.

Prima di pubblicare un notebook, conviene controllare che i risultati salvati nelle celle
non mostrino percorsi del proprio computer, come `C:\Users\...`. Il comando *Clear All
Outputs* di VS Code li toglie tutti.

## 4. Cambiare un quiz

Il quiz sta nel file `lezione.js` della lezione, alla voce `quiz`:

```js
quiz: {
  titolo: "Quiz della lezione 1",
  domande: [
    {
      id: "d1",
      testo: "Che cosa fa un'IA come ChatGPT quando scrive una frase?",
      opzioni: [
        { id: "a", testo: "Prevede la parola successiva, una alla volta" },
        { id: "b", testo: "Cerca la risposta su internet" },
      ],
      corretta: "a",
      spiegazione: "Il testo che lo studente legge dopo aver risposto.",
    },
  ],
},
```

Regole:

- Ogni domanda ha un `id` diverso. Dentro una domanda, ogni opzione ha un `id` diverso.
- Ogni domanda ha almeno due opzioni.
- `corretta` è l'`id` dell'opzione giusta.

Le risposte giuste stanno nel file della lezione, quindi chi apre il codice della pagina
può vederle. Per un quiz di autoverifica, senza voti, va bene così.

## 5. La versione interattiva delle slide

Una lezione può avere anche una versione interattiva delle slide: lo studente le ripercorre
da solo, un passo alla volta, e in ogni slide deve fare qualcosa. Sulla pagina della lezione
compare il pulsante **Apri la lezione interattiva**.

Per aggiungerla:

1. Creare nella cartella della lezione il file `interattiva.js`. Conviene partire da una copia
   di `contenuti/lezione-1/interattiva.js`.
2. In `lezione.js`, aggiungere `interattiva: "interattiva.js",` prima di `quiz`.

Il file elenca le slide, in ordine. Ogni slide ha un titolo e dei passi, che compaiono uno
alla volta quando lo studente preme **Continua**:

```js
registerInteractive({
  slide: [
    {
      titolo: "Proviamo noi",
      superiori: true, // facoltativo: la slide è segnata «Per le superiori», con il pulsante per saltarla
      passi: [
        {
          mostra: [{ tipo: "frase", testo: "Chi dorme non piglia ___" }],
          attivita: {
            tipo: "completa",
            attese: [{ parole: ["pesci"], risposta: "Proprio così!" }],
            altrimenti: "Quasi tutti dicono «pesci».",
          },
          poi: [{ tipo: "testo", testo: "Questo compare **dopo** la risposta." }],
        },
      ],
    },
  ],
});
```

Regole:

- Ogni slide ha almeno un'attività. **Avanti** si sblocca solo quando la slide è finita.
- `mostra` è quello che compare con il passo, `attivita` è quello che lo studente deve fare,
  `poi` compare dopo la risposta. Un passo può anche solo mostrare.
- Nei testi, `**parola**` diventa grassetto.

**Che cosa si può mostrare**, in `mostra` e in `poi`:

| `tipo` | Che cosa mostra | Campi |
|---|---|---|
| `testo` | un paragrafo | `testo` |
| `grande` | una frase grande, su sfondo arancione | `testo`; `stile: "scuro"` per lo sfondo blu |
| `scheda` | un riquadro con un titolo | `titolo`; facoltativi `etichetta`, `testo` e `dopo`, l'etichetta che prende dopo la risposta |
| `frase` | una frase con uno spazio vuoto, scritto `___` | `testo`. Dopo la risposta lo spazio si riempie |
| `barre` | un grafico a barre | `voci: [{ parola, percento }]`; facoltativo `evidenzia` (vedi sotto) |
| `pezzi` | una frase tagliata in pezzetti | `voci: [{ testo, numero }]`, con `numero` facoltativo. Se i pezzi hanno il numero, quando compaiono si vede prima la frase intera, poi i tagli, poi i numeri |
| `mappa` | parole sparse su una mappa | `parole: [{ parola, x, y, gruppo }]`, con `x` e `y` da 0 a 100 e `gruppo` 1, 2 o 3 per il colore; facoltativo `dopo`, parole che compaiono dopo la risposta |
| `spazio` | parole in uno spazio a tre dimensioni, che lo studente può girare | `parole: [{ parola, x, y, z, gruppo }]`, con `x`, `y` e `z` da 0 a 100 (`y` è l'altezza); facoltativi `dopo`, come nella `mappa`, e `vicine` e `lontane`, due parole ciascuno, unite da una linea tratteggiata |
| `flusso` | una catena di passaggi, dall'alto in basso | `voci: [{ etichetta, titolo, testo }]`; facoltativi `entra`, `nome` ed `esce` |
| `tabella` | una tabella | `colonne: [...]` e `righe: [[...], ...]`, con lo stesso numero di caselle. Va bene per pochi numeri o parole brevi: sul telefono una tabella con testi lunghi esce dallo schermo |
| `temperatura` | la manopola della temperatura, con le barre | `voci: [{ parola, punteggio }]` |
| `bilancia` | una manopola fra due o più numeri, per esempio sicurezza e comodità | `misure: [{ nome, su }]`, con `su` il valore più alto; `livelli: [{ nome, valori }]`, con un valore per ogni misura; facoltativo `etichetta` |
| `dialogo` | uno scambio di battute, una riga per chi parla | `righe: [{ chi, testo }]`; facoltativo `dopo`, righe che compaiono dopo la risposta |
| `nastro` | il testo che arriva al modello, diviso nei suoi pezzi | `voci: [{ etichetta, testo }]`, almeno due; con `unito: true` i pezzi stanno tutti attaccati, senza etichette |
| `documento` | un documento, anche con righe nascoste | `righe: [{ testo, nascosta }]`; facoltativi `etichetta` e `dopo`, l'etichetta che prende dopo la risposta. Una riga con `nascosta: true` è scritta in bianco su bianco: si vede solo selezionando il testo, e dopo la risposta diventa arancione |
| `disegno` | un disegno già pronto | `nome: "studente"`; facoltativo `didascalia` |

**Che cosa può fare lo studente**, in `attivita`:

| `tipo` | Che cosa fa | Campi |
|---|---|---|
| `scelta` | sceglie una risposta | `domanda` e `opzioni: [{ testo, risposta, giusta }]`. Se un'opzione ha `giusta: true`, la scelta viene corretta come in un quiz; se nessuna ce l'ha, è un sondaggio |
| `completa` | scrive una parola | `altrimenti`; facoltativi `domanda`, `attese: [{ parole, risposta }]` e `ricorda` |
| `parole` | tocca le parole di una frase che rispondono alla domanda | `testo`, `domanda`, `giuste: [...]` e `risposta`; facoltativo `parola`, la parola di cui si parla, che non si può toccare |
| `righe` | tocca le righe di un testo che rispondono alla domanda | `domanda`, `righe: [{ testo, giusta }]`, con almeno una `giusta: true`, e `risposta` |
| `dado` | tira un dado truccato | `domanda`, `voci: [{ parola, percento }]`, `lanci` (da 1 a 20) e `risposta` |
| `filtro` | scrive un messaggio, e un filtro lo controlla come nel laboratorio | `domanda`; `cerca: [...]`, le parole che il filtro blocca; `bloccato` e `passa`, il testo per ognuno dei due casi; facoltativo `compatto: true`, che prima toglie spazi, trattini e punti. Lo studente può riprovare, fino a 8 volte |
| `approva` | dice sì o no a una serie di richieste, una alla volta | `domanda`; `richieste: [{ titolo, testo, pericolosa }]`, con almeno una `pericolosa: true` e `titolo` facoltativo; `fermata` e `passata`, il testo se le ha bloccate tutte e quello se ne ha approvata una |

In `completa`, una risposta vale se contiene una delle `parole`. Maiuscole, punteggiatura e
articolo iniziale non contano: «Un bagno!» vale come «bagno». Se non ne contiene nessuna, lo
studente legge `altrimenti`. Con `ricorda: "mare"` il sito si ricorda la parola scritta, e più
avanti un blocco `barre` con `evidenzia: "mare"` segna la barra di quella parola.

Sul telefono la mappa mette ogni parola su una riga sua, in ordine di `y`, perché sullo schermo
stretto le parole si coprirebbero. Lo `spazio` invece cambia forma per riempire il riquadro,
largo sul monitor e alto sul telefono, e una parola che ne coprirebbe un'altra si sposta sopra
o accanto al suo puntino, o un po' più in là, unita al puntino da una linea sottile.

Una slide `superiori` ha in alto, accanto all'etichetta «Per le superiori», il pulsante
**Salta questa slide**.

Come per il quiz, le risposte restano solo nella scheda del browser: si vedono ancora se lo
studente ricarica la pagina, e spariscono quando chiude la scheda. Se il file ha un errore,
la pagina interattiva mostra l'**Avviso per chi gestisce il sito** con la slide e il passo da
correggere. La pagina della lezione e il quiz funzionano lo stesso.

## 6. I risultati del quiz

Il sito non salva le risposte da nessuna parte e non manda niente a nessuno. Il risultato
resta solo nella scheda del browser dove lo studente ha fatto il quiz, così si vede ancora
se ricarica la pagina. Quando la scheda si chiude, sparisce. Il pulsante **Rifai il quiz**
lo cancella subito.

Il risultato non resta nel browser dopo la chiusura della scheda di proposito: sui computer
del museo, lo studente dopo non deve trovare le risposte di quello prima.

## 7. La pagina per i docenti

I documenti per i docenti stanno in una cartella con un nome casuale, che inizia con
`docenti-`. Il suo indirizzo è quello del sito più il nome della cartella, per esempio:

```
https://<nome-utente>.github.io/<nome-repository>/docenti-.../
```

La pagina elenca i documenti di tutte le lezioni. Per aggiungerne uno:

1. copiare il file nella sottocartella della lezione, per esempio `docenti-.../lezione-2/`;
2. aggiungere il nome del file in `docenti-.../documenti.js`.

**Non è una protezione.** È solo un indirizzo che il sito non mostra da nessuna parte: chi
ha il link entra. Ai motori di ricerca la pagina chiede di non essere indicizzata. Quindi:

- non dare il link agli studenti;
- non aprirlo sui computer degli studenti, perché il browser lo ricorderebbe;
- non metterci niente che sarebbe un problema se finisse nelle mani sbagliate.

**Attenzione: con un repository pubblico, la pagina è pubblica.** Il nome della cartella si
vede aprendo il repository, e questo vale anche per GitHub Pages con il piano gratuito. Per
tenere l'indirizzo nascosto serve un repository privato e un servizio che pubblica da un
repository privato, come Vercel.

Per cambiare l'indirizzo basta rinominare la cartella, usando solo lettere, numeri, `-` e
`_`, e dare ai docenti il nuovo link.

## 8. I caratteri

Il sito usa gli stessi caratteri delle slide se i file sono nella cartella `static/fonts/`.
Senza, usa quelli del computer e funziona lo stesso. Il file `static/fonts/README.md` dice
quali file servono e dove trovarli.

## 9. Se qualcosa non va

| Cosa succede | Cosa fare |
|---|---|
| La pagina resta vuota | JavaScript è disattivato nel browser, oppure c'è un errore: premere `F12` e guardare la scheda *Console*. |
| In cima alla pagina iniziale c'è l'**Avviso per chi gestisce il sito** | Leggere la riga: dice quale file correggere e cosa non va. |
| La lezione interattiva mostra l'**Avviso per chi gestisce il sito** | Leggere la riga: dice quale slide e quale passo di `interattiva.js` correggere. |
| Sul computer funziona, online no | Controllare maiuscole e minuscole nei nomi dei file. Se la modifica è appena stata mandata, aspettare qualche minuto e premere `Ctrl+F5`. |
| Le modifiche non si vedono | Ricaricare con `Ctrl+F5`. |
| Sul telefono le slide non si vedono | Molti browser del telefono non mostrano i PDF dentro la pagina: usare il pulsante **Scarica**. |
| Il link dei docenti dice "Questa pagina non c'è" | Controllare che il nome della cartella nel link sia identico a quello vero. |
| `py` non viene riconosciuto | Usare `python` al posto di `py`, oppure aprire il sito con un doppio clic su `index.html`. |
