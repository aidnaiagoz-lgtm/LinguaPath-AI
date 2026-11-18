# Claude Prompt 06 — ДАУЫС + ROLEPLAY

Мақсат: Mira-мен нақты voice chat және role-play. Ең алдымен қазақша/қытайша/ағылшынша аралас сөйлеуді қолдайтын STT/TTS және low-latency conversational модельдерді зерттеп салыстыр: тіл қолдауы, нақты kk сапасы, код-switch, кідіріс, құн, privacy. **Қолдау мен сапаны ойдан шығарма.**

API design: browser mic consent, start/stop recording, server-side token/session, live transcript, pronunciation feedback with confidence and limits, text fallback. Audio recordings off by default; explicit opt-in, delete/export.

Roleplays: әуежай, шетел университеті, IT interview, café. A0 оқушы үшін prompt scaffolding, B1+ үшін шынайы dialogue.

Алдымен өте кішкентай proof-of-concept құра; real API unavailable болса, mock badge-ті сақта. Live voice AI-ды қолдану құнын UI-да көрсететін budget guardrails енгіз. Аяғында нақты тест сапасы мен шектеулерін есепте.
