# Claude Prompt 03 — SUPABASE + USER AUTH

Енді Next.js нұсқасына Supabase Auth және Postgres қосамыз. Алдымен database schema migration және RLS саясаттарын жоспарла, сосын іске асыр. Мен secrets бермейінше placeholder env vars пайдалан.

Негізгі tables: profiles (user preferences), lessons (metadata), exercises, vocabulary_items, lesson_progress, exercise_attempts, exam_attempts, vocabulary_reviews, teacher_conversations, activity_log.

Міндетті шарттар:
- RLS: әр user өз progress/chat деректерін ғана көреді.
- Admin lesson editing only explicit admin role.
- Server-side validation, auth guards, indexes/unique constraints.
- localStorage демо прогресін бір рет көшіруге optional import tool.
- Account delete + data export architecture.
- No secrets committed; `.env.example` only.
- Graceful empty states and test coverage.

Жұмысты кішкентай коммиттерге бөл. Тесттерді орындап, не істелгенін қазақша түсіндір. Шынайы API ключтарды сұрап экранға жариялама; қажет болса тек жергілікті `.env.local` арқылы баптау жолын көрсет. Осы кезең біткен соң тоқта.
