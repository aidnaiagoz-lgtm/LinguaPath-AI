# Claude Prompt 02 — NEXT.JS + TYPESCRIPT-ҚА КӨШІРУ

Алдыңғы 01-аудит нәтижелерін сақтай отырып, сайтты Next.js App Router + TypeScript + Tailwind CSS жобасына рет-ретімен көшір. Қолданыстағы `website/` прототипін **reference** ретінде сақта; оны өшірме. Жаңа production-ready қолданбаны `app-next/` папкасында жаса.

Талаптар:
- Reusable components: Sidebar, Topbar, StatCard, LessonCard, Quiz, Game, TeacherDemo, LibraryCard, ProgressChart, Settings.
- Paths: `/dashboard`, `/learn`, `/learn/[lessonId]`, `/teacher`, `/games`, `/exam`, `/library`, `/progress`, `/settings`.
- Typed lesson schema and mock JSON seed migrated from `website/data.js`.
- Persist local demo state without hydration bug; SSR-safe storage.
- Responsive 375px–1440px; keyboard and accessible labels.
- Feature parity: lessons ordered/unlocked, quiz, XP, match game, exam, library, kk/zh/en notes, schedule.
- Maintain visual direction: navy/indigo/teal, clean premium UI, gentle animations.
- No real AI yet, no fake live functionality.
- Add install/run/build instructions and smoke tests.

Әр қадамыңды іске қосып тексер. `npm run build` сәтті аяқталсын. Осы migration-нан кейін тоқта және қай файлдарды жасағаныңды жаз.
