/* The interactive version of a lesson's slides.

   A lesson names its interactive file in lezione.js ("interattiva"). That file
   calls registerInteractive() with the slides. Each slide is a list of steps that
   appear one at a time, and each slide asks the student to do something before
   "Avanti" unlocks. As with the quiz, nothing is sent anywhere: progress is kept
   only in this tab's sessionStorage, so a reload does not lose it. */

"use strict";

const BLOCK_KINDS = [
  "testo",
  "grande",
  "scheda",
  "frase",
  "barre",
  "pezzi",
  "mappa",
  "spazio",
  "flusso",
  "tabella",
  "temperatura",
  "bilancia",
  "dialogo",
  "nastro",
  "documento",
  "disegno",
];
const ACTIVITY_KINDS = ["scelta", "completa", "parole", "righe", "dado", "filtro", "approva"];
const DRAWINGS = ["studente"];
const BLANK = /_{3,}/;
const PROGRESS_PREFIX = "interattiva-";
const FILTER_TRIES = 8;
const MESSAGE_LENGTH = 120;
const SVG_NS = "http://www.w3.org/2000/svg";

// How the word space is seen: turned this many degrees at first, from a little above,
// and with this much perspective (a smaller distance means a stronger one).
const SPACE_ANGLE = -20;
const SPACE_TILT = 0.38;
const SPACE_DISTANCE = 600;

const interactive = { registered: undefined, scriptError: null };
let controlCount = 0;

/* ---- Called by the content file ---- */

function registerInteractive(data) {
  interactive.registered = data;
}

// A typo in the interactive file stops that file only. Note where, for the message.
window.addEventListener("error", (event) => {
  const file = event.filename || "";
  if (/\/contenuti\/[^/]+\/[^/]+\.js$/.test(file) && !/\/lezione\.js$/.test(file)) {
    interactive.scriptError = `riga ${event.lineno}: ${event.message}`;
  }
});

function loadInteractiveScript(lesson) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = new URL(
      `contenuti/${encodeURIComponent(lesson.folder)}/${encodeURIComponent(lesson.interactiveFile)}`,
      SITE_ROOT
    ).href;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
  });
}

/* ---- Checking the content ---- */

function optionalList(data, key, where) {
  return data[key] === undefined ? [] : items(data, key, where);
}

function optionalText(data, key, where) {
  return data[key] === undefined ? null : text(data, key, where);
}

// A list of entries, each an object checked by check(entry, where).
function listOf(data, key, name, where, check, minimum = 1) {
  return items(data, key, where, minimum).map((entry, index) => {
    const at = `${where}, ${name} ${index + 1}`;
    return check(mapping(entry, at), at);
  });
}

function share(data, where) {
  if (typeof data.percento !== "number" || !(data.percento > 0 && data.percento <= 100)) {
    throw new ContentError(`${where}: 'percento' deve essere un numero più grande di 0 e al massimo 100`);
  }
  return data.percento;
}

function flag(data, key, where) {
  if (data[key] !== undefined && typeof data[key] !== "boolean") {
    throw new ContentError(`${where}: '${key}' può essere solo true o false`);
  }
  return data[key] === true;
}

function wholeNumber(data, key, where, lowest, highest) {
  const value = data[key];
  if (!Number.isInteger(value) || value < lowest || value > highest) {
    throw new ContentError(`${where}: '${key}' deve essere un numero intero da ${lowest} a ${highest}`);
  }
  return value;
}

function mapWord(data, where, keys = ["x", "y"]) {
  const word = { word: text(data, "parola", where) };
  for (const key of keys) {
    if (typeof data[key] !== "number" || !(data[key] >= 0 && data[key] <= 100)) {
      throw new ContentError(`${where}: '${key}' deve essere un numero da 0 a 100`);
    }
    word[key] = data[key];
  }
  if (data.gruppo !== undefined && ![1, 2, 3].includes(data.gruppo)) {
    throw new ContentError(`${where}: 'gruppo' può valere solo 1, 2 o 3`);
  }
  word.group = data.gruppo || 0;
  return word;
}

function spaceWord(data, where) {
  return mapWord(data, where, ["x", "y", "z"]);
}

function cell(value, where) {
  if (typeof value === "number" && Number.isFinite(value)) return formatShare(value);
  if (typeof value !== "string" || !value.trim()) {
    throw new ContentError(`${where}: ogni casella deve contenere un testo o un numero`);
  }
  return value.trim();
}

// "Marco ha mangiato una pesca matura." gives one unit per word, with its punctuation
// kept beside it. Every word can be picked except the one the question is about.
function sentenceUnits(sentence, target) {
  return sentence.split(/\s+/).map((chunk) => {
    const [, lead, core, trail] = chunk.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
    const normal = normalizeAnswer(core);
    return { lead, core, trail, normal, pickable: normal !== "" && normal !== target };
  });
}

function validateInteractive(raw, where) {
  const data = mapping(raw, where);
  return items(data, "slide", where).map((entry, index) => validateSlide(entry, `${where}, slide ${index + 1}`));
}

function validateSlide(raw, where) {
  const data = mapping(raw, where);
  const forSuperiori = flag(data, "superiori", where);
  const steps = items(data, "passi", where).map((entry, index) => validateStep(entry, `${where}, passo ${index + 1}`));
  if (!steps.some((step) => step.activity)) {
    throw new ContentError(`${where}: ogni slide deve chiedere allo studente di fare qualcosa, quindi serve almeno un'attività`);
  }
  return { title: text(data, "titolo", where), forSuperiori, steps };
}

function validateStep(raw, where) {
  const data = mapping(raw, where);
  const show = optionalList(data, "mostra", where).map((entry, index) =>
    validateBlock(entry, `${where}, mostra ${index + 1}`)
  );
  const activity = data.attivita === undefined ? null : validateActivity(data.attivita, `${where}, attivita`);
  const after = optionalList(data, "poi", where).map((entry, index) => validateBlock(entry, `${where}, poi ${index + 1}`));
  if (!show.length && !activity) {
    throw new ContentError(`${where}: un passo deve mostrare qualcosa ('mostra') o chiedere qualcosa ('attivita')`);
  }
  if (after.length && !activity) {
    throw new ContentError(`${where}: 'poi' si usa solo in un passo con un'attività`);
  }
  return { show, activity, after };
}

function validateBlock(raw, where) {
  const data = mapping(raw, where);
  const kind = text(data, "tipo", where);
  if (data.stile !== undefined && !(kind === "grande" && data.stile === "scuro")) {
    throw new ContentError(`${where}: 'stile' può valere solo "scuro", e solo in un blocco "grande"`);
  }
  if (kind === "testo" || kind === "grande") {
    return { kind, text: text(data, "testo", where), dark: data.stile === "scuro" };
  }
  if (kind === "frase") {
    const sentence = text(data, "testo", where);
    if (!BLANK.test(sentence)) {
      throw new ContentError(`${where}: una 'frase' deve contenere lo spazio da completare, scritto ___`);
    }
    return { kind, text: sentence };
  }
  if (kind === "scheda") {
    return {
      kind,
      label: optionalText(data, "etichetta", where),
      labelAfter: optionalText(data, "dopo", where),
      title: text(data, "titolo", where),
      text: optionalText(data, "testo", where),
    };
  }
  if (kind === "barre") {
    const entries = listOf(data, "voci", "voce", where, (item, at) => ({ word: text(item, "parola", at), share: share(item, at) }));
    return { kind, entries, highlight: optionalText(data, "evidenzia", where) };
  }
  if (kind === "pezzi") {
    const pieces = listOf(data, "voci", "voce", where, (item, at) => {
      if (item.numero !== undefined && !(Number.isInteger(item.numero) && item.numero >= 0)) {
        throw new ContentError(`${at}: 'numero' deve essere un numero intero, senza virgola`);
      }
      return { text: text(item, "testo", at), number: item.numero === undefined ? null : item.numero };
    });
    return { kind, pieces };
  }
  if (kind === "mappa") {
    const later = data.dopo === undefined ? [] : listOf(data, "dopo", "parola dopo", where, mapWord);
    return { kind, words: listOf(data, "parole", "parola", where, mapWord), later };
  }
  if (kind === "spazio") {
    const words = listOf(data, "parole", "parola", where, spaceWord);
    const later = data.dopo === undefined ? [] : listOf(data, "dopo", "parola dopo", where, spaceWord);
    const pair = (key) => {
      if (data[key] === undefined) return null;
      const names = data[key];
      if (!Array.isArray(names) || names.length !== 2 || !names.every((name) => words.some((word) => word.word === name))) {
        throw new ContentError(`${where}: '${key}' deve elencare due parole che sono in 'parole'`);
      }
      return names.map((name) => words.find((word) => word.word === name));
    };
    return { kind, words, later, near: pair("vicine"), far: pair("lontane") };
  }
  if (kind === "bilancia") {
    const measures = listOf(data, "misure", "misura", where, (item, at) => ({
      name: text(item, "nome", at),
      out: wholeNumber(item, "su", at, 1, 1000),
    }));
    if (measures.length > 4) throw new ContentError(`${where}: 'misure' può avere al massimo 4 voci`);
    const levels = listOf(
      data,
      "livelli",
      "livello",
      where,
      (item, at) => {
        const values = item.valori;
        if (!Array.isArray(values) || values.length !== measures.length) {
          throw new ContentError(`${at}: 'valori' deve avere ${measures.length} numeri, uno per ogni misura`);
        }
        values.forEach((value, index) => {
          if (!Number.isInteger(value) || value < 0 || value > measures[index].out) {
            throw new ContentError(`${at}: il valore ${index + 1} di 'valori' deve essere un numero intero da 0 a ${measures[index].out}`);
          }
        });
        return { name: text(item, "nome", at), values };
      },
      2
    );
    return { kind, label: optionalText(data, "etichetta", where), measures, levels };
  }
  if (kind === "dialogo") {
    const line = (item, at) => ({ who: text(item, "chi", at), text: text(item, "testo", at) });
    const later = data.dopo === undefined ? [] : listOf(data, "dopo", "riga dopo", where, line);
    return { kind, lines: listOf(data, "righe", "riga", where, line), later };
  }
  if (kind === "nastro") {
    const parts = listOf(data, "voci", "voce", where, (item, at) => ({ label: text(item, "etichetta", at), text: text(item, "testo", at) }), 2);
    return { kind, parts, merged: flag(data, "unito", where) };
  }
  if (kind === "documento") {
    const lines = listOf(data, "righe", "riga", where, (item, at) => ({ text: text(item, "testo", at), hidden: flag(item, "nascosta", at) }));
    return { kind, label: optionalText(data, "etichetta", where), labelAfter: optionalText(data, "dopo", where), lines };
  }
  if (kind === "flusso") {
    const stages = listOf(data, "voci", "voce", where, (item, at) => ({
      label: optionalText(item, "etichetta", at),
      title: text(item, "titolo", at),
      text: optionalText(item, "testo", at),
    }));
    return {
      kind,
      input: optionalText(data, "entra", where),
      name: optionalText(data, "nome", where),
      stages,
      output: optionalText(data, "esce", where),
    };
  }
  if (kind === "tabella") {
    const columns = items(data, "colonne", where).map((value, index) => cell(value, `${where}, colonna ${index + 1}`));
    const rows = items(data, "righe", where).map((row, index) => {
      const at = `${where}, riga ${index + 1}`;
      if (!Array.isArray(row) || row.length !== columns.length) {
        throw new ContentError(`${at}: ogni riga deve avere ${columns.length} caselle, come 'colonne'`);
      }
      return row.map((value, column) => cell(value, `${at}, casella ${column + 1}`));
    });
    return { kind, columns, rows };
  }
  if (kind === "temperatura") {
    const entries = listOf(
      data,
      "voci",
      "voce",
      where,
      (item, at) => {
        if (typeof item.punteggio !== "number" || !Number.isFinite(item.punteggio)) {
          throw new ContentError(`${at}: 'punteggio' deve essere un numero`);
        }
        return { word: text(item, "parola", at), score: item.punteggio };
      },
      2
    );
    return { kind, entries };
  }
  if (kind === "disegno") {
    const name = text(data, "nome", where);
    if (!DRAWINGS.includes(name)) {
      throw new ContentError(`${where}: il disegno '${name}' non esiste. Disegni disponibili: ${DRAWINGS.join(", ")}`);
    }
    return { kind, name, caption: optionalText(data, "didascalia", where) };
  }
  throw new ContentError(`${where}: 'tipo' vale '${kind}', ma può essere solo: ${BLOCK_KINDS.join(", ")}`);
}

function validateActivity(raw, where) {
  const data = mapping(raw, where);
  const kind = text(data, "tipo", where);
  if (kind === "scelta") {
    const options = items(data, "opzioni", where, 2).map((entry, index) => {
      const at = `${where}, opzione ${index + 1}`;
      const option = mapping(entry, at);
      if (option.giusta !== undefined && typeof option.giusta !== "boolean") {
        throw new ContentError(`${at}: 'giusta' può essere solo true o false`);
      }
      return { text: text(option, "testo", at), reply: text(option, "risposta", at), right: option.giusta === true };
    });
    return { kind, question: text(data, "domanda", where), options, graded: options.some((option) => option.right) };
  }
  if (kind === "completa") {
    const expected = optionalList(data, "attese", where).map((entry, index) => {
      const at = `${where}, attesa ${index + 1}`;
      const item = mapping(entry, at);
      const words = items(item, "parole", at).map((word) => {
        if (typeof word !== "string" || !normalizeAnswer(word)) {
          throw new ContentError(`${at}: ogni voce di 'parole' deve essere un testo`);
        }
        return normalizeAnswer(word);
      });
      return { words, reply: text(item, "risposta", at) };
    });
    return {
      kind,
      question: optionalText(data, "domanda", where),
      expected,
      otherwise: text(data, "altrimenti", where),
      remember: optionalText(data, "ricorda", where),
    };
  }
  if (kind === "parole") {
    const target = data.parola === undefined ? null : normalizeAnswer(text(data, "parola", where));
    const units = sentenceUnits(text(data, "testo", where), target);
    if (target !== null && !units.some((unit) => unit.normal === target)) {
      throw new ContentError(`${where}: 'parola' («${data.parola}») non è nella frase`);
    }
    const right = items(data, "giuste", where).map((word) => {
      const normal = typeof word === "string" ? normalizeAnswer(word) : "";
      if (!units.some((unit) => unit.pickable && unit.normal === normal)) {
        throw new ContentError(`${where}: ogni voce di 'giuste' deve essere una parola della frase, diversa da 'parola'`);
      }
      return normal;
    });
    return { kind, question: text(data, "domanda", where), units, right, reply: text(data, "risposta", where) };
  }
  if (kind === "righe") {
    const lines = listOf(data, "righe", "riga", where, (item, at) => ({ text: text(item, "testo", at), right: flag(item, "giusta", at) }), 2);
    if (!lines.some((line) => line.right)) {
      throw new ContentError(`${where}: almeno una riga deve avere 'giusta: true'`);
    }
    return { kind, question: text(data, "domanda", where), lines, reply: text(data, "risposta", where) };
  }
  if (kind === "dado") {
    const faces = listOf(data, "voci", "voce", where, (item, at) => ({ word: text(item, "parola", at), share: share(item, at) }), 2);
    const throws = wholeNumber(data, "lanci", where, 1, 20);
    return { kind, question: text(data, "domanda", where), faces, throws, reply: text(data, "risposta", where) };
  }
  if (kind === "filtro") {
    const words = items(data, "cerca", where).map((word) => {
      if (typeof word !== "string" || !word.trim()) {
        throw new ContentError(`${where}: ogni voce di 'cerca' deve essere un testo`);
      }
      return word.trim();
    });
    return {
      kind,
      question: text(data, "domanda", where),
      words,
      compact: flag(data, "compatto", where),
      blocked: text(data, "bloccato", where),
      passed: text(data, "passa", where),
    };
  }
  if (kind === "approva") {
    const requests = listOf(
      data,
      "richieste",
      "richiesta",
      where,
      (item, at) => ({ title: optionalText(item, "titolo", at), text: text(item, "testo", at), risky: flag(item, "pericolosa", at) }),
      2
    );
    if (!requests.some((request) => request.risky)) {
      throw new ContentError(`${where}: almeno una richiesta deve avere 'pericolosa: true'`);
    }
    return {
      kind,
      question: text(data, "domanda", where),
      requests,
      stopped: text(data, "fermata", where),
      missed: text(data, "passata", where),
    };
  }
  throw new ContentError(`${where}: 'tipo' vale '${kind}', ma può essere solo: ${ACTIVITY_KINDS.join(", ")}`);
}

// "Un bagno!" and "bagno" are the same answer.
function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:il|lo|la|i|gli|le|un|uno|una) /, "")
    .replace(/^(?:l|un)'/, "");
}

// "un bagno caldo" contains the word "bagno"; "bagnino" does not.
function containsWord(answer, word) {
  return ` ${normalizeAnswer(answer)} `.includes(` ${normalizeAnswer(word)} `);
}

// The same checks as the filters in the lessons' notebooks: a plain search for each
// word, so "ignorare" contains "ignora"; with 'compatto', spaces and punctuation are
// taken out first, so "G-I-O-C-O-N-D-A" contains "gioconda". Gives the word found.
function filterCatch(activity, message) {
  const squeeze = (value) => (activity.compact ? value.replace(/[\s\-_.*,:;/\\|]/g, "") : value).toLowerCase();
  return activity.words.find((word) => squeeze(message).includes(squeeze(word))) || null;
}

/* ---- Progress ---- */

function freshProgress(slides) {
  return { slide: 0, slides: slides.map(() => ({ revealed: 1, results: [], skipped: false })), memory: {} };
}

function saveProgress(lesson, progress) {
  try {
    sessionStorage.setItem(PROGRESS_PREFIX + lesson.number, JSON.stringify(progress));
  } catch (error) {
    console.warn("Avanzamento non salvato nella scheda:", error);
  }
}

function forgetProgress(lesson) {
  try {
    sessionStorage.removeItem(PROGRESS_PREFIX + lesson.number);
  } catch (error) {
    console.warn(error);
  }
}

// Saved progress counts only while it still fits the slides as they are now.
function savedProgress(lesson, slides) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PROGRESS_PREFIX + lesson.number));
    const fits =
      saved !== null &&
      typeof saved === "object" &&
      Number.isInteger(saved.slide) &&
      saved.slide >= 0 &&
      saved.slide <= slides.length &&
      Array.isArray(saved.slides) &&
      saved.slides.length === slides.length &&
      saved.slides.every((entry, index) => entryFits(entry, slides[index])) &&
      saved.memory !== null &&
      typeof saved.memory === "object" &&
      Object.values(saved.memory).every((value) => typeof value === "string");
    return fits ? saved : null;
  } catch (error) {
    return null;
  }
}

function entryFits(entry, slide) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    Number.isInteger(entry.revealed) &&
    entry.revealed >= 1 &&
    entry.revealed <= slide.steps.length &&
    typeof entry.skipped === "boolean" &&
    Array.isArray(entry.results) &&
    entry.results.length <= slide.steps.length &&
    entry.results.every((result, index) => result === null || resultFits(result, slide.steps[index])) &&
    slide.steps
      .slice(0, entry.revealed - 1)
      .every((step, index) => !step.activity || resultComplete(step.activity, entry.results[index]))
  );
}

function resultFits(result, step) {
  const activity = step.activity;
  if (!activity || result === null || typeof result !== "object") return false;
  if (activity.kind === "scelta") {
    return Number.isInteger(result.choice) && result.choice >= 0 && result.choice < activity.options.length;
  }
  if (activity.kind === "completa") return typeof result.typed === "string" && normalizeAnswer(result.typed) !== "";
  if (activity.kind === "parole" || activity.kind === "righe") {
    const pickable = (unit) =>
      activity.kind === "parole" ? unit < activity.units.length && activity.units[unit].pickable : unit < activity.lines.length;
    return (
      Array.isArray(result.picked) &&
      result.picked.length > 0 &&
      new Set(result.picked).size === result.picked.length &&
      result.picked.every((unit) => Number.isInteger(unit) && unit >= 0 && pickable(unit))
    );
  }
  if (activity.kind === "filtro") {
    return (
      Array.isArray(result.tries) &&
      result.tries.length > 0 &&
      result.tries.length <= FILTER_TRIES &&
      result.tries.every((message) => typeof message === "string" && message.trim() !== "" && message.length <= MESSAGE_LENGTH)
    );
  }
  if (activity.kind === "approva") {
    return (
      Array.isArray(result.said) &&
      result.said.length > 0 &&
      result.said.length <= activity.requests.length &&
      result.said.every((value) => typeof value === "boolean")
    );
  }
  return (
    Array.isArray(result.rolls) &&
    result.rolls.length > 0 &&
    result.rolls.length <= activity.throws &&
    result.rolls.every((face) => Number.isInteger(face) && face >= 0 && face < activity.faces.length)
  );
}

// A die counts as done only after its last throw, and a list of requests once each one
// has its answer. Any other activity is done once answered.
function resultComplete(activity, result) {
  if (!result) return false;
  if (activity.kind === "dado") return result.rolls.length === activity.throws;
  if (activity.kind === "approva") return result.said.length === activity.requests.length;
  return true;
}

function stepDone(slide, entry, index) {
  if (index < entry.revealed - 1) return true;
  if (index > entry.revealed - 1) return false;
  const step = slide.steps[index];
  return !step.activity || resultComplete(step.activity, entry.results[index]);
}

function slideComplete(slide, entry) {
  return entry.skipped || (entry.revealed === slide.steps.length && stepDone(slide, entry, slide.steps.length - 1));
}

/* ---- Drawing ---- */

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// "**word**" in the content becomes bold. Everything else stays plain text.
function richText(value) {
  return value.split(/\*\*(.+?)\*\*/).map((part, index) => (index % 2 ? el("strong", {}, part) : part));
}

function formatShare(share) {
  return String(share).replace(".", ",");
}

function formatPercent(value) {
  if (value >= 1) return `${Math.round(value)}%`;
  if (value >= 0.1) return `${value.toFixed(1).replace(".", ",")}%`;
  return "<0,1%";
}

function blankFill(step, result) {
  if (!result || !step.activity) return null;
  if (step.activity.kind === "completa") return result.typed;
  if (step.activity.kind === "scelta" && step.activity.graded) return step.activity.options.find((option) => option.right).text;
  return null;
}

// "ho fatto un ___" filled with "un tuffo" reads "ho fatto un tuffo", not "un un tuffo".
function fitBlank(before, fill) {
  if (!/(?:^|\s)(?:il|lo|la|i|gli|le|un|uno|una|l['’]|un['’])\s*$/i.test(before)) return fill;
  return fill.replace(/^(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|(?:l|un)['’])/i, "") || fill;
}

function drawBlock(view, block, done, fill, animate) {
  if (block.kind === "testo") return el("p", { class: "slide__text" }, richText(block.text));
  if (block.kind === "grande") {
    return el("p", { class: block.dark ? "slide__big slide__big--dark" : "slide__big" }, richText(block.text));
  }
  if (block.kind === "scheda") {
    const after = done && block.labelAfter;
    const label = after ? block.labelAfter : block.label;
    return el(
      "div",
      { class: "slide-card" },
      label && el("p", { class: after ? "slide-card__label slide-card__label--after" : "slide-card__label" }, label),
      el("p", { class: "slide-card__title" }, block.title),
      block.text && el("p", { class: "slide-card__text" }, block.text)
    );
  }
  if (block.kind === "frase") {
    const [before, ...rest] = block.text.split(BLANK);
    const blank = fill
      ? el("span", { class: "blank blank--filled" }, fitBlank(before, fill))
      : el("span", { class: "blank" }, el("span", { class: "visually-hidden" }, "spazio da completare"));
    return el("p", { class: "slide__sentence" }, before, blank, rest.join("___"));
  }
  if (block.kind === "barre") return drawBars(view, block, animate);
  if (block.kind === "pezzi") return drawTokens(block, animate);
  if (block.kind === "mappa") return drawMap(block, done);
  if (block.kind === "spazio") return drawSpace(view, block, done);
  if (block.kind === "flusso") return drawFlow(block);
  if (block.kind === "tabella") return drawTable(block);
  if (block.kind === "temperatura") return drawDial(view, block);
  if (block.kind === "bilancia") return drawBalance(view, block);
  if (block.kind === "dialogo") return drawDialog(block, done);
  if (block.kind === "nastro") return drawTape(block);
  if (block.kind === "documento") return drawDocument(block, done);
  return drawStudent(block);
}

function drawBars(view, block, animate) {
  const yours = (block.highlight && view.progress.memory[block.highlight]) || null;
  const largest = Math.max(...block.entries.map((entry) => entry.share));
  const box = el(
    "div",
    { class: "bars" },
    block.entries.map((entry, index) => {
      const isYours = yours !== null && containsWord(yours, entry.word);
      const width = `${(entry.share / largest) * 100}%`;
      const fill = el("span", { class: `bars__fill bars__fill--${Math.min(index, 3)}` });
      if (animate && !reducedMotion()) {
        fill.style.width = "0";
        requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = width)));
      } else {
        fill.style.width = width;
      }
      return el(
        "div",
        { class: isYours ? "bars__row bars__row--yours" : "bars__row" },
        el("span", { class: "bars__word" }, entry.word),
        el("span", { class: "bars__track" }, fill),
        el("span", { class: "bars__share" }, `${formatShare(entry.share)}%`, isYours && el("span", { class: "bars__yours" }, " la tua"))
      );
    })
  );
  if (yours && !block.entries.some((entry) => containsWord(yours, entry.word))) {
    box.append(
      el("p", { class: "slide__text" }, `La tua parola, «${yours}», non è tra queste: nella lista vera c'è anche lei, più in basso.`)
    );
  }
  return box;
}

// When the pieces have numbers and the step has just appeared, the stylesheet plays it
// out: first the whole sentence, then the cuts, then each piece's number in turn.
function drawTokens(block, animate) {
  const build = animate && !reducedMotion() && block.pieces.some((piece) => piece.number !== null);
  return el(
    "ul",
    { class: build ? "tokens tokens--build" : "tokens" },
    block.pieces.map((piece, index) => {
      const node = el(
        "li",
        { class: "token" },
        el("span", { class: "token__text" }, piece.text),
        piece.number !== null && el("span", { class: "token__number" }, String(piece.number))
      );
      node.style.setProperty("--i", index);
      return node;
    })
  );
}

// Words placed on a map; the 'dopo' words join once the step's activity is answered.
// On a narrow screen each word gets a row of its own, in order from the top, so that
// none of them covers another: --row and --rows carry that order to the stylesheet.
function drawMap(block, done) {
  const shown = block.words.map((word) => ({ word, later: false }));
  if (done) shown.push(...block.later.map((word) => ({ word, later: true })));
  const order = [...shown].sort((a, b) => a.word.y - b.word.y || a.word.x - b.word.x);
  const map = el(
    "ul",
    { class: "word-map" },
    shown.map(({ word, later }) => {
      const node = el("li", { class: `word-map__word word-map__word--${word.group}${later ? " word-map__word--new" : ""}` }, word.word);
      node.style.setProperty("--x", word.x);
      node.style.setProperty("--y", word.y);
      node.style.setProperty("--row", order.findIndex((item) => item.word === word));
      return node;
    })
  );
  map.style.setProperty("--rows", shown.length);
  return map;
}

function svgNode(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

// A point of the word space, 0 to 100 along each side, seen from the front and a little
// from above, with the box turned 'angle' degrees around its upright side. A positive
// angle moves the front of the box to the right, like dragging it to the right.
// 'stretch' makes the box wider and deeper than it is tall, or narrower.
function projectPoint(point, angle, stretch) {
  const turn = (angle * Math.PI) / 180;
  const [x, y, z] = [(point.x - 50) * stretch, point.y - 50, (point.z - 50) * stretch];
  const across = x * Math.cos(turn) + z * Math.sin(turn);
  const toward = z * Math.cos(turn) - x * Math.sin(turn);
  const near = toward * Math.cos(SPACE_TILT) + y * Math.sin(SPACE_TILT);
  const scale = SPACE_DISTANCE / (SPACE_DISTANCE - near);
  return { across: across * scale, up: (y * Math.cos(SPACE_TILT) - toward * Math.sin(SPACE_TILT)) * scale, near, scale };
}

// How far the box reaches from its middle, whichever way it is turned. The drawing's
// scale comes from this, so that turning the box never makes it grow or shrink.
const spaceReaches = new Map();
function spaceExtent(stretch) {
  if (!spaceReaches.has(stretch)) {
    const reach = { side: 0, top: 0, bottom: 0 };
    for (let angle = 0; angle < 360; angle += 5) {
      for (const x of [0, 100]) for (const y of [0, 100]) for (const z of [0, 100]) {
        const point = projectPoint({ x, y, z }, angle, stretch);
        reach.side = Math.max(reach.side, Math.abs(point.across));
        reach.top = Math.max(reach.top, point.up);
        reach.bottom = Math.max(reach.bottom, -point.up);
      }
    }
    spaceReaches.set(stretch, reach);
  }
  return spaceReaches.get(stretch);
}

// The box takes the shape that fills its frame best: wide on a monitor, tall on a phone,
// where the words would otherwise crowd together. Gives the shape and the scale.
function spaceFit(width, height) {
  let best = null;
  for (let tenths = 6; tenths <= 18; tenths += 1) {
    const stretch = tenths / 10;
    const reach = spaceExtent(stretch);
    const unit = Math.min(width / 2 / reach.side, height / (reach.top + reach.bottom));
    const area = 2 * reach.side * (reach.top + reach.bottom) * unit * unit;
    if (!best || area > best.area) best = { stretch, unit, reach, area };
  }
  return best;
}

// Words in a box with three directions, drawn in perspective. Dragging the picture or
// moving the slider turns it. The angle lives in view.dials, like the dial's position,
// so an answer does not turn the box back. The words are an HTML list laid over the
// picture: they keep the page's text size at any width, and stay text for screen readers.
function drawSpace(view, block, done) {
  controlCount += 1;
  const id = `spazio-${controlCount}`;
  let angle = view.dials.has(block) ? view.dials.get(block) : SPACE_ANGLE;
  const shown = block.words.map((word) => ({ word, later: false }));
  if (done) shown.push(...block.later.map((word) => ({ word, later: true })));

  const corner = { x: 0, y: 0, z: 0 };
  const picture = svgNode("svg", { class: "space__picture", "aria-hidden": "true", focusable: "false" });
  const floor = svgNode("polygon", { class: "space__floor" });
  const axes = [
    { x: 100, y: 0, z: 0 },
    { x: 0, y: 100, z: 0 },
    { x: 0, y: 0, z: 100 },
  ].map((end) => ({ end, line: svgNode("path", { class: "space__axis" }) }));
  const links = [
    [block.near, "near"],
    [block.far, "far"],
  ]
    .filter(([pair]) => pair)
    .map(([pair, kind]) => ({ pair, line: svgNode("line", { class: `space__link space__link--${kind}` }) }));
  const points = shown.map(({ word, later }) => ({
    word,
    drop: svgNode("line", { class: "space__drop" }),
    leader: svgNode("line", { class: "space__leader", visibility: "hidden" }),
    dot: svgNode("circle", { class: `space__dot space__dot--${word.group}${later ? " space__dot--new" : ""}` }),
    label: el("li", { class: `space__word space__word--${word.group}${later ? " space__word--new" : ""}` }, word.word),
  }));
  picture.append(
    floor,
    ...axes.map((axis) => axis.line),
    ...points.map((point) => point.drop),
    ...links.map((link) => link.line),
    ...points.map((point) => point.leader),
    ...points.map((point) => point.dot)
  );
  const stage = el("div", { class: "space__stage" }, picture, el("ul", { class: "space__words" }, points.map((point) => point.label)));
  const input = el("input", { class: "dial__input", id, type: "range", min: "-180", max: "180", step: "5" });

  let order = "";
  let fit = null;
  const place = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    // Room is kept along the edges, and below for the words under the lowest dots.
    const edge = 14;
    const labelRoom = (points.length ? points[0].label.offsetHeight : 0) + 10;
    if (!fit || fit.width !== width || fit.height !== height || fit.labelRoom !== labelRoom) {
      fit = { width, height, labelRoom, ...spaceFit(width - 2 * edge, height - 2 * edge - labelRoom) };
    }
    const { stretch, unit, reach } = fit;
    const middle = edge + reach.top * unit;
    const at = (point) => {
      const seen = projectPoint(point, angle, stretch);
      return { left: width / 2 + seen.across * unit, top: middle - seen.up * unit, near: seen.near, scale: seen.scale };
    };
    picture.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const pair = (point) => `${point.left.toFixed(1)},${point.top.toFixed(1)}`;
    floor.setAttribute(
      "points",
      [corner, { x: 100, y: 0, z: 0 }, { x: 100, y: 0, z: 100 }, { x: 0, y: 0, z: 100 }].map((point) => pair(at(point))).join(" ")
    );
    const base = at(corner);
    for (const axis of axes) {
      const tip = at(axis.end);
      const length = Math.hypot(tip.left - base.left, tip.top - base.top) || 1;
      const [dx, dy] = [(tip.left - base.left) / length, (tip.top - base.top) / length];
      const wing = (side) => pair({ left: tip.left - dx * 9 + side * dy * 5, top: tip.top - dy * 9 - side * dx * 5 });
      axis.line.setAttribute("d", `M${pair(base)} L${pair(tip)} M${wing(1)} L${pair(tip)} L${wing(-1)}`);
    }
    const placed = points.map((point) => ({ point, seen: at(point.word), ground: at({ ...point.word, y: 0 }) }));
    for (const { point, seen, ground } of placed) {
      for (const [name, value] of [
        ["x1", seen.left],
        ["y1", seen.top],
        ["x2", ground.left],
        ["y2", ground.top],
      ]) {
        point.drop.setAttribute(name, value.toFixed(1));
      }
      point.dot.setAttribute("cx", seen.left.toFixed(1));
      point.dot.setAttribute("cy", seen.top.toFixed(1));
      point.dot.setAttribute("r", (5.5 * seen.scale).toFixed(1));
    }
    // Each word goes below its dot, or else in the first of the places around it where it
    // covers no word already placed: first right beside the dot, then one or two steps
    // further out, joined to the dot by a thin line. If no place is free, it goes where it
    // covers the least. The nearest words are placed first.
    const taken = [];
    const covered = (spot) =>
      taken.reduce((sum, other) => {
        const across = Math.min(spot.x + spot.w, other.x + other.w) - Math.max(spot.x, other.x) + 2;
        const down = Math.min(spot.y + spot.h, other.y + other.h) - Math.max(spot.y, other.y) + 2;
        return sum + (across > 0 && down > 0 ? across * down : 0);
      }, 0);
    for (const { point, seen } of [...placed].sort((a, b) => b.seen.near - a.seen.near)) {
      const [w, h, gap] = [point.label.offsetWidth, point.label.offsetHeight, 6 * seen.scale + 3];
      const [left, top] = [seen.left, seen.top];
      const around = (far) => {
        const side = 0.7 * far;
        return [
          [left - w / 2, top + far],
          [left - w / 2, top - far - h],
          [left + far, top - h / 2],
          [left - far - w, top - h / 2],
          [left + side, top + side],
          [left - side - w, top + side],
          [left + side, top - side - h],
          [left - side - w, top - side - h],
        ];
      };
      const spots = [...around(gap), ...around(gap + h), ...around(gap + 2 * h)].map(([x, y], index) => ({
        x: Math.min(Math.max(x, 0), width - w),
        y: Math.min(Math.max(y, 0), height - h),
        w,
        h,
        out: index >= 8,
      }));
      let spot = spots[0];
      let least = Infinity;
      for (const candidate of spots) {
        const amount = covered(candidate);
        if (amount < least) [spot, least] = [candidate, amount];
        if (!amount) break;
      }
      taken.push(spot);
      if (spot.out) {
        const end = { left: Math.min(Math.max(left, spot.x), spot.x + w), top: Math.min(Math.max(top, spot.y), spot.y + h) };
        for (const [name, value] of [
          ["x1", left],
          ["y1", top],
          ["x2", end.left],
          ["y2", end.top],
        ]) {
          point.leader.setAttribute(name, value.toFixed(1));
        }
      }
      point.leader.setAttribute("visibility", spot.out ? "visible" : "hidden");
      point.label.style.left = `${spot.x.toFixed(1)}px`;
      point.label.style.top = `${spot.y.toFixed(1)}px`;
      point.label.style.zIndex = String(Math.round(seen.near + 200));
    }
    for (const link of links) {
      const [from, to] = link.pair.map((word) => at(word));
      for (const [name, value] of [
        ["x1", from.left],
        ["y1", from.top],
        ["x2", to.left],
        ["y2", to.top],
      ]) {
        link.line.setAttribute(name, value.toFixed(1));
      }
    }
    // Nearer dots go over farther ones. Moving a dot restarts its fade-in, so they are
    // put in order again only when the order has changed.
    const sorted = [...placed].sort((a, b) => a.seen.near - b.seen.near);
    const now = sorted.map((item) => points.indexOf(item.point)).join(",");
    if (now !== order) {
      order = now;
      for (const item of sorted) picture.append(item.point.dot);
    }
  };

  const turnTo = (value) => {
    angle = ((((value + 180) % 360) + 360) % 360) - 180;
    view.dials.set(block, angle);
    input.value = String(Math.round(angle));
    input.setAttribute("aria-valuetext", `${Math.round(angle)} gradi`);
    place();
  };
  input.addEventListener("input", () => turnTo(Number(input.value)));
  let drag = null;
  stage.addEventListener("pointerdown", (event) => {
    drag = { from: event.clientX, angle };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (drag) turnTo(drag.angle + (event.clientX - drag.from) * 0.5);
  });
  for (const name of ["pointerup", "pointercancel"]) stage.addEventListener(name, () => (drag = null));
  // The size is known only once the slide is on the page, and changes with the window.
  const watch = new ResizeObserver(() => (stage.isConnected ? place() : watch.disconnect()));
  watch.observe(stage);
  if (document.fonts) document.fonts.ready.then(() => stage.isConnected && place());
  turnTo(angle);

  return el(
    "div",
    { class: "space", role: "group", "aria-label": "Lo spazio delle parole" },
    stage,
    el("div", { class: "space__turn" }, el("label", { class: "dial__label", for: id }, "Gira lo spazio"), input),
    links.length > 0 &&
      el(
        "ul",
        { class: "space__legend" },
        block.near &&
          el(
            "li",
            { class: "space__key space__key--near" },
            el("strong", {}, "Vicine"),
            `: «${block.near[0].word}» e «${block.near[1].word}», significato simile`
          ),
        block.far &&
          el(
            "li",
            { class: "space__key space__key--far" },
            el("strong", {}, "Lontane"),
            `: «${block.far[0].word}» e «${block.far[1].word}», significati diversi`
          )
      )
  );
}

function drawFlow(block) {
  const arrow = () => el("span", { class: "flow__arrow", "aria-hidden": "true" }, "↓");
  return el(
    "div",
    { class: "flow" },
    block.input && [el("p", { class: "flow__end" }, block.input), arrow()],
    el(
      "div",
      { class: "flow__machine" },
      block.name && el("p", { class: "flow__name" }, block.name),
      el(
        "ol",
        { class: "flow__stages" },
        block.stages.map((stage) =>
          el(
            "li",
            { class: "flow__stage" },
            stage.label && el("p", { class: "slide-card__label" }, stage.label),
            el("p", { class: "slide-card__title" }, stage.title),
            stage.text && el("p", { class: "slide-card__text" }, stage.text)
          )
        )
      )
    ),
    block.output && [arrow(), el("p", { class: "flow__end flow__end--out" }, block.output)]
  );
}

function drawTable(block) {
  return el(
    "table",
    { class: "slide-table" },
    el("thead", {}, el("tr", {}, block.columns.map((column) => el("th", { scope: "col" }, column)))),
    el(
      "tbody",
      {},
      block.rows.map((row) => el("tr", {}, row.map((value, index) => (index ? el("td", {}, value) : el("th", { scope: "row" }, value)))))
    )
  );
}

// The temperature knob: the scores go through a softmax after being divided by the
// temperature. Its position is kept for the page's lifetime, not saved.
function drawDial(view, block) {
  controlCount += 1;
  const id = `temperatura-${controlCount}`;
  const input = el("input", {
    class: "dial__input",
    id,
    type: "range",
    min: "0.2",
    max: "2",
    step: "0.1",
    value: String(view.dials.get(block) || 1),
  });
  const shown = el("strong", {});
  const rows = block.entries.map((entry, index) => {
    const fill = el("span", { class: `bars__fill bars__fill--${Math.min(index, 3)}` });
    const percent = el("span", { class: "bars__share" });
    const row = el("div", { class: "bars__row" }, el("span", { class: "bars__word" }, entry.word), el("span", { class: "bars__track" }, fill), percent);
    return { fill, percent, row };
  });
  const top = Math.max(...block.entries.map((entry) => entry.score));
  const update = () => {
    const temperature = Number(input.value);
    view.dials.set(block, temperature);
    shown.textContent = temperature.toFixed(1).replace(".", ",");
    const weights = block.entries.map((entry) => Math.exp((entry.score - top) / temperature));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    rows.forEach((row, index) => {
      const value = (weights[index] / total) * 100;
      row.fill.style.width = `${value}%`;
      row.percent.textContent = formatPercent(value);
    });
  };
  input.addEventListener("input", update);
  update();
  return el(
    "div",
    { class: "dial" },
    el("label", { class: "dial__label", for: id }, "Temperatura: ", shown),
    input,
    el("p", { class: "dial__ends", "aria-hidden": "true" }, el("span", {}, "bassa"), el("span", {}, "alta")),
    el("div", { class: "bars" }, rows.map((row) => row.row))
  );
}

// A knob with a few positions, each giving a value to every measure: the trade-off
// between two numbers made visible. Its position is kept like the dial's.
function drawBalance(view, block) {
  controlCount += 1;
  const id = `bilancia-${controlCount}`;
  const last = block.levels.length - 1;
  const input = el("input", { class: "dial__input", id, type: "range", min: "0", max: String(last), step: "1" });
  input.value = String(view.dials.has(block) ? view.dials.get(block) : 0);
  const shown = el("strong", {});
  const colours = [1, 0, 2, 3];
  const rows = block.measures.map((measure, index) => {
    const fill = el("span", { class: `bars__fill bars__fill--${colours[index]}` });
    const value = el("span", { class: "bars__share" });
    const row = el(
      "div",
      { class: "bars__row balance__row" },
      el("span", { class: "bars__word" }, measure.name),
      el("span", { class: "bars__track" }, fill),
      value
    );
    return { fill, value, row };
  });
  const update = () => {
    const position = Number(input.value);
    const level = block.levels[position];
    view.dials.set(block, position);
    shown.textContent = level.name;
    input.setAttribute("aria-valuetext", level.name);
    rows.forEach((row, index) => {
      const measure = block.measures[index];
      row.fill.style.width = `${(level.values[index] / measure.out) * 100}%`;
      row.value.textContent = `${level.values[index]} su ${measure.out}`;
    });
  };
  input.addEventListener("input", update);
  update();
  return el(
    "div",
    { class: "dial balance" },
    el("label", { class: "dial__label", for: id }, `${block.label || "Posizione"}: `, shown),
    input,
    el("p", { class: "dial__ends", "aria-hidden": "true" }, el("span", {}, block.levels[0].name), el("span", {}, block.levels[last].name)),
    el("div", { class: "bars" }, rows.map((row) => row.row))
  );
}

// A short exchange, one line per speaker. The 'dopo' lines join once the step is done.
function drawDialog(block, done) {
  const line = (item, later) =>
    el("p", { class: later ? "dialog__line dialog__line--new" : "dialog__line" }, el("span", { class: "dialog__who" }, `${item.who} →`), " ", item.text);
  return el(
    "div",
    { class: "dialog" },
    block.lines.map((item) => line(item, false)),
    done && block.later.map((item) => line(item, true))
  );
}

// The text that reaches the model, in its labelled pieces; or, with 'unito', the way
// the model gets it: one piece, with no labels and no borders.
function drawTape(block) {
  if (block.merged) return el("p", { class: "tape tape--merged" }, block.parts.map((part) => part.text).join(" "));
  return el(
    "ol",
    { class: "tape" },
    block.parts.map((part) =>
      el("li", { class: "tape__part" }, el("span", { class: "tape__label" }, part.label), el("span", { class: "tape__text" }, part.text))
    )
  );
}

// A document. A hidden line is written white on white, as in the trick the lesson is
// about: the eye misses it, but selecting the text shows it. Once the step is done, it
// is shown in orange.
function drawDocument(block, done) {
  const after = done && block.labelAfter;
  const label = after ? block.labelAfter : block.label;
  return el(
    "div",
    { class: "document" },
    label && el("p", { class: after ? "slide-card__label slide-card__label--after" : "slide-card__label" }, label),
    block.lines.map((line) => {
      let kind = "document__line";
      if (line.hidden) kind += done ? " document__line--found" : " document__line--hidden";
      return el("p", { class: kind }, line.text);
    })
  );
}

function drawStudent(block) {
  const books = el(
    "div",
    { class: "drawing__books" },
    Array.from({ length: 13 }, (_, index) => el("span", { class: `book book--${index % 4}` }))
  );
  const person = el(
    "div",
    { class: "drawing__person" },
    el("span", { class: "person__head" }),
    el("span", { class: "person__arm" }),
    el("span", { class: "person__body" })
  );
  const bubble = el(
    "div",
    { class: "drawing__bubble" },
    el("span", { class: "bubble__line" }),
    el("span", { class: "bubble__line" }),
    el("span", { class: "bubble__line bubble__line--short" }),
    el("span", { class: "bubble__line bubble__line--unsure" }),
    el("span", { class: "bubble__mark" }, "?")
  );
  return el(
    "figure",
    { class: "drawing" },
    el(
      "div",
      {
        class: "drawing__scene",
        role: "img",
        "aria-label":
          "Uno studente con la mano alzata davanti a una pila altissima di libri. Nella nuvoletta, tre righe sicure e una che finisce con un punto di domanda.",
      },
      books,
      person,
      bubble
    ),
    block.caption && el("figcaption", { class: "drawing__caption" }, block.caption)
  );
}

function replyFor(activity, typed) {
  const match = activity.expected.find((item) => item.words.some((word) => containsWord(typed, word)));
  return match ? match.reply : activity.otherwise;
}

function pickVerdict(found, needed, extra) {
  if (found === needed && !extra) return "Giusto! ";
  return found ? "Quasi. " : "Non proprio. ";
}

function wordsVerdict(activity, picked) {
  const chosen = picked.map((unit) => activity.units[unit].normal);
  const found = activity.right.filter((word) => chosen.includes(word)).length;
  const extra = chosen.filter((word) => !activity.right.includes(word)).length;
  return pickVerdict(found, activity.right.length, extra);
}

function linesVerdict(activity, picked) {
  const found = picked.filter((line) => activity.lines[line].right).length;
  return pickVerdict(found, activity.lines.filter((line) => line.right).length, picked.length - found);
}

// A button that is pressed or not, for the activities where several things are tapped.
function pickButton(className, label, pressed, locked) {
  const button = el("button", { class: className, type: "button", disabled: locked, "aria-pressed": String(pressed) }, label);
  if (!locked) {
    button.addEventListener("click", () => {
      const on = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(on));
      button.classList.toggle("choice--chosen", on);
    });
  }
  return button;
}

// Conferma answers with whatever is pressed, as long as something is.
function confirmPick(view, entry, index, buttons, box, empty) {
  const hint = el("p", { class: "fill__hint", "aria-live": "polite" });
  const confirm = el("button", { class: "button", type: "button" }, "Conferma");
  confirm.addEventListener("click", () => {
    const chosen = buttons.filter((item) => item.button.getAttribute("aria-pressed") === "true").map((item) => item.number);
    if (!chosen.length) {
      hint.textContent = empty;
      return;
    }
    answer(view, entry, index, { picked: chosen });
  });
  box.append(el("p", { class: "actions word-pick__confirm" }, confirm), hint);
  return box;
}

// A loaded die: each face comes up as often as its share says.
function rollDie(faces) {
  let point = Math.random() * faces.reduce((sum, face) => sum + face.share, 0);
  for (let face = 0; face < faces.length; face += 1) {
    point -= faces[face].share;
    if (point < 0) return face;
  }
  return faces.length - 1;
}

// The words of a sentence as buttons: tapping marks them, Conferma answers.
function drawWordPick(view, entry, index, activity, result, box) {
  const picked = new Set(result ? result.picked : []);
  const buttons = [];
  const sentence = el(
    "p",
    { class: "word-pick" },
    activity.units.map((unit, number) => {
      if (!unit.pickable) {
        const core = unit.core && el("strong", { class: "word-pick__target" }, unit.core);
        return el("span", { class: "word-pick__unit" }, unit.lead, core, unit.trail);
      }
      let state = "";
      if (result && activity.right.includes(unit.normal)) state = " choice--right";
      else if (result && picked.has(number)) state = " choice--wrong";
      const button = pickButton(`choice word-pick__word${state}`, unit.core, picked.has(number), Boolean(result));
      buttons.push({ number, button });
      return el("span", { class: "word-pick__unit" }, unit.lead, button, unit.trail);
    })
  );
  box.append(el("p", { class: "activity__question" }, activity.question), sentence);
  if (result) {
    box.append(el("p", { class: "activity__reply" }, el("strong", {}, wordsVerdict(activity, result.picked)), activity.reply));
    return box;
  }
  return confirmPick(view, entry, index, buttons, box, "Tocca almeno una parola.");
}

// The lines of a text as buttons, in a page: tapping marks them, Conferma answers.
function drawLinePick(view, entry, index, activity, result, box) {
  const picked = new Set(result ? result.picked : []);
  const buttons = [];
  const page = el(
    "ol",
    { class: "line-pick" },
    activity.lines.map((line, number) => {
      let state = "";
      if (result && line.right) state = " choice--right";
      else if (result && picked.has(number)) state = " choice--wrong";
      const button = pickButton(`choice line-pick__line${state}`, line.text, picked.has(number), Boolean(result));
      buttons.push({ number, button });
      return el("li", {}, button);
    })
  );
  box.append(el("p", { class: "activity__question" }, activity.question), page);
  if (result) {
    box.append(el("p", { class: "activity__reply" }, el("strong", {}, linesVerdict(activity, result.picked)), activity.reply));
    return box;
  }
  return confirmPick(view, entry, index, buttons, box, "Tocca almeno una riga.");
}

// The student writes a message and the filter checks it, as the lab's filter would.
// Every try is kept and shown with its outcome; there is room for a few more.
function drawFilter(view, entry, index, activity, result, box) {
  const tries = result ? result.tries : [];
  box.append(el("p", { class: "activity__question" }, activity.question));
  if (tries.length) {
    box.append(
      el(
        "ol",
        { class: "filter-tries", "aria-label": "I tuoi tentativi" },
        tries.map((message) => {
          const caught = filterCatch(activity, message);
          return el(
            "li",
            { class: caught ? "filter-try filter-try--blocked" : "filter-try filter-try--passed" },
            el("span", { class: "filter-try__verdict" }, caught ? `Il filtro blocca: c'è «${caught}»` : "Il filtro lascia passare"),
            el("span", { class: "filter-try__message" }, message)
          );
        })
      ),
      el("p", { class: "activity__reply" }, filterCatch(activity, tries[tries.length - 1]) ? activity.blocked : activity.passed)
    );
  }
  if (tries.length >= FILTER_TRIES) return box;
  const input = el("input", {
    class: "fill__input",
    type: "text",
    autocomplete: "off",
    autocapitalize: "off",
    spellcheck: "false",
    maxlength: String(MESSAGE_LENGTH),
    "aria-label": activity.question,
    "data-focus": tries.length > 0,
  });
  const hint = el("p", { class: "fill__hint", "aria-live": "polite" });
  const form = el("form", { class: "fill" }, input, el("button", { class: "button", type: "submit" }, tries.length ? "Prova ancora" : "Prova"));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim().replace(/\s+/g, " ");
    if (!message) {
      hint.textContent = "Scrivi un messaggio.";
      input.focus();
      return;
    }
    answer(view, entry, index, { tries: [...tries, message] });
  });
  box.append(form, hint);
  return box;
}

// Requests to approve, one at a time. "Sì" keeps the focus, as the default button of a
// real approval window would: pressing Enter over and over is exactly the trap.
function drawApproval(view, entry, index, activity, result, box) {
  const said = result ? result.said : [];
  const total = activity.requests.length;
  box.append(el("p", { class: "activity__question" }, activity.question));
  if (said.length < total) {
    const request = activity.requests[said.length];
    const yes = el("button", { class: "button", type: "button", "data-focus": true }, "Sì, approvo");
    const no = el("button", { class: "button button--secondary", type: "button" }, "No, blocco");
    yes.addEventListener("click", () => answer(view, entry, index, { said: [...said, true] }));
    no.addEventListener("click", () => answer(view, entry, index, { said: [...said, false] }));
    box.append(
      el(
        "div",
        { class: "request" },
        el("p", { class: "request__count" }, `Richiesta ${said.length + 1} di ${total}`),
        request.title && el("p", { class: "request__title" }, request.title),
        el("p", { class: "request__text" }, request.text),
        el("p", { class: "actions request__actions" }, yes, no)
      )
    );
    return box;
  }
  const approved = said.filter(Boolean).length;
  const missed = activity.requests.some((request, number) => request.risky && said[number]);
  box.append(
    el(
      "ol",
      { class: "request-list" },
      activity.requests.map((request, number) =>
        el(
          "li",
          { class: request.risky ? "request-list__item request-list__item--risky" : "request-list__item" },
          el("span", { class: "request-list__said" }, said[number] ? "✓ approvata" : "✗ bloccata"),
          request.risky && el("span", { class: "request-list__risky" }, "pericolosa"),
          el("span", { class: "request-list__text" }, request.title ? `${request.title} · ${request.text}` : request.text)
        )
      )
    ),
    el(
      "p",
      { class: "activity__reply" },
      el("strong", {}, `Hai approvato ${approved} ${approved === 1 ? "richiesta" : "richieste"} su ${total}. `),
      missed ? activity.missed : activity.stopped
    )
  );
  return box;
}

function drawDie(view, entry, index, activity, result, box) {
  const rolls = result ? result.rolls : [];
  box.append(el("p", { class: "activity__question" }, activity.question));
  if (rolls.length < activity.throws) {
    // data-focus keeps the keyboard on this button from one throw to the next.
    const roll = el("button", { class: "button", type: "button", "data-focus": true }, rolls.length ? "Tira ancora" : "Tira il dado");
    roll.addEventListener("click", () => answer(view, entry, index, { rolls: [...rolls, rollDie(activity.faces)] }));
    box.append(el("p", { class: "actions dice__actions" }, roll, el("span", { class: "dice__count" }, `Lanci: ${rolls.length} di ${activity.throws}`)));
  }
  if (rolls.length) {
    box.append(el("ol", { class: "dice__rolls", "aria-label": "Le parole uscite" }, rolls.map((face) => el("li", { class: "dice__roll" }, activity.faces[face].word))));
  }
  if (rolls.length === activity.throws) box.append(el("p", { class: "activity__reply" }, activity.reply));
  return box;
}

function drawActivity(view, entry, index, activity, result) {
  const box = el("div", { class: "activity" });
  if (activity.kind === "parole") return drawWordPick(view, entry, index, activity, result, box);
  if (activity.kind === "righe") return drawLinePick(view, entry, index, activity, result, box);
  if (activity.kind === "dado") return drawDie(view, entry, index, activity, result, box);
  if (activity.kind === "filtro") return drawFilter(view, entry, index, activity, result, box);
  if (activity.kind === "approva") return drawApproval(view, entry, index, activity, result, box);
  if (activity.kind === "scelta") {
    box.append(el("p", { class: "activity__question" }, activity.question));
    const choices = el("div", { class: "choices", role: "group", "aria-label": activity.question });
    activity.options.forEach((option, number) => {
      const chosen = Boolean(result) && result.choice === number;
      let state = "";
      if (result && activity.graded && option.right) state = " choice--right";
      else if (result && activity.graded && chosen) state = " choice--wrong";
      else if (chosen) state = " choice--chosen";
      const button = el(
        "button",
        { class: `choice${state}`, type: "button", disabled: Boolean(result), "aria-pressed": result ? String(chosen) : null },
        option.text
      );
      if (!result) button.addEventListener("click", () => answer(view, entry, index, { choice: number }));
      choices.append(button);
    });
    box.append(choices);
    if (result) {
      const option = activity.options[result.choice];
      box.append(
        el(
          "p",
          { class: "activity__reply" },
          activity.graded && el("strong", {}, option.right ? "Giusto! " : "Non proprio. "),
          option.reply
        )
      );
    }
    return box;
  }

  if (activity.question) box.append(el("p", { class: "activity__question" }, activity.question));
  if (result) {
    box.append(
      el("p", { class: "fill__given" }, "La tua risposta: ", el("strong", {}, result.typed)),
      el("p", { class: "activity__reply" }, replyFor(activity, result.typed))
    );
    return box;
  }
  const input = el("input", {
    class: "fill__input",
    type: "text",
    autocomplete: "off",
    autocapitalize: "off",
    spellcheck: "false",
    maxlength: "40",
    "aria-label": activity.question || "La tua parola",
  });
  const hint = el("p", { class: "fill__hint", "aria-live": "polite" });
  const form = el("form", { class: "fill" }, input, el("button", { class: "button", type: "submit" }, "Conferma"));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const typed = input.value.trim().replace(/\s+/g, " ");
    if (!normalizeAnswer(typed)) {
      hint.textContent = "Scrivi almeno una parola.";
      input.focus();
      return;
    }
    if (activity.remember) view.progress.memory[activity.remember] = typed;
    answer(view, entry, index, { typed });
  });
  box.append(form, hint);
  return box;
}

// 'opened' says that this answer finished the activity: only then does what it reveals
// fade in. A die throw, a filter try or an approval before the last one does not.
function answer(view, entry, index, result) {
  const activity = view.slides[view.progress.slide].steps[index].activity;
  const before = resultComplete(activity, entry.results[index]);
  entry.results[index] = result;
  view.fresh = { slide: view.progress.slide, step: index, part: "answer", opened: !before && resultComplete(activity, result) };
  draw(view, "answer");
}

function drawStep(view, slide, entry, index) {
  const step = slide.steps[index];
  const result = entry.results[index] || null;
  const fresh = view.fresh && view.fresh.slide === view.progress.slide && view.fresh.step === index ? view.fresh.part : null;
  const opened = fresh === "answer" && view.fresh.opened;
  const node = el("div", { class: fresh === "step" ? "step is-new" : "step" });
  const fill = blankFill(step, result);
  const done = stepDone(slide, entry, index);
  for (const block of step.show) node.append(drawBlock(view, block, done, fill, fresh === "step"));
  if (step.activity) {
    const activity = drawActivity(view, entry, index, step.activity, result);
    if (fresh === "answer") {
      const revealed = ".word-map__word--new, .space__word--new, .space__dot--new, .dialog__line--new, .document__line--found";
      const appeared = [
        ...(opened ? node.querySelectorAll(revealed) : []),
        ...activity.querySelectorAll(".activity__reply, .dice__roll:last-child, .filter-try:last-child, .request"),
      ];
      for (const part of appeared) part.classList.add("is-new");
    }
    node.append(activity);
  }
  if (step.activity && resultComplete(step.activity, result)) {
    for (const block of step.after) {
      const shown = drawBlock(view, block, true, fill, fresh === "step" || opened);
      if (opened) shown.classList.add("is-new");
      node.append(shown);
    }
  }
  return node;
}

function drawProgress(index, total) {
  const fill = el("span", { class: "slides-progress__fill" });
  fill.style.width = `${Math.round(((index + 1) / total) * 100)}%`;
  return el(
    "div",
    { class: "slides-progress" },
    el("p", { class: "slides-progress__label" }, `Slide ${index + 1} di ${total}`),
    el(
      "div",
      {
        class: "slides-progress__track",
        role: "progressbar",
        "aria-label": "Avanzamento della lezione",
        "aria-valuemin": "1",
        "aria-valuemax": String(total),
        "aria-valuenow": String(index + 1),
      },
      fill
    )
  );
}

function drawNavigation(view) {
  const { slides, progress } = view;
  const index = progress.slide;
  const complete = slideComplete(slides[index], progress.slides[index]);
  const back = el("button", { class: "button button--secondary", type: "button", disabled: index === 0 }, "← Indietro");
  back.addEventListener("click", () => {
    progress.slide -= 1;
    view.fresh = null;
    draw(view, "slide");
  });
  const last = index === slides.length - 1;
  const next = el("button", { class: "button slide-nav__next", type: "button", disabled: !complete }, last ? "Fine" : "Avanti →");
  next.addEventListener("click", () => {
    progress.slide += 1;
    const entry = progress.slides[progress.slide];
    view.fresh = entry && !entry.results.length && entry.revealed === 1 ? { slide: progress.slide, step: 0, part: "step" } : null;
    draw(view, "slide");
  });
  return el(
    "div",
    { class: "slide-nav" },
    el("p", { class: "actions slide-nav__buttons" }, back, next),
    !complete &&
      el(
        "p",
        { class: "slide-nav__hint" },
        slides[index].forSuperiori
          ? "Completa la slide per andare avanti, oppure saltala con il pulsante in alto."
          : "Completa la slide per andare avanti."
      )
  );
}

function drawEnd(view, main) {
  const { lesson, slides, progress } = view;
  const back = el("button", { class: "button button--secondary", type: "button" }, "← Indietro");
  back.addEventListener("click", () => {
    progress.slide = slides.length - 1;
    view.fresh = null;
    draw(view, "slide");
  });
  const again = el("button", { class: "button button--secondary", type: "button" }, "Ricomincia");
  again.addEventListener("click", () => {
    forgetProgress(lesson);
    view.progress = freshProgress(slides);
    view.dials.clear();
    view.fresh = { slide: 0, step: 0, part: "step" };
    draw(view, "slide");
  });
  main.append(
    el(
      "section",
      { class: "slide slide--end", "aria-labelledby": "slide-title" },
      el("h2", { class: "slide__title", id: "slide-title", tabindex: "-1" }, "Hai finito la lezione interattiva!"),
      el("p", { class: "slide__text" }, "Adesso metti alla prova quello che hai imparato con il quiz."),
      el(
        "p",
        { class: "actions" },
        el("a", { class: "button", href: `quiz.html?n=${lesson.number}` }, lesson.quiz.title),
        el("a", { class: "button button--secondary", href: `lezione.html?n=${lesson.number}` }, "Torna alla lezione")
      ),
      el("p", { class: "actions" }, back, again)
    )
  );
}

function draw(view, focus) {
  const { lesson, slides, progress } = view;
  saveProgress(lesson, progress);
  const main = clearMain();
  if (progress.slide >= slides.length) {
    drawEnd(view, main);
    focusAfterDraw(main, focus);
    return;
  }

  const index = progress.slide;
  const slide = slides[index];
  const entry = progress.slides[index];
  // A slide for the superiori can be skipped from the top, right beside its tag.
  let skip = null;
  if (slide.forSuperiori && !slideComplete(slide, entry)) {
    skip = el("button", { class: "slide__skip", type: "button" }, "Salta questa slide →");
    skip.addEventListener("click", () => {
      entry.skipped = true;
      progress.slide += 1;
      view.fresh = null;
      draw(view, "slide");
    });
  }
  const card = el(
    "section",
    { class: "slide", "aria-labelledby": "slide-title" },
    slide.forSuperiori && el("div", { class: "slide__header" }, el("p", { class: "slide__tag" }, "Per le superiori"), skip),
    el("h2", { class: "slide__title", id: "slide-title", tabindex: "-1" }, slide.title)
  );
  const steps = el("div", { class: "slide__steps", "aria-live": "polite" });
  for (let step = 0; step < entry.revealed; step += 1) steps.append(drawStep(view, slide, entry, step));
  card.append(steps);

  const current = entry.revealed - 1;
  if (stepDone(slide, entry, current) && current < slide.steps.length - 1) {
    const next = el("button", { class: "button button--secondary", type: "button" }, "Continua");
    next.addEventListener("click", () => {
      entry.revealed += 1;
      view.fresh = { slide: index, step: entry.revealed - 1, part: "step" };
      draw(view, "step");
    });
    card.append(el("p", { class: "actions slide__continue" }, next));
  }

  main.append(drawProgress(index, slides.length), card, drawNavigation(view));
  focusAfterDraw(main, focus);
}

// Keyboard and screen reader users land on what just appeared, not back at the top.
function focusAfterDraw(main, focus) {
  if (!focus) return;
  const behavior = reducedMotion() ? "auto" : "smooth";
  requestAnimationFrame(() => {
    if (focus === "slide") {
      main.scrollIntoView({ block: "start", behavior });
      const title = document.getElementById("slide-title");
      if (title) title.focus({ preventScroll: true });
      return;
    }
    const steps = main.querySelectorAll(".step");
    const last = steps[steps.length - 1];
    const target =
      (focus === "step" && last && last.querySelector("button:not([disabled]), input")) ||
      main.querySelector("[data-focus]") ||
      main.querySelector(".slide__continue button") ||
      main.querySelector(".slide-nav__next:not([disabled])");
    if (last) last.scrollIntoView({ block: "nearest", behavior });
    if (target) target.focus({ preventScroll: true });
  });
}

/* ---- The page ---- */

function renderInteractive(lessons) {
  const lesson = requestedLesson(lessons);
  if (!lesson || !lesson.interactiveFile) return renderNotFound("Questa lezione interattiva non c'è");
  document.title = `Lezione ${lesson.number} interattiva · Museo CTRL+Alt`;
  setHero(
    el("p", { class: "breadcrumb" }, el("a", { href: `lezione.html?n=${lesson.number}` }, "← Torna alla lezione")),
    el("p", { class: "eyebrow" }, `Lezione ${lesson.number} · Versione interattiva`),
    el("h1", {}, lesson.title)
  );

  loadInteractiveScript(lesson).then((found) => {
    const where = `contenuti/${lesson.folder}/${lesson.interactiveFile}`;
    let slides = null;
    if (!found) {
      content.problems.push(`${where}: file non trovato`);
    } else if (interactive.registered === undefined) {
      const detail = interactive.scriptError || "dettagli nella console del browser, tasto F12";
      content.problems.push(`${where}: il file non è stato letto, probabilmente per un errore di scrittura (${detail})`);
    } else {
      try {
        slides = validateInteractive(interactive.registered, where);
      } catch (error) {
        if (!(error instanceof ContentError)) console.error(error);
        content.problems.push(error instanceof ContentError ? error.message : `${where}: errore imprevisto (${error})`);
      }
    }
    if (!slides) {
      for (const problem of content.problems) console.error(problem);
      const main = clearMain();
      showProblems(main);
      main.append(
        el("p", { class: "actions" }, el("a", { class: "button", href: `lezione.html?n=${lesson.number}` }, "Torna alla lezione"))
      );
      return;
    }
    const progress = savedProgress(lesson, slides) || freshProgress(slides);
    const view = {
      lesson,
      slides,
      progress,
      dials: new Map(),
      fresh: { slide: progress.slide, step: progress.slides[progress.slide] ? progress.slides[progress.slide].revealed - 1 : 0, part: "step" },
    };
    draw(view, null);
  });
}

PAGES.interactive = renderInteractive;
