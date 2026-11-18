# LinguaPath AI — Product Requirements Document (PRD)

## 1. Өнім мақсаты
Жеке қолдануға арналған, кейін басқа студенттерге де масштабталатын адаптивті ағылшын мектебі. Бірінші аудитория — қазақша/қытайша сөйлейтін, ағылшын Beginner деңгейіндегі METU Software Engineering студенті. Ұзақ мерзімді мақсат — B2 құзыреттері мен IELTS Academic-ке дайындық; нақты B2 деңгейі немесе IELTS ұпайы кепілденбейді.

## 2. Міндетті пайдаланушы сценарийлері
1. Тіркелу; бастапқы диагностика; тілді таңдау (kk/zh/en); мақсат қою.
2. Күндік оқу тапсырмаларын 09:00–19:00 арасында жоспарламау; таңғы және кешкі терезелер.
3. A0 → A1 → A2 → B1 → B2 сабақ картасы; prerequisites пен mastery-based unlock.
4. Әр сабақта: мақсат, түсіндіру, 2–3 мысал, интерактив тапсырмалар, review, нәтиже.
5. Қателер журналы; spaced repetition; үйренген сөздер бойынша flashcards.
6. AI teacher Mira: тілдерді ауыстырып сөйлесу, түсіндіру, жетекші сұрақтар, бірақ емтиханда жауапты айтпау.
7. Апта сайын диагностикалық тест: vocabulary, grammar, listening, reading, writing, speaking. Тілдік деңгей мен дағдыға сәйкес күрделілік.
8. Жеке аналитика: прогресс, күнтізбе, weak skills, оқу минуттары, тест нәтижелері.
9. Library: VOA, BBC, British Council, Cambridge, Bilibili/Youdao/Hujiang — лицензияға сай тексерілген материал немесе сілтеме.
10. IELTS Academic mode: ресми форматтан шабыт алған өз жаттығулар, ресми материалдарға сілтемелер; AI бағасы ресми IELTS емес.

## 3. Функциялар приоритеті
**P0 (бірінші):** анық интерфейс, 6+ бастапқы сабақ, local progress, quiz, word game, library links, schedule, language notes.
**P1:** аккаунт, Supabase, content CMS/JSON schema, admin lesson editor, AI teacher text, error journal, tests, SRS.
**P2:** voice chat, pronunciation lab, story mode, real-life simulator, offline PWA, IELTS practice, IT English, analytics improvements.

## 4. Дизайн жүйесі
Dark navy #080F26, accent indigo #697AFA, teal #50DDD3, neutral text #F5F7FF. Жұмсақ gradient, 16–20px радиус, қысқа анимациялар, төмен дискреттік шу жоқ, mobile-first. Accessibility: клавиатура, contrast, aria, reduced-motion.

## 5. Техникалық архитектура — кейінгі өндірістік нұсқа
- Frontend: Next.js App Router + TypeScript + Tailwind
- Backend: Next.js server route handlers немесе server actions
- DB/Auth: Supabase Postgres, Row Level Security, Auth
- AI: серверлік API abstraction; model/voice provider конфигурацияланатын
- Content: авторлық lesson schema және заңды license metadata
- Deploy: Vercel; secrets only server env; rate limiting, budget caps, retries/timeouts
- QA: unit, integration, accessibility және E2E smoke tests

## 6. Бейімделудің алғашқы ережелері
Mastery score 0–100: тесттердегі дәлдік (60%), кейінгі қайталау (25%), speaking/writing бағасының сенімді дәлелі (15%). Бұл тек бастапқы гипотеза — тестілеумен қайта қаралады. Әр тақырыптың unlock threshold-і 75%; бір ғана AI жауабы деңгей ауыстырмайды. Қате тақырыптар келесі аптадағы уақыт үлесін арттырады. AI қолмен белгіленген дұрыс жауапты өзгерте алмайды.

## 7. Қауіпсіздік және әділ бағалау
- API key клиентке шықпайды; RLS әр пайдаланушы дерегін бөледі.
- Жеке аудио/чат тарихының сақталуына explicit consent, deletion policy және export опциясы.
- AI feedback-те certainty flag; ресми IELTS band деп көрсетпе.
- Content injection-ге қорғаныс: сыртқы материалды нұсқаулық ретінде қарастырма.
- Content rights: license, owner, source URL, attribution, embedding eligibility; рұқсатсыз толық көшіру жоқ.

## 8. Success metrics
Өнімді қолданушы: аптасына ≥5 күн оқу, күн сайын 40–100 минут; 4 апта ішінде жалпы completion 70%+; алдын ала/кейінгі диагностикалық тест салыстырмасы. Бұл өнім мақсаттары, кепіл емес.
