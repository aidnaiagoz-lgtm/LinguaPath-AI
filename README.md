# LinguaPath AI

**LinguaPath AI** is a personal, adaptive English academy that takes a learner from **Beginner (A0) to B2** and later to IELTS Academic preparation, with explanations in **Kazakh, Chinese and English**.

> **Status: Iteration 0 — working front-end prototype (demo).**
> There is no backend, no account system and no real AI yet. The AI teacher Mira replies with pre-written **DEMO** answers and is labelled as such everywhere.

Қазақша толық нұсқаулық: [README_FIRST_KK.md](README_FIRST_KK.md)

---

## Goal

LinguaPath AI aims to become a private AI-powered school that:

- builds a mastery-based learning path **A0 → A1 → A2 → B1 → B2 → IELTS**;
- explains every topic in **kk / 中文 / English**;
- plans study time around the learner's day (by default nothing is scheduled between **09:00 and 19:00**);
- adapts lessons, reviews and weekly exams to the learner's real weaknesses.

The product does **not** guarantee a CEFR level or an IELTS band; AI feedback is always indicative.

## What works today (prototype)

| Feature | Status |
|---|---|
| Dashboard, sidebar navigation, responsive layout (375px–1440px) | ✅ Working |
| 6 sample lessons (A0 ×3, A1 ×3) with kk/zh/en explanations | ✅ Working |
| Lessons unlock in order; 3-question quiz per lesson; XP | ✅ Working |
| Word Match mini-game (English ↔ Kazakh) | ✅ Working |
| Weekly exam (6 questions) with result history | ⚠️ Demo |
| Progress page with 28-day activity calendar | ✅ Browser `localStorage` only |
| Settings: explanation language, morning/evening study times (09–19 blocked) | ✅ Working |
| Library of external learning resources (links only) | ✅ Working |
| Mira AI teacher chat | 🟡 **Demo only** — scripted replies, no LLM |
| Accounts, cloud sync, real AI, voice, SRS, IELTS module | ❌ Not implemented yet |

## Planned features

- **Accounts & sync** — Supabase Auth + Postgres with Row Level Security.
- **Mira AI teacher** — server-side LLM tutor that understands mixed kk/zh/en input, with cost limits and prompt-injection hardening.
- **Voice chat & role-play** — speech-to-text / text-to-speech with explicit consent for recordings.
- **Adaptive learning** — mastery scores, error journal, spaced-repetition vocabulary.
- **Weekly exams** — grammar, vocabulary, reading, listening, writing, speaking; server-side answer keys.
- **Learning analytics** — weak skills, study minutes, test trends.
- **IELTS Academic practice** — original tasks plus links to official materials (unofficial scoring only).

See [docs/PROJECT_ROADMAP_AND_QA.md](docs/PROJECT_ROADMAP_AND_QA.md) for the iteration plan.

## Tech stack

| Layer | Now (prototype) | Planned (production) |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript | Next.js (App Router) + TypeScript + Tailwind CSS |
| Data | Browser `localStorage` | Supabase Postgres + RLS |
| Auth | — | Supabase Auth |
| AI | Scripted demo replies | Server-side, provider-neutral AI API layer |
| Hosting | Open the HTML file locally | Vercel |
| Tests | — | Vitest (unit) + Playwright (E2E) |

## Run locally

The prototype needs no build step, no server and no API key.

**Option 1 — open the file:**

1. Clone or download this repository.
2. Open `website/index.html` in Chrome, Edge or another modern browser.

**Option 2 — local static server (recommended):**

```bash
git clone https://github.com/aidnaiagoz-lgtm/LinguaPath-AI.git
```

```bash
cd LinguaPath-AI/website
```

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

Progress is saved only in the current browser. Use **Settings → Прогресті өшіру** to reset it.

## Repository structure

```
LinguaPath-AI/
├── README.md                 # This file
├── README_FIRST_KK.md        # Full getting-started guide (Kazakh)
├── OPEN_WEBSITE_FIRST.txt    # Quick 5-step guide (Kazakh)
├── website/                  # Working prototype (reference for the migration)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── data.js               # Original sample lessons, words, exam, resources
├── docs/
│   ├── PROJECT_REQUIREMENTS_KK.md       # Product requirements (PRD)
│   ├── LEARNING_PROGRAM_KK.md           # A0 → B2 → IELTS curriculum
│   ├── PROJECT_ROADMAP_AND_QA.md        # Iterations + QA checklist
│   ├── CONTENT_SOURCES_AND_LICENSES.md  # Content sources & copyright rules
│   └── VERIFICATION_NOTES.md            # Prototype verification log
├── claude-prompts/           # Step-by-step development prompts 01–08
└── assets/                   # Own/licensed logos, images, audio, video
```

## Development workflow

Development follows the prompts in [`claude-prompts/`](claude-prompts/) in order, one stage at a time:

1. `01_START_HERE.md` — audit and fix the prototype
2. `02_NEXTJS_MIGRATION.md` — Next.js + TypeScript migration
3. `03_DATABASE_AUTH.md` — Supabase + auth
4. `04_AI_TEACHER.md` — Mira AI teacher (text)
5. `05_ADAPTIVE_EXAMS_SRS.md` — adaptive learning, weekly exams, SRS
6. `06_VOICE_AND_ROLEPLAY.md` — voice and role-play
7. `07_CONTENT_IELTS_RELEASE.md` — content and IELTS module
8. `08_DEBUG_REVIEW.md` — debugging and review after each stage

Work happens on feature branches and is merged into `main` through pull requests.

## Security & content rules

- **Never commit secrets.** API keys live only in server-side environment variables (`.env.local`, ignored by Git). Only `.env.example` may be committed.
- **No secret keys in `website/`** — everything in it is public.
- **Copyright:** do not copy lessons, videos, audio or images from BBC, British Council, Bilibili, Cambridge and similar sites. Use original content, properly licensed material, or links. See [docs/CONTENT_SOURCES_AND_LICENSES.md](docs/CONTENT_SOURCES_AND_LICENSES.md).
- **Honesty:** demo features must stay labelled as demo; AI scores are never presented as official CEFR or IELTS results.
- **Privacy:** voice recordings and chat history require explicit consent, with export and deletion options.
