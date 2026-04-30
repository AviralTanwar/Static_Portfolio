<div align="center">

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   A V I R A L   T A N W A R  ·  P O R T F O L I O                  │
│   Platform Owner  ·  Solution Architect  ·  Data Engineer            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

[![Live Site](https://img.shields.io/badge/Live%20Site-aviral--tanwar.github.io-000000?style=for-the-badge)](https://aviral-tanwar.github.io/Static_Portfolio)
&nbsp;
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
&nbsp;
[![Python](https://img.shields.io/badge/Python-3.x-000000?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
&nbsp;
[![Vanilla JS](https://img.shields.io/badge/Vanilla%20JS-ES6+-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
&nbsp;
[![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)](LICENSE)

**No templates. No frameworks. No shortcuts.**

</div>

---

## What this is

A personal portfolio built as an actual engineering project — not a theme, not a site builder, not a WordPress. Every pixel is hand-coded.

The key design decision: **all content lives in JSON files.** The HTML is a skeleton. JavaScript fetches the data and renders everything at runtime. Update a JSON, refresh the browser — done. No build step, no recompile, no touching HTML.

---

## Architecture

```
index.html          ← pure skeleton, zero static content
     │
     ├── static/js/intro.js       canvas intro sequence (scroll-scrubbed)
     ├── static/js/content.js     fetches all JSONs → renders sections
     ├── static/js/animations.js  IntersectionObserver, parallax, tilt, stagger
     └── static/js/main.js        modals, cover letter generator, clipboard copy

static/data/        ← THE ONLY PLACE YOU NEED TO EDIT
     ├── meta.json              name, contact, portfolio URL
     ├── hero.json              eyebrow, title lines, description
     ├── experience.json        timeline entries with KPIs
     ├── education.json         degrees and institutions
     ├── skills.json            categories + tags
     ├── projects.json          cards with stack + links
     ├── achievements.json      HackerRank and certifications
     ├── feedback.json          testimonials
     ├── contact.json           social links config
     ├── resumes.json           resume/CV download options
     └── cover_letter.json      cover letter generation config

app.py              ← Flask server (~25 lines)
```

**Data flow:**

```
app.py serves index.html
    → content.js fetches all 10 JSONs in parallel (Promise.all)
    → each section is rendered into the DOM
    → animations.js re-initialises observers on fresh elements
    → window.__portfolioData exposed globally for cover letter generator
```

---

## Features

| Feature | How it works |
|---|---|
| **Canvas intro** | `intro.js` — scroll-scrubbed frame animation using Canvas API |
| **Scroll animations** | `IntersectionObserver` — reveal, skill tag stagger, KPI count-up |
| **Sniper cursor** | Custom CSS cursor that tracks pointer state |
| **Cover letter generator** | Reads live JSON data → builds letter → opens as Blob URL (no popup blockers) |
| **Resume modal** | Role-picker modal fetches `resumes.json` dynamically |
| **Project cards** | Link field in `projects.json` — `null` = static card, URL = clickable `<a>` |
| **Clipboard copy** | Email + phone copy to clipboard on click (no Outlook, no dialer) |
| **`/api/excuse`** | Flask endpoint — scrapes a developer excuse for the intro sequence |
| **Fully responsive** | 360px → 1400px+ breakpoints, no layout breaks |

---

## Quick start

```bash
# Clone
git clone https://github.com/AviralTanwar/Static_Portfolio.git
cd Static_Portfolio

# Install dependencies
pip install -r requirements.txt

# Run
python app.py
# → http://localhost:5000
```

**Dependencies:**

```
flask>=3.0.0
requests>=2.31.0
beautifulsoup4>=4.12.0
```

That's it. Three packages. No webpack, no npm, no node_modules.

---

## Editing content

Everything you'd ever want to change is in `static/data/`. Open the relevant JSON, edit, save, refresh.

<details>
<summary><strong>meta.json</strong> — name, email, phone, location, portfolio URL</summary>

```json
{
  "name": { "first": "Aviral", "last": "Tanwar." },
  "roles": ["Platform Owner", "Solution Architect", "Data Engineer"],
  "contact": {
    "email": "aviraltanwar@gmail.com",
    "phone": "+91-9971886273",
    "location": "Noida, Uttar Pradesh, India",
    "portfolio": "https://aviral-tanwar.github.io/Static_Portfolio"
  }
}
```
</details>

<details>
<summary><strong>experience.json</strong> — timeline entries</summary>

```json
{
  "company": "NRV DesignX",
  "role": "Associate Manager — Platform Owner",
  "period": "Oct 2025 – Present",
  "pipeline": true,
  "kpis": [
    { "value": "1M+",  "label": "records / month" },
    { "value": "50+",  "label": "prod deployments" }
  ],
  "bullets": ["..."]
}
```
</details>

<details>
<summary><strong>projects.json</strong> — cards with optional links</summary>

```json
{
  "num": "I",
  "title": "XBot",
  "status": "Production · 50+ deployments",
  "stack": ["Airflow", "Python", "GCP", "MySQL", "Docker"],
  "description": "...",
  "link": null
}
```
Set `"link"` to a URL to make the card clickable. `null` renders it as a static card.
</details>

<details>
<summary><strong>cover_letter.json</strong> — generation config</summary>

```json
{
  "subject": "Platform Owner / Data Engineer / Solution Architect",
  "salutation": "Dear Hiring Manager,",
  "closing_line": "I would welcome the opportunity to discuss...",
  "closing": "Sincerely,",
  "bullets_count": 4,
  "skill_categories_count": 4
}
```
The letter body is generated live from `experience.json`, `skills.json`, and `education.json`. Change the config to control length and depth.
</details>

---

## Project structure

```
Static_Portfolio/
├── app.py
├── index.html
├── requirements.txt
└── static/
    ├── css/
    │   ├── style.css          core layout + components
    │   ├── animations.css     keyframes + transitions
    │   ├── intro.css          canvas intro overlay
    │   └── readability.css    responsive breakpoints (360px → 1400px+)
    ├── js/
    │   ├── intro.js           canvas scroll sequence
    │   ├── content.js         JSON fetch → DOM render
    │   ├── animations.js      observers + effects
    │   └── main.js            modals, cover letter, clipboard
    └── data/
        ├── meta.json
        ├── hero.json
        ├── experience.json
        ├── education.json
        ├── skills.json
        ├── projects.json
        ├── achievements.json
        ├── feedback.json
        ├── contact.json
        ├── resumes.json
        └── cover_letter.json
```

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Flask | Minimal. Serves one file and one API route. |
| Frontend | Vanilla JS | No build toolchain, no dependencies, full control. |
| Styling | Plain CSS | Four files, clean cascade, no preprocessor needed. |
| Animation | Canvas API + CSS | Native browser — no GSAP, no Three.js. |
| Data | JSON | Human-editable, no database, no CMS. |
| Deploy | GitHub Pages | Static export — Flask runs locally for the excuse API. |

---

## License

MIT — fork it, steal the architecture, make it yours.

---

<div align="center">

**Built by [Aviral Tanwar](https://aviral-tanwar.github.io/Static_Portfolio)**
&nbsp;·&nbsp;
[aviraltanwar@gmail.com](mailto:aviraltanwar@gmail.com)
&nbsp;·&nbsp;
[LinkedIn](https://linkedin.com/in/aviral-tanwar)

</div>
