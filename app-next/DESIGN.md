# LinguaPath AI — дизайн жүйесі және архитектура (v0.3)

## 1. Дизайн бағыты

**Аудитория:** 17–35 жас, студенттер мен кәсіби мақсатта оқитын ересектер.
**Сипат:** тыныш, жинақы, премиум. Linear / Notion / Apple сияқты құралдардың ұстамдылығынан шабыт алынды, бірақ ешбірі көшірілмеді.

| Принцип | Іске асырылуы |
|---|---|
| Оқуға ыңғайлы | Light режим — негізгі; негізгі мәтін 15–17px, жол биіктігі 1.6–1.75, мәтін ені ≤ 68ch |
| Балалық емес | Emoji жоқ; Lucide иконкалары (1.5px сызық); мультфильм кейіпкері жоқ |
| Ұстамды түс | Бренд түсі тек әрекетке және белсенді күйге; неон, агрессивті градиент, жарқырау жоқ |
| Жұмсақ қозғалыс | 150–260ms, `cubic-bezier(.22,1,.36,1)`; `prefers-reduced-motion` бәрін өшіреді |
| Адал демо | AI жоқ жерде әрдайым «Демо» белгісі |

## 2. Түс токендері

Бренд: Deep Navy `#080F26` · Indigo `#697AFA` · Soft Cyan `#50DDD3`. Мәтінге арналған токендер WCAG AA (≥ 4.5:1) талабына сай. Бұл `tests/unit/contrast.test.ts` арқылы автоматты тексеріледі.

| Токен | Light | Dark (жұмсақ көк-сұр) |
|---|---|---|
| `bg` | `#F6F7FB` | `#10162A` |
| `surface` | `#FFFFFF` | `#161D33` |
| `text` | `#0B1430` | `#E7EAF3` |
| `text-muted` | `#4A5370` | `#A9B1C7` |
| `primary` (Indigo, AA) | `#4C5BD4` | `#8D9BFF` |
| `accent` (Cyan, AA) | `#0E7C76` | `#5EDDD3` |

Бренд Indigo `#697AFA` ақ фонда мәтін үшін 3.6:1 ғана береді. Сондықтан мәтін мен батырмаларда оның қанықтау реңкі `#4C5BD4` (5.6:1) қолданылады. Түпнұсқа бренд түстері логотипте, Mira-да және декорацияда сақталды.

## 3. Типография және кеңістік

- **Шрифт:** Inter Variable (кириллица, қазақ әріптері ә ғ қ ң ө ұ ү һ і толық). Қытай мәтіні жүйелік шрифтке ауысады (PingFang SC / Noto Sans SC / Microsoft YaHei).
- **Шкала:** H1 26/30px (−0.02em), бөлім 15–18px, негізгі 14–17px, қосымша 12–13px; сандар `tabular-nums`.
- **Кеңістік:** 4px тор; бөлімдер арасы 32–40px; карточка ішкі шегінісі 20–24px; радиус 8 / 12 / 16px.

## 4. Беттер құрылымы

| Маршрут | Мақсаты |
|---|---|
| `/dashboard` (Бүгін) | Келесі сабақ, күндік мақсат, streak, кесте, Mira, жылдам практика |
| `/learn` | A0 → B2 оқу жолы; A2–B2 «Дайындалуда» |
| `/learn/[lessonId]` | Түсіндірме (kk/中文/EN), мысалды тыңдау, 75% квиз |
| `/teacher` | Mira чаты (демо), тілді ауыстыру, ұсынылған сұрақтар |
| `/vocabulary` | Сөз сәйкестендіру (kk/中文) + карточкалар |
| `/listening` | TTS арқылы тыңдап түсіну |
| `/speaking` | Shadowing: тыңда → жазып ал → салыстыр (жазба сақталмайды) |
| `/exam` | Тек өтілген сабақтар бойынша апталық тест |
| `/progress` | XP/деңгей, streak, 12 апталық белсенділік, апталық XP, дағдылар |
| `/library`, `/settings` | Ресми сілтемелер; тіл, кесте, мақсат, тақырып, экспорт/өшіру |

Навигация: desktop — бүйірлік панель (≥1024px); tablet және mobile — жоғарғы бар, төменгі 5 таб және толық мәзір (`<dialog>`).

## 5. Компонент архитектурасы

```
src/
├── app/                 маршруттар, metadata, error / not-found, sitemap, robots, manifest
├── components/
│   ├── ui/              Button, Card, Badge, ProgressBar/Ring, SegmentedControl,
│   │                    ChoiceGroup (нативті radio), EmptyState, Toast, ConfirmDialog
│   ├── layout/          AppShell, nav, Logo, ThemeToggle, StreakChip, LevelSummary
│   ├── dashboard/       Today
│   ├── learning/        Roadmap, LessonView
│   ├── mira/            MiraAvatar (idle/thinking/speaking/listening), MiraChat, demo-replies
│   ├── vocabulary/      WordMatch, Flashcards
│   ├── practice/        ListeningPractice, SpeakingPractice
│   ├── exam/            ExamRunner
│   ├── progress/        ActivityHeatmap, WeeklyXpChart, SkillBreakdown, ProgressView
│   └── settings/        SettingsForm
├── content/             типтелген сабақтар мен практика контенті (website/data.js-тен)
└── lib/
    ├── logic.ts         таза логика: sanitize, Қазақстан уақыты, 75%, shuffle, валидация
    ├── actions.ts       таза күй ауысулары (lesson, exam, daily XP, settings)
    ├── gamification.ts  деңгей, streak, күндік мақсат, апталық XP, әлсіз дағдылар
    ├── store.ts         localStorage + useSyncExternalStore (SSR-қауіпсіз, қойындылар синхроны)
    └── use-speech.ts    Web Speech API (TTS) хук
```

**Деректер ағыны:** UI → `updateLearner(s => action(s, …))` → `sanitizeState` → localStorage → барлық тыңдаушылар. Әрекеттер таза функциялар болғандықтан, олар бөлек unit-тестпен тексеріледі. Supabase кезеңінде тек `store.ts` ауыстырылады.

**Mira:** `MiraAvatar` компонентінің `state` пропсы дауыс режиміне дайын. Чаттағы демо жауаптар `demo-replies.ts` файлында, оны кейін серверлік AI API-мен алмастыру оңай.

## 6. Геймификация (ересектерге лайық)

- **XP және деңгей:** L2 = 100, L3 = 250, L4 = 450, L5 = 700 XP.
- **Daily streak:** қатарынан оқылған күндер саны. Келесі күннің соңына дейін сақталады.
- **Күндік мақсат:** 10 / 20 / 30 / 50 XP.
- **XP-ді шексіз жинаудан қорғау:** сабақ XP-і бір рет беріледі; емтихан XP-і тек апталық нәтиже жақсарғанда қосылады; практика XP-і күніне бір рет.
