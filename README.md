# Tender Document Checker · টেন্ডার ডকুমেন্ট চেকার

A bilingual (English / বাংলা) web app that helps a bidding organization prepare a tender submission: it shows the tender details, the submission deadline countdown, and the full list of required documents in order, marking which are mandatory and which have an expiry date. Built for AI DevFest 2026 (vibe-coding contest).

## Name 

- **Name:** Faizuddin Safa

## Live link

https://faizuddinsafa-24.github.io/AIDevFest_Faizuddin_Safa/

## How to run

**Online:** open the live link above in the latest Google Chrome. No login, no installation.

**Locally:** the app loads `data/requirements.json` with `fetch()`, which browsers block on `file://`. Serve the folder with any static server:

```bash
git clone https://github.com/FaizuddinSafa-24/AIDevFest_Faizuddin_Safa.git
cd AIDevFest_Faizuddin_Safa
python -m http.server 8000
# open http://localhost:8000
```

There is no build step. It is plain HTML, CSS and JavaScript with React 18 loaded from the `vendor/` folder. Deployment runs through the GitHub Actions workflow in `.github/workflows/deploy.yml`, which publishes the repository root to GitHub Pages on every push to `main`.

### Project structure

```
index.html              entry page
css/style.css           layout, light and dark themes, mobile layout
js/i18n.js              every UI string in English and Bangla (one translation object)
js/app.js               React app (React.createElement, no JSX)
data/requirements.json  organizer sample data: the tender and its 10 required documents
vendor/                 React 18.3.1, React DOM 18.3.1, Noto Sans Bengali font (licenses in vendor/LICENSES.txt)
```

## Main features done

- **Tender overview:** tender ID, title, procuring entity, bidder and submission deadline, with a live countdown that changes colour: green, then amber within 7 days, then red once the deadline has passed.
- **Required documents checklist:** all requirements in their official order, each labelled *Mandatory* or *Optional* and *Has expiry date* or *No expiry*, with a summary count (10 documents: 8 mandatory, 2 optional).
- **Full Bangla and English support:** a one-click language switch. Every label, button, message, error and empty state is stored in one translation object (`js/i18n.js`). Numbers and dates are localized: "২০ অক্টোবর, ২০২৬" in Bangla and "20 October 2026" in English. The choice is remembered in `localStorage`, and the page language and title update with it.
- **Bengali font:** Noto Sans Bengali is bundled locally, so Bangla renders correctly even if Google Fonts is unreachable.
- **Error handling:** if the requirements file cannot be loaded, a bilingual error message with a *Try again* button is shown.
- **Privacy:** everything runs in the browser. There is no backend, no login, no API keys and no data leaves the device.

## Bonus features

- **Dark / light mode:** follows the system setting on the first visit and is remembered afterwards. An early inline script prevents a white flash on load.
- **Responsive layout:** on phones the requirements table turns into stacked cards.
- **Accessibility:** buttons have bilingual `aria-label`s, keyboard focus is clearly visible, and status and error messages use `role="status"` / `role="alert"`.

## Known problems

- **Document checking is not implemented.** The app does not yet accept the bidder's PDF files, match them to requirements, read expiry dates, or flag expired, duplicate or missing documents. Every requirement shows *Not checked yet*. These were the planned next steps.
- Issues found in the sample pack that the app does **not** detect yet:
  - `trade_license_2025.pdf` expired on 2025-06-30.
  - `experience_cert.pdf` and `experience_cert 1.pdf` are identical duplicates.
  - `scan_0042.pdf` (the signed declaration) is an image-only scan with no readable text.
  - The optional R06 and R07 documents are missing.
- The tender title, procuring entity and bidder name appear in English in both languages, because the sample data provides them only in English.
- Deployment uses a GitHub Actions workflow instead of the "Deploy from a branch" setting, because the branch setting returned a 404 for this repository.

## AI tools used

- **Claude** (Anthropic), in the Claude desktop app (Cowork mode): planning, analysing the sample data, writing code, headless-Chrome testing of both languages and both themes, and drafting this README.
- **Models** (Opus 5.5, Sonnet 5.5)


## My most useful prompt

> "Build in this order, one runnable chunk at a time, telling me exactly how to test each chunk: a. Skeleton: bilingual header with language switch, main layout, sample data loaded. (I will commit and deploy this immediately.) b. Main task 1, then 2, then 3, each fully working in both languages. c. Input validation, empty states, and error messages (bilingual). d. Bonus tasks only after ALL main tasks work on the deployed site. e. Polish: responsive layout, readable typography, clear labels, a sensible app name."

It forced a deployable, bilingual app from the first chunk, so there was always a working version on GitHub Pages.

## Licenses

- Code: MIT (see `LICENSE`).
- Bundled libraries: React and React DOM 18.3.1 (MIT); Noto Sans Bengali font (SIL Open Font License 1.1).
- Sample data: fictional data provided by the AI DevFest organizers, for contest use only.
