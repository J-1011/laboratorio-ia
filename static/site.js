/* The lessons site of Museo CTRL+Alt: plain JavaScript, no framework, no build step.

   Each page loads this file and then contenuti/elenco.js, which lists the lesson
   folders. Every folder holds a lezione.js that calls registerLesson(). Once they
   have all loaded, the page draws itself.

   These are classic scripts rather than modules, because modules do not load from
   file:// and the site must also open with a double click on index.html. */

"use strict";

// The site root, worked out from this script's own address. Scripts are loaded from
// it, so they are found from any page: at a domain root, inside a GitHub Pages
// project folder, or straight from disk.
const SITE_ROOT = new URL("../", document.currentScript.src);

// Material type -> required file extension.
const MATERIAL_EXTENSIONS = { pdf: ".pdf", notebook: ".ipynb" };

// sessionStorage, not localStorage: on a shared museum computer the next student
// must not find the previous student's answers, and closing the tab forgets them.
const STORAGE_PREFIX = "quiz-";

const content = {
  folders: null, // set by contenuti/elenco.js
  registered: new Map(), // folder -> what its lezione.js registered
  missing: new Set(), // folders whose lezione.js was not found
  scriptErrors: new Map(), // folder -> error raised while its lezione.js ran
  teacherDocuments: null, // set by documenti.js on the teacher page
  problems: [], // Italian messages for whoever edits the content
};

class ContentError extends Error {}

/* ---- Called by the content files ---- */

function listLessons(folders) {
  content.folders = folders;
}

function registerLesson(data) {
  const script = document.currentScript;
  if (!script) return;
  const folder = folderOfScript(script);
  if (content.registered.has(folder)) {
    content.problems.push(`${lessonFile(folder)}: registerLesson è chiamata due volte`);
    return;
  }
  content.registered.set(folder, data);
}

function registerTeacherDocuments(documents) {
  content.teacherDocuments = documents;
}

/* ---- Loading ---- */

function lessonFile(folder) {
  return `contenuti/${folder}/lezione.js`;
}

function folderOfScript(script) {
  const parts = new URL(script.src).pathname.split("/");
  return decodeURIComponent(parts[parts.length - 2]);
}

// A typo in one lezione.js stops that file only. Note where, for the message.
window.addEventListener("error", (event) => {
  const match = /\/contenuti\/([^/]+)\/lezione\.js$/.exec(event.filename || "");
  if (match) {
    content.scriptErrors.set(decodeURIComponent(match[1]), `riga ${event.lineno}: ${event.message}`);
  }
});

function checkFolderList() {
  if (!Array.isArray(content.folders)) {
    content.problems.push(
      "contenuti/elenco.js non è stato letto: manca, oppure contiene un errore di scrittura"
    );
    content.folders = [];
    return;
  }
  const seen = new Set();
  content.folders = content.folders.filter((folder) => {
    if (!isPlainName(folder)) {
      content.problems.push(`contenuti/elenco.js: '${folder}' non è il nome di una cartella`);
      return false;
    }
    if (seen.has(folder)) {
      content.problems.push(`contenuti/elenco.js: la cartella '${folder}' è elencata due volte`);
      return false;
    }
    seen.add(folder);
    return true;
  });
}

function loadLessonScripts() {
  return Promise.all(
    content.folders.map(
      (folder) =>
        new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = new URL(`contenuti/${encodeURIComponent(folder)}/lezione.js`, SITE_ROOT).href;
          script.onload = resolve;
          script.onerror = () => {
            content.missing.add(folder);
            content.problems.push(`${lessonFile(folder)}: file non trovato`);
            resolve();
          };
          document.head.append(script);
        })
    )
  );
}

// A lesson that breaks a rule is left out and reported; the others are still shown.
function buildLessons() {
  const byNumber = new Map();
  for (const folder of content.folders) {
    if (content.missing.has(folder)) continue;
    if (!content.registered.has(folder)) {
      const detail = content.scriptErrors.get(folder) || "dettagli nella console del browser, tasto F12";
      content.problems.push(
        `${lessonFile(folder)}: il file non è stato letto, probabilmente per un errore di scrittura (${detail})`
      );
      continue;
    }
    try {
      const lesson = validateLesson(folder, content.registered.get(folder));
      const other = byNumber.get(lesson.number);
      if (other) {
        throw new ContentError(
          `${lessonFile(folder)}: il numero ${lesson.number} è già usato da ${other.folder}`
        );
      }
      byNumber.set(lesson.number, lesson);
    } catch (error) {
      if (!(error instanceof ContentError)) console.error(error);
      content.problems.push(
        error instanceof ContentError ? error.message : `${lessonFile(folder)}: errore imprevisto (${error})`
      );
    }
  }
  for (const problem of content.problems) console.error(`Lezione saltata. ${problem}`);
  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

/* ---- Checking the content ---- */

function validateLesson(folder, raw) {
  const where = lessonFile(folder);
  const data = mapping(raw, where);
  if (!Number.isInteger(data.numero) || data.numero < 1) {
    throw new ContentError(`${where}: 'numero' deve essere un intero maggiore di zero`);
  }
  let interactiveFile = null;
  if (data.interattiva !== undefined) {
    interactiveFile = fileName(data, "interattiva", where);
    if (!interactiveFile.toLowerCase().endsWith(".js")) {
      throw new ContentError(`${where}: 'interattiva' deve essere un file .js, non '${interactiveFile}'`);
    }
  }
  return {
    number: data.numero,
    folder,
    title: text(data, "titolo", where),
    summary: text(data, "sommario", where),
    duration: text(data, "durata", where),
    materials: items(data, "materiali", where).map((entry, index) =>
      validateMaterial(entry, `${where}, materiale ${index + 1}`)
    ),
    quiz: validateQuiz(data.quiz, `${where}, quiz`),
    interactiveFile,
  };
}

function validateMaterial(raw, where) {
  const data = mapping(raw, where);
  const label = text(data, "etichetta", where);
  const file = fileName(data, "file", where);
  const kind = text(data, "tipo", where);
  if (!Object.prototype.hasOwnProperty.call(MATERIAL_EXTENSIONS, kind)) {
    const allowed = Object.keys(MATERIAL_EXTENSIONS).join(", ");
    throw new ContentError(`${where}: 'tipo' vale '${kind}', ma può essere solo: ${allowed}`);
  }
  const extension = MATERIAL_EXTENSIONS[kind];
  if (!file.toLowerCase().endsWith(extension)) {
    throw new ContentError(
      `${where}: un materiale di tipo '${kind}' deve essere un file ${extension}, non '${file}'`
    );
  }
  const colab = data.colab;
  if (colab !== undefined && !(typeof colab === "string" && colab.startsWith("https://"))) {
    throw new ContentError(`${where}: 'colab' deve essere un indirizzo https://`);
  }
  return { label, file, kind, colabUrl: colab || null };
}

function validateQuiz(raw, where) {
  const data = mapping(raw, where);
  const questions = items(data, "domande", where).map((entry, index) =>
    validateQuestion(entry, `${where}, domanda ${index + 1}`)
  );
  requireUnique(questions.map((question) => question.id), "domande", where);
  return { title: text(data, "titolo", where), questions };
}

function validateQuestion(raw, where) {
  const data = mapping(raw, where);
  const options = items(data, "opzioni", where, 2).map((entry, index) => {
    const option = mapping(entry, `${where}, opzione ${index + 1}`);
    return {
      id: text(option, "id", `${where}, opzione ${index + 1}`),
      text: text(option, "testo", `${where}, opzione ${index + 1}`),
    };
  });
  const optionIds = options.map((option) => option.id);
  requireUnique(optionIds, "opzioni", where);
  const correctId = text(data, "corretta", where);
  if (!optionIds.includes(correctId)) {
    throw new ContentError(
      `${where}: 'corretta' vale '${correctId}', ma le opzioni sono: ${optionIds.join(", ")}`
    );
  }
  return {
    id: text(data, "id", where),
    text: text(data, "testo", where),
    options,
    correctId,
    explanation: text(data, "spiegazione", where),
  };
}

function mapping(value, where) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ContentError(`${where}: manca, oppure non contiene i campi previsti`);
  }
  return value;
}

function items(data, key, where, minimum = 1) {
  const value = data[key];
  if (!Array.isArray(value) || value.length < minimum) {
    throw new ContentError(`${where}: '${key}' deve essere un elenco (voci richieste: almeno ${minimum})`);
  }
  return value;
}

function text(data, key, where) {
  const value = data[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new ContentError(`${where}: '${key}' manca o non è un testo`);
  }
  return value.trim();
}

function fileName(data, key, where) {
  const value = text(data, key, where);
  if (!isPlainName(value)) {
    throw new ContentError(`${where}: '${key}' deve essere solo il nome del file, senza cartelle`);
  }
  return value;
}

function isPlainName(value) {
  return typeof value === "string" && value.trim() !== "" && !/[\\/]/.test(value) && value !== "." && value !== "..";
}

function requireUnique(ids, what, where) {
  const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (repeated.length) {
    throw new ContentError(`${where}: ${what} con lo stesso id: ${repeated.join(", ")}`);
  }
}

/* ---- Building pages ---- */

// Builds an element. Text always goes in as text, never as HTML.
function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    if (value === true) node.setAttribute(name, "");
    else node.setAttribute(name, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

function setHero(...nodes) {
  document.getElementById("hero").replaceChildren(...nodes);
}

function clearMain() {
  const main = document.getElementById("content");
  main.replaceChildren();
  return main;
}

function showProblems(main) {
  if (!content.problems.length) return;
  main.append(
    el(
      "div",
      { class: "notice", role: "alert" },
      el("p", {}, el("strong", {}, "Avviso per chi gestisce il sito:"), " una parte dei contenuti non è stata caricata."),
      el("ul", {}, content.problems.map((problem) => el("li", {}, problem)))
    )
  );
}

function materialUrl(lesson, file) {
  return `contenuti/${encodeURIComponent(lesson.folder)}/${encodeURIComponent(file)}`;
}

function requestedLesson(lessons) {
  const value = new URLSearchParams(location.search).get("n") || "";
  if (!/^[1-9]\d*$/.test(value)) return null;
  return lessons.find((lesson) => lesson.number === Number(value)) || null;
}

function renderNotFound(heading) {
  document.title = "Pagina non trovata · Museo CTRL+Alt";
  setHero(
    el("h1", {}, heading),
    el("p", { class: "intro" }, "L'indirizzo è sbagliato, oppure la lezione che cerchi non è ancora sul sito.")
  );
  const main = clearMain();
  showProblems(main);
  main.append(el("p", { class: "actions" }, el("a", { class: "button", href: "index.html" }, "Torna alle lezioni")));
}

/* ---- Home page ---- */

function renderHome(lessons) {
  const main = clearMain();
  showProblems(main);
  if (!lessons.length) {
    main.append(
      el(
        "p",
        { class: "notice" },
        "Non c'è ancora nessuna lezione. Chi gestisce il sito deve aggiungere una cartella dentro ",
        el("code", {}, "contenuti/"),
        "."
      )
    );
    return;
  }
  main.append(
    el(
      "ul",
      { class: "lesson-list" },
      lessons.map((lesson) =>
        el(
          "li",
          { class: "card" },
          el("p", { class: "eyebrow" }, `Lezione ${lesson.number}`),
          el("h2", { class: "card__title" }, el("a", { href: `lezione.html?n=${lesson.number}` }, lesson.title)),
          el("p", {}, lesson.summary),
          el("p", { class: "duration" }, lesson.duration)
        )
      )
    )
  );
}

/* ---- Lesson page ---- */

function renderLesson(lessons) {
  const lesson = requestedLesson(lessons);
  if (!lesson) return renderNotFound("Questa lezione non c'è");

  document.title = `Lezione ${lesson.number} · Museo CTRL+Alt`;
  setHero(
    el("p", { class: "breadcrumb" }, el("a", { href: "index.html" }, "← Tutte le lezioni")),
    el("p", { class: "eyebrow" }, `Lezione ${lesson.number} · ${lesson.duration}`),
    el("h1", {}, lesson.title),
    el("p", { class: "intro" }, lesson.summary)
  );

  const main = clearMain();
  main.append(el("h2", {}, "Materiali"));
  const severalPdfs = lesson.materials.filter((material) => material.kind === "pdf").length > 1;

  for (const material of lesson.materials) {
    const url = materialUrl(lesson, material.file);
    const section = el("section", { class: "material" }, el("h3", { class: "material__title" }, material.label));

    if (material.kind === "pdf") {
      // The browser's own PDF viewer. navpanes=0 asks Chrome and Edge to keep their
      // thumbnail panel closed, so the slide gets the full width.
      const viewerUrl = `${url}#navpanes=0`;
      const frame = el("iframe", { class: "material__preview", title: material.label });
      const viewer = el(
        "details",
        { class: "material__viewer", open: !severalPdfs },
        el("summary", {}, "Guarda qui"),
        frame,
        el("p", { class: "material__phone-note" }, "Se qui non vedi niente, usa il pulsante Scarica.")
      );
      if (severalPdfs) {
        // A closed deck has no src yet: opening it is what starts the download.
        viewer.addEventListener("toggle", () => frame.setAttribute("src", viewerUrl), { once: true });
      } else {
        frame.setAttribute("src", viewerUrl);
      }
      section.append(viewer);
    }

    section.append(
      el(
        "p",
        { class: "actions" },
        el("a", { class: "button", href: url, download: true }, "Scarica"),
        material.colabUrl && el("a", { class: "button button--secondary", href: material.colabUrl }, "Apri in Colab")
      )
    );
    main.append(section);
  }

  if (lesson.interactiveFile) {
    main.append(
      el("h2", {}, "Lezione interattiva"),
      el("p", {}, "Ripercorri le slide da solo, un passo alla volta: in ogni slide c'è qualcosa da fare."),
      el(
        "p",
        { class: "actions" },
        el("a", { class: "button", href: `interattiva.html?n=${lesson.number}` }, "Apri la lezione interattiva")
      )
    );
  }

  main.append(
    el("h2", {}, "Quiz"),
    el("p", {}, "Alla fine della lezione, metti alla prova quello che hai imparato."),
    el("p", { class: "actions" }, el("a", { class: "button", href: `quiz.html?n=${lesson.number}` }, lesson.quiz.title))
  );
}

/* ---- Quiz page ---- */

function renderQuiz(lessons) {
  const lesson = requestedLesson(lessons);
  if (!lesson) return renderNotFound("Questo quiz non c'è");
  document.title = `${lesson.quiz.title} · Museo CTRL+Alt`;
  const saved = savedAnswers(lesson);
  if (saved) showResult(lesson, saved);
  else showForm(lesson, {}, false);
}

function showForm(lesson, answers, unfinished) {
  setHero(
    el("p", { class: "breadcrumb" }, el("a", { href: `lezione.html?n=${lesson.number}` }, "← Torna alla lezione")),
    el("h1", {}, lesson.quiz.title),
    el("p", { class: "intro" }, "Scegli una risposta per ogni domanda.")
  );

  const main = clearMain();
  const notice = unfinished
    ? el("p", { class: "notice", role: "alert", tabindex: "-1" }, "Mancano ancora delle risposte. Completa le domande segnate qui sotto.")
    : null;
  if (notice) main.append(notice);

  // No "required" on the radios: the browser's own message would follow the
  // browser's language, which can be English.
  const form = el(
    "form",
    {},
    lesson.quiz.questions.map((question, index) => {
      const missing = unfinished && !(question.id in answers);
      return el(
        "fieldset",
        { class: missing ? "question question--missing" : "question" },
        el("legend", { class: "question__text" }, `${index + 1}. ${question.text}`),
        missing && el("p", { class: "question__warning" }, "Manca la risposta a questa domanda."),
        question.options.map((option) =>
          el(
            "label",
            { class: "option" },
            el("input", { type: "radio", name: question.id, value: option.id, checked: answers[question.id] === option.id }),
            el("span", {}, option.text)
          )
        )
      );
    }),
    el("button", { class: "button", type: "submit" }, "Controlla le risposte")
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const chosen = readAnswers(lesson, form);
    if (Object.keys(chosen).length < lesson.quiz.questions.length) {
      showForm(lesson, chosen, true);
      return;
    }
    saveAnswers(lesson, chosen);
    showResult(lesson, chosen);
  });

  main.append(form);
  if (notice) {
    notice.focus();
    notice.scrollIntoView({ block: "center" });
  }
}

function readAnswers(lesson, form) {
  const data = new FormData(form);
  const answers = {};
  for (const question of lesson.quiz.questions) {
    const chosen = data.get(question.id);
    if (question.options.some((option) => option.id === chosen)) answers[question.id] = chosen;
  }
  return answers;
}

function showResult(lesson, answers) {
  const questions = lesson.quiz.questions;
  const score = questions.filter((question) => answers[question.id] === question.correctId).length;
  const heading = el("h1", { tabindex: "-1" }, "Il tuo risultato");
  setHero(
    el("p", { class: "eyebrow" }, lesson.quiz.title),
    heading,
    el("p", { class: "score" }, `Risposte giuste: ${score} su ${questions.length}`)
  );

  const main = clearMain();
  questions.forEach((question, index) => {
    const right = answers[question.id] === question.correctId;
    main.append(
      el(
        "section",
        { class: right ? "outcome" : "outcome outcome--wrong" },
        el("p", { class: "outcome__status" }, right ? "Giusto" : "Sbagliato"),
        el("h2", { class: "outcome__question" }, `${index + 1}. ${question.text}`),
        el("p", {}, el("strong", {}, "La tua risposta:"), " ", optionText(question, answers[question.id])),
        !right && el("p", {}, el("strong", {}, "La risposta giusta:"), " ", optionText(question, question.correctId)),
        el("p", { class: "outcome__explanation" }, question.explanation)
      )
    );
  });

  const retry = el("button", { class: "button button--secondary", type: "button" }, "Rifai il quiz");
  retry.addEventListener("click", () => {
    forgetAnswers(lesson);
    showForm(lesson, {}, false);
    window.scrollTo(0, 0);
  });
  main.append(
    el(
      "p",
      { class: "actions" },
      el("a", { class: "button", href: `lezione.html?n=${lesson.number}` }, "Torna alla lezione"),
      retry,
      el("a", { class: "button button--secondary", href: "index.html" }, "Tutte le lezioni")
    )
  );
  window.scrollTo(0, 0);
  heading.focus({ preventScroll: true });
}

function optionText(question, optionId) {
  return question.options.find((option) => option.id === optionId).text;
}

// Storage can be switched off or full; the quiz then works without remembering.
function saveAnswers(lesson, answers) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + lesson.number, JSON.stringify(answers));
  } catch (error) {
    console.warn("Risultato non salvato nella scheda:", error);
  }
}

function forgetAnswers(lesson) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + lesson.number);
  } catch (error) {
    console.warn(error);
  }
}

// Saved answers count only while they still fit the quiz as it is now.
function savedAnswers(lesson) {
  try {
    const answers = JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + lesson.number));
    const complete =
      answers !== null &&
      typeof answers === "object" &&
      lesson.quiz.questions.every((question) => question.options.some((option) => option.id === answers[question.id]));
    return complete ? answers : null;
  } catch (error) {
    return null;
  }
}

/* ---- Teacher page ---- */

function renderTeacher(lessons) {
  const documents = content.teacherDocuments;
  const lists = new Map();
  if (documents === null || typeof documents !== "object" || Array.isArray(documents)) {
    content.problems.push("documenti.js non è stato letto: manca, oppure contiene un errore di scrittura");
  } else {
    const folders = new Set(lessons.map((lesson) => lesson.folder));
    for (const [folder, files] of Object.entries(documents)) {
      if (!folders.has(folder)) {
        content.problems.push(`documenti.js: '${folder}' non è la cartella di nessuna lezione caricata`);
      } else if (!Array.isArray(files) || !files.every(isPlainName)) {
        content.problems.push(`documenti.js: per '${folder}' serve un elenco di nomi di file, senza cartelle`);
      } else {
        lists.set(folder, files);
      }
    }
  }

  const main = clearMain();
  showProblems(main);
  main.append(
    el(
      "p",
      { class: "notice" },
      "Questa pagina non ha una password: è solo un indirizzo che il sito non mostra da nessuna parte. " +
        "Chiunque abbia il link può aprirla, quindi non darlo agli studenti e non aprirlo sui loro computer, " +
        "perché il browser lo ricorderebbe."
    )
  );

  for (const lesson of lessons) {
    main.append(el("h2", {}, `Lezione ${lesson.number}: ${lesson.title}`));
    const files = lists.get(lesson.folder) || [];
    if (!files.length) {
      main.append(el("p", {}, "Per questa lezione non ci sono documenti."));
    }
    for (const file of files) {
      main.append(
        el(
          "section",
          { class: "material" },
          el("h3", { class: "material__title" }, file),
          el(
            "p",
            { class: "actions" },
            el(
              "a",
              { class: "button", href: `${encodeURIComponent(lesson.folder)}/${encodeURIComponent(file)}`, download: true },
              "Scarica"
            )
          )
        )
      );
    }
  }
}

/* ---- Start ---- */

const PAGES = { home: renderHome, lesson: renderLesson, quiz: renderQuiz, teacher: renderTeacher };

document.addEventListener("DOMContentLoaded", async () => {
  checkFolderList();
  await loadLessonScripts();
  const lessons = buildLessons();
  const render = PAGES[document.body.dataset.page];
  if (render) render(lessons);
});
