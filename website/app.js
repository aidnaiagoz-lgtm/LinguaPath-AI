/* LinguaPath AI v0.2: front-end demo. No third-party AI calls, no server, localStorage only.
 * Pure logic lives in logic.js (window.LinguaLogic) and is covered by unit tests. */
(() => {
  'use strict';
  const DATA = window.LINGUA_DATA;
  const L = window.LinguaLogic;
  const LESSON_IDS = DATA.lessons.map(l => l.id);

  const storage = (() => { try { return window.localStorage; } catch (_) { return null; } })();
  let state = L.loadState(storage, LESSON_IDS);

  let currentView = 'dashboard';
  let activeLesson = null;
  let lessonAnswers = {};
  let examAnswers = {};
  let examSubmitted = false;
  let matchSelected = null;
  let matchDone = [];
  let matchOrder = [];
  let storageWarned = false;

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  const today = () => L.dateKey(new Date());
  const toast = message => {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window._toastId);
    window._toastId = setTimeout(() => el.classList.remove('show'), 2600);
  };
  const save = () => {
    if (!L.saveState(storage, state) && !storageWarned) {
      storageWarned = true;
      toast('Прогресс браузерде сақталмады: localStorage қолжетімсіз.');
    }
  };
  const btn = (label, action, extra = '') => `<button class="primary" data-action="${action}" ${extra}>${label}</button>`;
  const page = (eyebrow, title, description, body) => `<section class="content"><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="intro">${description}</p>${body}</section>`;
  const progressBar = (pct, label, style = '') => `<div class="progress-track" ${style} role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="progress-fill" style="width:${pct}%"></div></div>`;
  const langName = lang => (lang === 'kk' ? 'Қазақша' : lang === 'zh' ? '中文' : 'English');
  const lessonReady = index => index === 0 || state.done.includes(DATA.lessons[index - 1].id);
  const markActivity = () => { const key = today(); if (!state.activity.includes(key)) state.activity.push(key); };
  const setView = html => { $('#view').innerHTML = html; };

  /* ---------- Navigation & mobile menu ---------- */
  const VIEW_NAMES = { dashboard: 'DASHBOARD', learn: 'LEARNING PATH', teacher: 'AI TEACHER', games: 'PRACTICE', exam: 'WEEKLY EXAM', library: 'LEARNING LIBRARY', progress: 'PROGRESS', settings: 'SETTINGS' };

  function nav(view, moveFocus = true) {
    if (!VIEW_NAMES[view]) view = 'dashboard';
    currentView = view;
    activeLesson = null;
    if (view === 'exam') { examAnswers = {}; examSubmitted = false; }
    if (view === 'games') resetMatch();
    document.querySelectorAll('.nav-item').forEach(el => {
      const active = el.dataset.view === view;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    $('#breadcrumbs').textContent = `MY LEARNING SPACE / ${VIEW_NAMES[view]}`;
    setView(render());
    closeMenu(false);
    if (moveFocus) { $('#view').focus({ preventScroll: true }); scrollTop(); }
  }

  function openMenu() {
    $('.sidebar').classList.add('open');
    $('#menuToggle').setAttribute('aria-expanded', 'true');
    const active = $('.nav-item.active') || $('.nav-item');
    if (active) active.focus();
  }

  function closeMenu(returnFocus) {
    const sidebar = $('.sidebar');
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    if (returnFocus) $('#menuToggle').focus();
  }

  function render() {
    switch (currentView) {
      case 'dashboard': return dashboard();
      case 'learn': return activeLesson ? lessonDetail() : learn();
      case 'teacher': return teacher();
      case 'games': return games();
      case 'exam': return exam();
      case 'library': return library();
      case 'progress': return progress();
      case 'settings': return settings();
      default: return dashboard();
    }
  }

  /* ---------- Views ---------- */
  function dashboard() {
    const done = state.done.length;
    const pct = Math.round(done / DATA.lessons.length * 100);
    return page('WELCOME BACK', 'Ағылшынға жолың осы жерден басталады', 'Бұл жеке оқу кеңістігі сенің уақытыңа, деңгейіңе және оқу жылдамдығыңа қарай жоспарланған. Қазір A0 деңгейінен бастаймыз.',
      `<div class="grid stats"><div class="stat"><div class="s-icon" aria-hidden="true">✦</div><div class="s-num">A0</div><div class="s-label">Қазіргі деңгей · демо</div></div><div class="stat"><div class="s-icon" aria-hidden="true">⚡</div><div class="s-num">${state.xp}</div><div class="s-label">Жиналған XP</div></div><div class="stat"><div class="s-icon" aria-hidden="true">◉</div><div class="s-num">${done}/${DATA.lessons.length}</div><div class="s-label">Аяқталған сабақ</div></div><div class="stat"><div class="s-icon" aria-hidden="true">▤</div><div class="s-num">${state.examHistory.length}</div><div class="s-label">Тапсырылған тест</div></div></div>`
      + `<div class="grid dashboard-grid"><div class="panel"><div class="space-between"><h2 class="section-title">Сенің оқу жолың</h2><span class="pill">A0 → B2</span></div><p class="subtle small">Алғашқы MVP-де A0–A1 сабақтарының үлгісі іске қосылған.</p><div class="learning-track">${['A0', 'A1', 'A2', 'B1', 'B2'].map((x, i) => `<div class="level-node ${i > 1 ? 'locked' : ''}"><div class="level-bubble" aria-hidden="true">${i > 1 ? '♢' : x}</div><small>${i > 1 ? x + ' · кейін' : x}</small></div>`).join('')}</div><div class="space-between small"><b>Алғашқы сабақтар</b><span class="subtle">${pct}%</span></div>${progressBar(pct, 'Алғашқы сабақтар прогресі', 'style="margin:10px 0 20px"')}${btn(done ? 'Сабақтарды жалғастыру →' : 'Бірінші сабақты бастау →', 'goLearn')}</div>`
      + `<div class="panel"><h2 class="section-title">Сенің күн тәртібің</h2><div class="schedule-row"><span class="schedule-time">${esc(state.morning)}</span><span>Сөздік + қысқа қайталау</span></div><div class="schedule-row"><span class="schedule-time">09:00–19:00</span><span class="subtle">Бос емессің</span></div><div class="schedule-row"><span class="schedule-time">${esc(state.evening)}</span><span>Негізгі сабақ + жаттығу</span></div><div class="schedule-row"><span class="schedule-time">Жексенбі</span><span>Апталық тест (демо)</span></div><div style="margin-top:18px">${btn('Кестені өзгерту', 'goSettings')}</div></div></div>`
      + `<div class="banner"><span class="eyebrow">MEET YOUR AI TUTOR</span><h2>Mira — үш тілдегі жеке мұғалімің</h2><p>Қазақша, қытайша және ағылшынша түсіндіретін мұғалім интерфейсінің демосы дайын. Нақты AI API келесі кезеңде қосылады.</p>${btn('Mira-мен сөйлесу →', 'goTeacher')}</div>`);
  }

  function learn() {
    return page('YOUR LEARNING PATH', 'Сабақтар ретімен ашылады', 'Әр сабақ: түсіндіру → мысал → 3 сұрақ → нәтиже. Жақсы меңгергеннен (кемі 75%) кейін келесі сабақ ашылады.',
      `<div class="grid lesson-grid">${DATA.lessons.map((l, i) => {
        const done = state.done.includes(l.id);
        const ready = lessonReady(i);
        return `<article class="lesson-card ${done ? 'done' : ''} ${!ready ? 'locked' : ''}"><div class="card-top"><span class="tag">${l.level} · ${esc(l.tag)}</span><span class="pill">${done ? '✓ АЯҚТАЛДЫ' : ready ? 'АШЫҚ' : '🔒 ЖАБЫҚ'}</span></div><h3>${esc(l.title)}</h3><p>${esc(l.description)}</p><div class="space-between"><span class="small subtle">⏱ ${l.minutes} мин · ⚡ ${l.xp} XP</span><button class="${ready ? 'primary' : 'secondary'}" data-action="openLesson" data-id="${l.id}" ${ready ? '' : 'disabled'} aria-label="${esc((done ? 'Қайталау: ' : 'Сабақты ашу: ') + l.title)}">${done ? 'Қайталау' : 'Сабақты ашу'}</button></div></article>`;
      }).join('')}</div><p class="demo-warning" style="margin-top:18px">Бұл 6 сабақ — толық B2 бағдарламасы емес, жұмыс істейтін MVP үлгісі.</p>`);
  }

  const questionBlock = (action, key, index, q, selected, disabled = false, tag = '') => {
    const headingId = `${action}-h-${key}`;
    return `<div class="question" role="group" aria-labelledby="${headingId}">${tag}<h3 id="${headingId}">${index + 1}. ${esc(q.q)}</h3>${q.answers.map((answer, j) => `<button class="answer ${selected === j ? 'selected' : ''}" data-action="${action}" data-q="${esc(key)}" data-a="${j}" aria-pressed="${selected === j}" ${disabled ? 'disabled' : ''}>${esc(answer)}</button>`).join('')}</div>`;
  };

  function lessonDetail() {
    const l = DATA.lessons.find(x => x.id === activeLesson);
    if (!l) return learn();
    const lang = state.language;
    const total = l.quiz.length;
    const required = L.requiredCorrect(total);
    return page(`${l.level} / LESSON`, ` ${esc(l.title)}`, esc(l.description),
      `<div class="panel lesson-detail"><div class="space-between"><span class="pill">${l.minutes} минут · ${l.xp} XP</span><button class="secondary" data-action="backLearn">← Сабақтарға қайту</button></div><h2 style="margin-top:25px">Түсіндіру · ${langName(lang)}</h2><p lang="${lang}" style="line-height:1.9;color:#d4e3ff">${esc(l.notes[lang])}</p><div class="result"><span class="eyebrow">EXAMPLE</span><p lang="en" style="font-size:19px;margin-bottom:0">${esc(l.example)}</p></div><h2 style="margin:30px 0 5px">Қайталап тексерейік</h2><p class="small subtle">Барлық сұраққа жауап бер. Өту үшін кемі ${required}/${total} дұрыс жауап керек (75%).</p>${l.quiz.map((q, i) => questionBlock('lessonAnswer', i, i, q, lessonAnswers[i])).join('')}<div class="action-row">${btn('Жауаптарды тексеру', 'checkLesson')}</div><div id="lessonResult" aria-live="polite"></div></div>`);
  }

  function teacher() {
    const greetings = { kk: 'Сәлем! Мен Mira демо мұғалімімін. “hello”, “grammar” немесе “қытайша” деп жазып көр. Бұл әзірге нақты AI емес, алдын ала жазылған жауаптар.', zh: '你好！我是 Mira 演示版老师。输入 hello 或 grammar 试一试。现在还没有连接真正的 AI。', en: 'Hello! I am Mira in demo mode. Try “hello” or “grammar”. Real AI is not connected yet.' };
    const messages = state.messages.length ? state.messages : [{ role: 'bot', text: greetings[state.language] }];
    return page('TRILINGUAL TEACHER', 'Mira — AI мұғалім', 'Үш тілде түсіндіру интерфейсінің алғашқы демосы. API қосылғанда шынайы мәтіндік/дауыстық диалог пайда болады.',
      `<div class="panel" style="max-width:850px"><div class="teacher-header"><div class="mira" aria-hidden="true">👩🏻‍🏫</div><div><h2 style="margin:0 0 5px">Mira Teacher</h2><span class="demo-warning">● Демо жауаптар · Real AI жоқ</span></div></div><div id="messages" class="bubbles" role="log" aria-live="polite" aria-label="Mira-мен чат">${messages.map(m => `<div class="bubble ${m.role}">${esc(m.text)}</div>`).join('')}</div><div class="chat-input"><input id="teacherInput" class="text-input" maxlength="500" placeholder="Сәлем! Hello! 你好!" aria-label="Mira-ға хабарлама"><button class="primary" data-action="sendTeacher">Жіберу →</button></div><p class="tiny subtle">Осы демонстрацияда хабарламалар тек өз браузеріңдегі localStorage-та сақталады. Дауыстық микрофон іске қосылмаған.</p></div>`);
  }

  function demoReply(input) {
    const s = input.toLowerCase();
    if (/grammar|граммат|语法/.test(s)) return 'Қазақша: I am / You are / She is.\n中文：I 用 am，you 用 are，she 用 is。\nEnglish: I am a student. She is a teacher.\nЕнді бір сөйлем жазып көр!';
    if (/hello|сәлем|你好|hi/.test(s)) return 'Hello! Сәлем! 你好！\nToday: “My name is ...”\nҚазақша: Менің атым ...\n中文：我的名字是……\nӨз атыңды ағылшынша айтып көр!';
    return 'Қазір мен тек демо нұсқамын. Толық AI қосылғанша шағын жаттығу: “I am learning English.” сөйлемін қазақша және қытайша аударып көр.\nEnglish: I am learning English.\nҚазақша: Мен ағылшын тілін үйреніп жүрмін.\n中文：我正在学英语。';
  }

  const tile = (side, i, text, lang) => {
    const matched = matchDone.includes(i);
    return `<button data-action="match" data-side="${side}" data-index="${i}" lang="${lang}" class="word-tile ${matched ? 'matched' : ''}" aria-pressed="false" ${matched ? 'disabled' : ''}>${esc(text)}</button>`;
  };

  function games() {
    return page('MINI-GAMES', 'Сөздерді ойынмен жатта', 'Ағылшынша сөздерді қазақша мағыналарымен сәйкестендір. Барлығы дұрыс болғанда XP беріледі.',
      `<div class="panel" style="max-width:780px"><div class="space-between"><h2 class="section-title">Word Match</h2><span class="pill" id="matchCount" aria-live="polite">${matchDone.length}/${DATA.words.length} matched</span></div><p class="subtle small">Алдымен ағылшын сөзін, содан кейін оның қазақша аудармасын бас. Сөздер әр ойында араласады. XP күніне бір рет беріледі.</p><div class="word-area" role="group" aria-label="Ағылшын сөздері">${DATA.words.map((w, i) => tile('en', i, w.en, 'en')).join('')}</div><div class="divider"></div><div class="word-area" role="group" aria-label="Қазақша аудармалар">${matchOrder.map(i => tile('kk', i, DATA.words[i].kk, 'kk')).join('')}</div><div class="action-row" style="margin-top:18px"><button class="secondary" data-action="resetMatch">Қайта ойнау</button></div><div id="gameResult" aria-live="polite"></div></div>`);
  }

  function exam() {
    const questions = L.examQuestionsFor(DATA.exam, state.done);
    const intro = 'Тек өзің өткен сабақтардан құралатын демонстрациялық тест. Бұл ресми CEFR немесе IELTS емтиханы емес.';
    if (!questions.length) {
      return page('WEEKLY CHECKPOINT', 'Апталық емтихан', intro,
        `<div class="panel" style="max-width:820px"><h2 class="section-title">Әзірге сұрақ жоқ</h2><p class="subtle">Емтихан тек өтілген тақырыптарды тексереді. Алдымен кемі бір сабақты аяқта.</p>${btn('Сабақтарға өту →', 'goLearn')}</div>`);
    }
    return page('WEEKLY CHECKPOINT', 'Апталық емтихан', intro,
      `<div class="panel" style="max-width:820px"><div class="space-between"><h2 class="section-title">Week 1 — Basic English</h2><span class="pill">${questions.length} сұрақ</span></div><p class="small subtle">${state.done.length} өтілген сабақ бойынша. XP тек осы аптадағы ең жақсы нәтижеңді жақсартқанда қосылады.</p>${questions.map((q, i) => questionBlock('examAnswer', q.id, i, q, examAnswers[q.id], examSubmitted, `<span class="tag">${esc(q.topic)}</span>`)).join('')}${btn('Емтихан нәтижесін шығару', 'submitExam', examSubmitted ? 'disabled' : '')}<div id="examResult" aria-live="polite"></div></div>`);
  }

  function library() {
    return page('CURATED RESOURCES', 'Оқу кітапханасы', 'Сен үшін таңдаған халықаралық және қытайлық ағылшын оқу көздері. Авторлық құқыққа сай, олардың ресми беттеріне сілтеме береміз.',
      `<div class="grid resource-grid">${DATA.resources.map(r => `<article class="resource-card"><span class="tag">${esc(r.type)}</span><h3 style="margin:12px 0">${esc(r.name)}</h3><p>${esc(r.note)}</p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Ресми сайтты ашу ↗<span class="visually-hidden"> (${esc(r.name)}, жаңа бетте ашылады)</span></a></article>`).join('')}</div><div class="banner"><h2>Авторлық құқыққа құрмет</h2><p>VOA/BBC/Bilibili материалдарын рұқсатсыз көшірмейміз. Платформаға тек авторлық материал, қолдануға рұқсат етілген контент немесе ресми сілтеме қосылады.</p></div>`);
  }

  function progress() {
    const pct = Math.round(state.done.length / DATA.lessons.length * 100);
    const last = state.examHistory.at(-1);
    const days = L.lastDays(today(), 28);
    const activeDays = days.filter(key => state.activity.includes(key)).length;
    const cal = days.map(key => `<div class="calendar-cell ${state.activity.includes(key) ? 'marked' : ''}" title="${key}"></div>`).join('');
    return page('YOUR ANALYTICS', 'Менің жетістіктерім', 'Мұнда сабақтағы прогресс, апталық тест нәтижесі және соңғы 28 күндік оқу белсенділігі сақталады.',
      `<div class="grid stats"><div class="stat"><div class="s-num">${pct}%</div><div class="s-label">MVP сабақ прогресі</div></div><div class="stat"><div class="s-num">${state.xp}</div><div class="s-label">Жалпы XP</div></div><div class="stat"><div class="s-num">${state.examHistory.length}</div><div class="s-label">Емтихан саны</div></div><div class="stat"><div class="s-num">${last ? `${last.score}/${last.total}` : '—'}</div><div class="s-label">Соңғы тест</div></div></div>`
      + `<div class="grid dashboard-grid"><div class="panel"><h2 class="section-title">Сабақтың орындалуы</h2>${progressBar(pct, 'Сабақтың орындалуы')}<p class="subtle small">${state.done.length} / ${DATA.lessons.length} үлгі сабақ.</p><h2 class="section-title" style="margin-top:30px">Оқу белсенділігі · соңғы 28 күн</h2><div class="calendar" role="img" aria-label="Соңғы 28 күнде ${activeDays} белсенді күн">${cal}</div><p class="tiny subtle">Жасыл күндер — осы браузерде тапсырма орындалған күндер (Қазақстан уақыты).</p></div>`
      + `<div class="panel"><h2 class="section-title">Соңғы тесттер</h2>${state.examHistory.length ? state.examHistory.slice(-5).reverse().map(x => `<div class="score-row"><span>${esc(x.date)}</span><b>${x.score}/${x.total}</b></div>`).join('') : '<p class="subtle small">Әзірге тест тапсырылмаған.</p>'}<h2 class="section-title" style="margin-top:26px">Түсіндіру тілі</h2><p class="small">${state.language === 'kk' ? 'Қазақша' : state.language === 'zh' ? 'Қытайша' : 'English'}</p></div></div>`);
  }

  function settings() {
    const opt = (value, label) => `<option value="${value}" lang="${value}" ${state.language === value ? 'selected' : ''}>${label}</option>`;
    return page('PERSONAL SETTINGS', 'Баптаулар', 'Оқу түсіндірмесінің тілін және бос уақыттағы сабақ кестесін таңда. Деректер тек осы браузерде сақталады.',
      `<div class="panel" style="max-width:760px"><div class="setting-row"><div><label for="langSelect"><b>Түсіндіру тілі</b></label><p class="subtle small">Сабақтағы түсіндіру тілі</p></div><select class="select" id="langSelect">${opt('kk', 'Қазақша')}${opt('zh', '中文')}${opt('en', 'English')}</select></div><div class="setting-row"><div><label for="morningTime"><b>Таңғы қайталау уақыты</b></label><p class="subtle small" id="morningHint">09:00-ге дейін</p></div><input class="text-input" id="morningTime" type="time" required aria-describedby="morningHint" value="${esc(state.morning)}"></div><div class="setting-row"><div><label for="eveningTime"><b>Кешкі сабақ уақыты</b></label><p class="subtle small" id="eveningHint">19:00-ден кейін</p></div><input class="text-input" id="eveningTime" type="time" required aria-describedby="eveningHint" value="${esc(state.evening)}"></div><div class="action-row">${btn('Баптауларды сақтау', 'saveSettings')}<button class="secondary" data-action="resetProgress">Прогресті өшіру</button></div><p class="demo-warning">Шынайы күнтізбе/ескертпелер әлі қосылмаған. Бұл тек кесте параметрлері.</p></div>`);
  }

  /* ---------- Actions ---------- */
  function answer(type, q, a) {
    if (type === 'lessonAnswer') lessonAnswers[q] = a;
    else { if (examSubmitted) return; examAnswers[q] = a; }
    document.querySelectorAll(`[data-action="${type}"]`).forEach(el => {
      if (el.dataset.q !== String(q)) return;
      const selected = Number(el.dataset.a) === a;
      el.classList.toggle('selected', selected);
      el.setAttribute('aria-pressed', String(selected));
    });
  }

  function openLesson(id) {
    if (!DATA.lessons.some((l, i) => l.id === id && lessonReady(i))) return;
    activeLesson = id;
    lessonAnswers = {};
    setView(lessonDetail());
    $('#view').focus({ preventScroll: true });
    scrollTop();
  }

  function checkLesson() {
    const l = DATA.lessons.find(x => x.id === activeLesson);
    if (!l) return;
    if (Object.keys(lessonAnswers).length !== l.quiz.length) { toast('Алдымен барлық сұраққа жауап бер'); return; }
    const total = l.quiz.length;
    const score = l.quiz.filter((q, i) => lessonAnswers[i] === q.correct).length;
    const passed = L.isPassing(score, total);
    const required = L.requiredCorrect(total);
    const firstPass = passed && !state.done.includes(l.id);
    $('#lessonResult').innerHTML = `<div class="result"><h3>${passed ? 'Жарайсың! Сабақ өтті 🎉' : 'Тағы бір рет байқап көр'}</h3><p>${score}/${total} дұрыс жауап. ${passed ? (firstPass ? 'Келесі сабақ ашылды.' : 'Сабақ бұрын өтілген, XP қайта берілмейді.') : `Өту үшін кемі ${required}/${total} керек. Түсіндіруді қайталап, жауаптарды қайта таңда.`}</p></div>`;
    if (firstPass) {
      state.done.push(l.id);
      state.xp += l.xp;
      markActivity();
      save();
      toast(`+${l.xp} XP!`);
    }
  }

  function submitExam() {
    if (examSubmitted) return;
    const questions = L.examQuestionsFor(DATA.exam, state.done);
    if (!questions.length) return;
    if (questions.some(q => examAnswers[q.id] === undefined)) { toast('Барлық сұраққа жауап бер'); return; }
    const total = questions.length;
    const score = questions.filter(q => examAnswers[q.id] === q.correct).length;
    const errors = [...new Set(questions.filter(q => examAnswers[q.id] !== q.correct).map(q => q.topic))];
    const date = today();
    const week = L.weekKey(date);
    const previousBest = state.rewards.examBest[week];
    const xp = L.examXp(score, previousBest);
    examSubmitted = true;
    state.rewards.examBest[week] = Math.max(previousBest || 0, score);
    state.examHistory.push({ date, score, total, errors });
    state.xp += xp;
    markActivity();
    save();
    setView(exam());
    const good = score / total >= 0.8;
    $('#examResult').innerHTML = `<div class="result"><h2>${score}/${total} дұрыс жауап</h2><p>${good ? 'Өте жақсы нәтиже!' : 'Қателерді қайталап, қайта тапсырып көр.'}</p><p class="small subtle">Қайталау тақырыптары: ${errors.length ? esc(errors.join(', ')) : 'Қате жоқ'}</p><p class="small">${xp ? `+${xp} XP` : 'Бұл аптада осы нәтиже үшін XP бұрын берілген. XP тек нәтижеңді жақсартқанда қосылады.'}</p><div class="action-row"><button class="secondary" data-action="retakeExam">Қайта тапсыру</button></div></div>`;
    toast(xp ? `Нәтиже сақталды · +${xp} XP` : 'Нәтиже сақталды');
    const heading = $('#examResult h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }

  function retakeExam() {
    examAnswers = {};
    examSubmitted = false;
    setView(exam());
    $('#view').focus({ preventScroll: true });
    scrollTop();
  }

  function resetMatch() {
    matchDone = [];
    matchSelected = null;
    matchOrder = L.shuffleDifferent(DATA.words.map((_, i) => i));
  }

  function refreshTiles() {
    document.querySelectorAll('.word-tile[data-index]').forEach(x => {
      const matched = matchDone.includes(Number(x.dataset.index));
      x.classList.toggle('matched', matched);
      x.disabled = matched;
      const selected = !!matchSelected && x.dataset.side === matchSelected.side && Number(x.dataset.index) === matchSelected.index;
      x.classList.toggle('selected', selected);
      x.setAttribute('aria-pressed', String(selected));
    });
    $('#matchCount').textContent = `${matchDone.length}/${DATA.words.length} matched`;
  }

  function matchClick(side, index) {
    if (matchDone.includes(index)) return;
    if (side === 'en') { matchSelected = { side, index }; refreshTiles(); return; }
    if (!matchSelected) { toast('Алдымен ағылшын сөзін таңда'); return; }
    if (matchSelected.index === index) {
      matchDone.push(index);
      toast('Дұрыс!');
      if (matchDone.length === DATA.words.length) {
        const key = today();
        const xp = L.matchXp(state.rewards.matchDays, key);
        if (xp) { state.xp += xp; state.rewards.matchDays.push(key); }
        markActivity();
        save();
        $('#gameResult').innerHTML = `<div class="result"><h3>Барлық ${DATA.words.length} сөз дұрыс! ${xp ? `+${xp} XP` : ''}</h3><p>${xp ? 'Әр сөздің қытайша нұсқасын Library/Youdao арқылы қарап шық.' : 'Бүгінгі ойын XP-і алынған. Ертең қайта ойнап, тағы XP жина.'}</p></div>`;
      }
    } else {
      toast('Қате. Тағы бір рет байқап көр.');
    }
    matchSelected = null;
    refreshTiles();
  }

  function sendTeacher() {
    const input = $('#teacherInput');
    const message = input.value.trim();
    if (!message) return;
    state.messages.push({ role: 'user', text: message }, { role: 'bot', text: demoReply(message) });
    state.messages = state.messages.slice(-L.MAX_MESSAGES);
    save();
    setView(teacher());
    $('#messages').scrollTop = $('#messages').scrollHeight;
    $('#teacherInput').focus();
  }

  function saveSettings() {
    const morningEl = $('#morningTime');
    const eveningEl = $('#eveningTime');
    morningEl.removeAttribute('aria-invalid');
    eveningEl.removeAttribute('aria-invalid');
    const check = L.validateSchedule(morningEl.value, eveningEl.value);
    if (!check.ok) {
      const field = check.field === 'morning' ? morningEl : eveningEl;
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      toast(check.error);
      return;
    }
    const language = $('#langSelect').value;
    state.morning = morningEl.value;
    state.evening = eveningEl.value;
    state.language = L.LANGUAGES.includes(language) ? language : 'kk';
    save();
    toast('Баптаулар сақталды');
    nav('settings');
  }

  function resetProgress() {
    if (!confirm('Барлық демо прогресс, чаттар және тест нәтижелері өшірілсін бе?')) return;
    try { if (storage) storage.removeItem(L.STORAGE_KEY); } catch (_) { /* ignore */ }
    state = L.defaultState();
    examAnswers = {};
    examSubmitted = false;
    resetMatch();
    toast('Демо деректері өшірілді');
    nav('dashboard');
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', e => {
    const navigation = e.target.closest('[data-view]');
    if (navigation) { nav(navigation.dataset.view); return; }
    const sidebar = $('.sidebar');
    if (sidebar.classList.contains('open') && !e.target.closest('.sidebar') && !e.target.closest('#menuToggle')) closeMenu(false);
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const a = b.dataset.action;
    switch (a) {
      case 'goLearn': case 'backLearn': nav('learn'); break;
      case 'goTeacher': nav('teacher'); break;
      case 'goSettings': nav('settings'); break;
      case 'openLesson': openLesson(b.dataset.id); break;
      case 'lessonAnswer': answer(a, Number(b.dataset.q), Number(b.dataset.a)); break;
      case 'examAnswer': answer(a, b.dataset.q, Number(b.dataset.a)); break;
      case 'checkLesson': checkLesson(); break;
      case 'submitExam': submitExam(); break;
      case 'retakeExam': retakeExam(); break;
      case 'sendTeacher': sendTeacher(); break;
      case 'match': matchClick(b.dataset.side, Number(b.dataset.index)); break;
      case 'resetMatch': resetMatch(); setView(games()); break;
      case 'saveSettings': saveSettings(); break;
      case 'resetProgress': resetProgress(); break;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'teacherInput') { e.preventDefault(); sendTeacher(); }
    if (e.key === 'Escape' && $('.sidebar').classList.contains('open')) closeMenu(true);
  });

  $('#menuToggle').addEventListener('click', () => {
    if ($('.sidebar').classList.contains('open')) closeMenu(true); else openMenu();
  });

  nav('dashboard', false); // initial render: keep focus at the top so the skip link comes first
})();
