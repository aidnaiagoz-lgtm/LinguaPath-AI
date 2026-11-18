# Roadmap + Definition of Done

## Iteration 0 — Жұмыс істейтін прототип (осы папка)
- [x] Responsive interface
- [x] Lesson flow with prerequisites
- [x] LocalStorage progress
- [x] Trilingual lesson explanations
- [x] Word matching demo
- [x] Weekly quiz demo
- [x] Resource directory
- [x] Schedule preferences
- [ ] Real AI model
- [ ] Realtime speaking

## Iteration 1 — Claude Code
- [ ] Initial code audit, accessibility fixes, reusable components
- [ ] Next.js + TypeScript migration (feature parity)
- [ ] Unit and E2E tests

## Iteration 2 — Supabase
- [ ] User auth
- [ ] Lesson schema + seed
- [ ] Attempts, mastery, reviews, activity
- [ ] RLS + delete/export

## Iteration 3 — AI
- [ ] Server-side AI tutor, three-language support and cost limits
- [ ] Prompt injection and jailbreak hardening
- [ ] Teacher memory by structured DB retrieval
- [ ] Voice capability spike, Kazakhstan Kazakh and mixed-language QA

## Iteration 4 — Content + IELTS
- [ ] A0/A1 fully authored and pedagogically reviewed
- [ ] A2/B1/B2 in small validated batches
- [ ] Weekly adaptive tests + writing/speaking rubric
- [ ] IELTS practice (not official band score)

## QA Checklist
1. Mobile 375px/desktop 1440px.
2. All buttons functional; no console errors.
3. Refresh preserves progress.
4. Locked lessons require prerequisites.
5. Quizzes reject unanswered submissions.
6. No API secrets or unsafe unlicensed content.
7. Teacher clearly labeled demo when not using live API.
8. Keyboard navigation, readable focus states, screen reader labels.
9. Offline and permission failures handled gracefully.
10. Content remains accurate in kk/zh/en.
