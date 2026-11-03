/* The interactive version of a lesson's slides.

   A lesson names its interactive file in lezione.js ("interattiva"). That file
   calls registerInteractive() with the slides. Each slide is a list of steps that
   appear one at a time, and each slide asks the student to do something before
   "Avanti" unlocks. As with the quiz, nothing is sent anywhere: progress is kept
   only in this tab's sessionStorage, so a reload does not lose it. */

"use strict";

const BLOCK_KINDS = ["testo", "grande", "scheda", "frase", "barre", "disegno"];
const ACTIVITY_KINDS = ["scelta", "completa"];
const DRAWINGS = ["studente"];
const BLANK = /_{3,}/;
const PROGRESS_PREFIX = "interattiva-";

const interactive = { registered: undefined, scriptError: null };

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

function validateInteractive(raw, where) {
  const data = mapping(raw, where);
  return items(data, "slide", where).map((entry, index) => validateSlide(entry, `${where}, slide ${index + 1}`));
}

function validateSlide(raw, where) {
  const data = mapping(raw, where);
  if (data.superiori !== undefined && typeof data.superiori !== "boolean") {
    throw new ContentError(`${where}: 'superiori' può essere solo true o false`);
  }
  const steps = items(data, "passi", where).map((entry, index) => validateStep(entry, `${where}, passo ${index + 1}`));
  if (!steps.some((step) => step.activity)) {
    throw new ContentError(`${where}: ogni slide deve chiedere allo studente di fare qualcosa, quindi serve almeno un'attività`);
  }
  return { title: text(data, "titolo", where), forSuperiori: data.superiori === true, steps };
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
    const entries = items(data, "voci", where).map((entry, index) => {
      const at = `${where}, voce ${index + 1}`;
      const item = mapping(entry, at);
      if (typeof item.percento !== "number" || !(item.percento > 0 && item.percento <= 100)) {
        throw new ContentError(`${at}: 'percento' deve essere un numero più grande di 0 e al massimo 100`);
      }
      return { word: text(item, "parola", at), share: item.percento };
    });
    return { kind, entries, highlight: optionalText(data, "evidenzia", where) };
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
    entry.results.every((result, index) => result === null || resultFits(result, slide.steps[index]))
  );
}

function resultFits(result, step) {
  if (!step.activity || result === null || typeof result !== "object") return false;
  if (step.activity.kind === "scelta") {
    return Number.isInteger(result.choice) && result.choice >= 0 && result.choice < step.activity.options.length;
  }
  return typeof result.typed === "string" && normalizeAnswer(result.typed) !== "";
}

function stepDone(slide, entry, index) {
  if (index < entry.revealed - 1) return true;
  if (index > entry.revealed - 1) return false;
  return !slide.steps[index].activity || Boolean(entry.results[index]);
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

function blankFill(step, result) {
  if (!result || !step.activity) return null;
  if (step.activity.kind === "completa") return result.typed;
  return step.activity.graded ? step.activity.options.find((option) => option.right).text : null;
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
  return drawStudent(block);
}

function drawBars(view, block, animate) {
  const yours = block.highlight ? view.progress.memory[block.highlight] : null;
  const yoursNormal = yours ? normalizeAnswer(yours) : null;
  const largest = Math.max(...block.entries.map((entry) => entry.share));
  const box = el(
    "div",
    { class: "bars" },
    block.entries.map((entry, index) => {
      const isYours = yoursNormal !== null && normalizeAnswer(entry.word) === yoursNormal;
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
  if (yours && !block.entries.some((entry) => normalizeAnswer(entry.word) === yoursNormal)) {
    box.append(
      el("p", { class: "slide__text" }, `La tua parola, «${yours}», non è tra queste: nella lista vera c'è anche lei, più in basso.`)
    );
  }
  return box;
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
  const answer = normalizeAnswer(typed);
  const match = activity.expected.find((item) => item.words.includes(answer));
  return match ? match.reply : activity.otherwise;
}

function drawActivity(view, entry, index, activity, result) {
  const box = el("div", { class: "activity" });
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

function answer(view, entry, index, result) {
  entry.results[index] = result;
  view.fresh = { slide: view.progress.slide, step: index, part: "answer" };
  draw(view, "answer");
}

function drawStep(view, slide, entry, index) {
  const step = slide.steps[index];
  const result = entry.results[index] || null;
  const fresh = view.fresh && view.fresh.slide === view.progress.slide && view.fresh.step === index ? view.fresh.part : null;
  const node = el("div", { class: fresh === "step" ? "step is-new" : "step" });
  const fill = blankFill(step, result);
  const done = stepDone(slide, entry, index);
  for (const block of step.show) node.append(drawBlock(view, block, done, fill, fresh === "step"));
  if (step.activity) {
    const activity = drawActivity(view, entry, index, step.activity, result);
    if (fresh === "answer") activity.lastElementChild.classList.add("is-new");
    node.append(activity);
  }
  if (step.activity && result) {
    for (const block of step.after) {
      const shown = drawBlock(view, block, true, fill, Boolean(fresh));
      if (fresh === "answer") shown.classList.add("is-new");
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
    !complete && el("p", { class: "slide-nav__hint" }, "Completa la slide per andare avanti.")
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
  const card = el(
    "section",
    { class: "slide", "aria-labelledby": "slide-title" },
    slide.forSuperiori && el("p", { class: "slide__tag" }, "Per le superiori"),
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
  if (slide.forSuperiori && !slideComplete(slide, entry)) {
    const skip = el("button", { class: "button button--secondary", type: "button" }, "Salta questa slide");
    skip.addEventListener("click", () => {
      entry.skipped = true;
      progress.slide += 1;
      view.fresh = null;
      draw(view, "slide");
    });
    card.append(
      el("div", { class: "slide__skip" }, el("p", {}, "Questa slide è un approfondimento per le superiori: puoi saltarla."), el("p", { class: "actions" }, skip))
    );
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
    const view = { lesson, slides, progress, fresh: { slide: progress.slide, step: progress.slides[progress.slide] ? progress.slides[progress.slide].revealed - 1 : 0, part: "step" } };
    draw(view, null);
  });
}

PAGES.interactive = renderInteractive;
