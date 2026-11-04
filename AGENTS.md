# AGENTS.md

Read this before changing anything in this repository.

This is a static website for the Museo CTRL+Alt in Pavia, Italy. It delivers finished lessons
on how language models work and how they can be attacked and defended, during one-hour
workshops for visiting school classes, and ends each lesson with a short quiz. Students are 13
to 18 years old.

On 2026-11-02 the user had it rewritten from a Flask app into plain HTML, CSS and JavaScript,
so it can be published on a free static host such as GitHub Pages or Vercel. The Flask version
is kept in `archivio/sito-flask/`, which is git-ignored and never published.

## Hard constraints

These decisions are taken. Do not revisit them, and do not add features that depend on
overturning them.

1. **No accounts, no login, no registration.** No user data of any kind, no progress tracking.
2. **No admin interface.** Content is files in folders, edited on disk.
3. **No external network requests from the pages.** No CDN, no Google Fonts, no analytics, no
   third-party scripts. Everything the browser needs comes from this site.
4. **Relative addresses only.** Never a host, and never a leading `/`. The site must work at a
   domain root, inside a GitHub Pages project folder (`/<repository>/`), and straight from disk
   (`file://`).
5. **Plain HTML, one CSS file, vanilla JavaScript.** No framework, no Node, no build step, and
   no ES modules, which do not load from `file://`.
6. **Static hosting only.** No server code and no database.
7. **All text visible to users is in Italian**, in simple vocabulary suitable for a 13 year old.
   Code, comments, identifiers and commit messages are in English. The keys of the content
   files are Italian because teachers edit them.

Equally fixed:

- **Store nothing that could identify a student.** The quiz and the interactive lesson keep the
  answers given only in that tab's `sessionStorage`, so a reload still shows them. Never
  `localStorage`: on a shared museum computer the next student must not find the previous
  student's answers. Nothing ever leaves the browser.
- **The quiz is scored in the browser.** The right answers are visible in the page source. That
  is accepted for a self-check quiz with no grades.
- **Teacher documents live in an unlisted folder**, `docenti-<random>/`, with no password and a
  `noindex` meta tag. No public file may contain that folder's name, this one included. It is
  only unlisted while the repository is private: a public repository shows the name to anyone.
  Document it as an unlisted address, never as security.
- **A bad content file never hides the others.** Each lesson is its own file. A broken one is
  skipped and listed at the top of the home page, naming the file and the problem, and in the
  console. A lesson's interactive file is checked only when its page opens: a broken one shows
  the same notice there, and the lesson page and the quiz keep working.
- **The look matches the lesson slides.** Palette: `#141B2D` navy, `#F7F5F0` paper, `#E8622C`
  orange, `#2D7D8A` teal, `#4A5568` secondary text. Headings in Rubik, body in IBM Plex Sans,
  labels in IBM Plex Mono, loaded with `@font-face` from `static/fonts/` if the files are there,
  system fonts otherwise. Large text, for classroom monitors. Works from 320px to 1920px wide
  with no horizontal scrolling.

## Layout

| Path | Purpose |
|---|---|
| `index.html`, `lezione.html`, `quiz.html`, `interattiva.html` | The page shells. `static/site.js` fills them |
| `404.html` | Self-contained, because hosts serve it at any depth |
| `static/site.js` | Loads and checks the content, draws every page, scores the quiz |
| `static/interattiva.js` | The interactive lesson: checks a lesson's interactive file, draws its slides step by step |
| `static/style.css`, `static/fonts/` | The one stylesheet, and the folder for the optional fonts |
| `contenuti/elenco.js` | The list of lesson folders |
| `contenuti/<folder>/lezione.js` | One lesson: card, materials and quiz, via `registerLesson()` |
| `contenuti/<folder>/interattiva.js` | Optional: the lesson's slides as activities, via `registerInteractive()` |
| `docenti-<random>/` | The teacher page, `documenti.js` and one subfolder of documents per lesson |
| `.nojekyll` | Stops GitHub Pages from running Jekyll over the files |
| `README.md` | The Italian guide for the people who run the site. Keep it true |

Do not touch `lesson_env/` (the notebooks' Python environment), `lezione N/` (the source lesson
material), `resources/` or `archivio/`. They are git-ignored and are not part of the site.

## Code that looks removable but is not

- **`SITE_ROOT` comes from `document.currentScript`**, so scripts load correctly from the root
  pages and from the teacher page one level down, at any address.
- **Each `lezione.js` is loaded with its own `<script>` tag**, and `registerLesson()` reads the
  folder from `document.currentScript`. That is what keeps one typo from hiding every lesson,
  and it works from `file://`, where `fetch()` of JSON does not.
- **The `error` listener** maps a syntax error to its lesson file and line. Over `file://` the
  browser hides those details, and the message falls back to pointing at the console.
- **`el()` adds content with `append`, never as HTML.** Content text can contain `<`, `"` and `«»`.
- **`data-src` and the `toggle` listener.** With several PDFs, a closed deck has no `src` until
  it is opened. `loading="lazy"` does not work for this: a real browser downloaded every deck.
- **`#navpanes=0` on the PDF frames** keeps the viewer's thumbnail panel closed.
- **No `required` on the quiz radios.** The browser's message would follow the browser's
  language. The site shows its own Italian message and keeps the answers given.
- **Saved answers are checked against the current quiz** before being shown, so a changed quiz
  or a damaged value just shows an empty form. The interactive lesson does the same with its
  saved progress, down to each step before the current one being finished.
- **The interactive file is loaded only by `interattiva.html`**, after `lezione.js`, so a broken
  one cannot reach the home page, the lesson page or the quiz.
- **`fitBlank()`.** A student who types «un tuffo» after «ho fatto un ___» would otherwise read
  «ho fatto un un tuffo».
- **The word map places words with the `translate` property, not `transform`.** The fade-in
  animation sets `transform`, and would move the word. Below 40em each word gets a row of its
  own (`--row`, `--rows`), because at phone width the same coordinates made words overlap.
- **`data-focus` on the die's button**, on the filter's input after a try, and on «Sì, approvo».
  Every throw, try or approval redraws the slide; without it, keyboard focus would fall back to
  the top of the page. Keeping focus on «Sì» is also the lesson: pressing Enter over and over
  is how real approvals stop being read.
- **The temperature dial's position lives in `view.dials`**, outside the saved progress, and so
  do the balance knob's and the word space's angle. An answer redraws the slide, and they must
  not jump back.
- **The word space draws its picture in pixels**, sized by a `ResizeObserver`, and lays the
  words over it as an HTML list. In an SVG scaled with `viewBox` the words would shrink below a
  readable size on a phone. The box changes shape to fit its frame, and a word that would cover
  another moves beside its dot, or further out with a leader line: with a fixed cube and labels
  only below their dots, words overlapped at most angles on a phone.
  `touch-action: pan-y` lets a finger still scroll the page, and dots are re-ordered by depth
  only when the order changes, because moving one restarts its fade-in.
- **`opened` in `answer()`.** Only the answer that finishes an activity fades in what it reveals.
  Without it, every die throw or filter try would replay the fade-in of the whole step.
- **The hidden line of a `documento` is white on white on purpose.** It is the trick lesson 2
  teaches: selecting the text shows it. A contrast check has to leave it out.
- **The filters of lesson 3 check what the lab's filters check**: the same five words, and for
  the output filter the same characters removed first. A student goes from the slide to the
  notebook, and the two must agree.
- **`--orange-dark` and navy text on orange.** `#E8622C` fails contrast for small text and under
  white text. Navy on orange is also what the slides do.

## Known limits, accepted

- The right answers are readable in the page source.
- With a public repository the teacher page is public.
- File names are case-sensitive online but not on Windows, so a wrong capital letter can work
  locally and break online.
- A hosted site needs internet at the museum. The same files also open from disk or a USB stick.
- Many phone browsers do not show a PDF inside a page. The download button covers that.

## Testing

There is no test suite in the repository. When verifying a change:

- Serve with `py -m http.server 8000 --bind 127.0.0.1`. Without `--bind` it serves the whole
  project folder, source material included, to the network, and on Windows it raises the
  firewall prompt on the user's screen.
- A plain local server is neither case-sensitive nor under a subfolder, unlike GitHub Pages.
  Test with a server that is both, and also from `file://`.
- Playwright can drive the installed browsers with `channel="msedge"` or `channel="chrome"`, with
  no browser download. Only headless Chrome draws the PDF viewer; Edge shows a grey box.
- Check at widths from 320 to 1920, with and without the fonts: no horizontal scrolling, readable
  contrast, no request leaving the site, nothing in `localStorage`, and no public file containing
  the teacher folder's name. In the interactive lessons, also check that no two words of a map
  or of the word space overlap.
- `python` on the development machine is 3.10, and `py` defaults to 3.13. Either serves the site.
