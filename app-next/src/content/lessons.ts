/* Original sample content written for LinguaPath AI (migrated from website/data.js).
   Do not copy third-party courses into this project. */
import type { Lesson, UpcomingLevel } from './types';

export const lessons: Lesson[] = [
  {
    id: 'a0-01',
    level: 'A0',
    title: 'Hello! Өзімді таныстырамын',
    skill: 'Speaking',
    tag: 'Speaking · Basics',
    xp: 25,
    minutes: 12,
    description: 'Hello, My name is..., I am a student.',
    objective: 'Өзіңді ағылшынша қысқа таныстыра аласың.',
    notes: {
      kk: 'Hello — сәлем! Өз атыңды айту үшін My name is ... үлгісін қолдан.',
      zh: 'Hello 是“你好”。介绍自己时用 My name is ...',
      en: 'Use “My name is ...” to introduce yourself.'
    },
    example: 'My name is Aidan. I am a student.',
    quiz: [
      { q: '«Мен студентпін» деген қай сөйлем?', answers: ['I am a student.', 'I is student.', 'Me student.'], correct: 0 },
      { q: 'My name ___ Aidan.', answers: ['are', 'is', 'am'], correct: 1 },
      { q: '«Hello» нені білдіреді?', answers: ['Сау бол', 'Рақмет', 'Сәлем'], correct: 2 }
    ]
  },
  {
    id: 'a0-02',
    level: 'A0',
    title: 'I am · You are · She is',
    skill: 'Grammar',
    tag: 'Grammar · To be',
    xp: 30,
    minutes: 15,
    description: 'To be етістігінің алғашқы ережелері.',
    objective: 'am / is / are формаларын дұрыс таңдай аласың.',
    notes: {
      kk: 'I үшін am, you/we/they үшін are, he/she/it үшін is қолданылады.',
      zh: 'I 搭配 am；you/we/they 搭配 are；he/she/it 搭配 is。',
      en: 'Use am with I, are with you/we/they and is with he/she/it.'
    },
    example: 'She is a teacher. We are students.',
    quiz: [
      { q: 'She ___ a teacher.', answers: ['are', 'is', 'am'], correct: 1 },
      { q: 'They ___ happy.', answers: ['is', 'am', 'are'], correct: 2 },
      { q: 'I ___ ready.', answers: ['am', 'are', 'is'], correct: 0 }
    ]
  },
  {
    id: 'a0-03',
    level: 'A0',
    title: 'Numbers & Time',
    skill: 'Vocabulary',
    tag: 'Vocabulary · Daily life',
    xp: 25,
    minutes: 12,
    description: 'Сандар мен күнделікті уақытты үйрену.',
    objective: '1–10 сандарын және толық сағатты айта аласың.',
    notes: {
      kk: 'One — бір, two — екі, three — үш. Сағатты айту үшін It is ... o’clock қолданылады.',
      zh: 'One、two、three 是一、二、三。整点可说 It is ... o’clock。',
      en: 'Count from one to ten, then say the time.'
    },
    example: 'It is seven o’clock.',
    quiz: [
      { q: 'Seven қай сан?', answers: ['5', '7', '9'], correct: 1 },
      { q: 'It is ___ o’clock.', answers: ['three', 'threes', 'third'], correct: 0 },
      { q: 'Two + one = ?', answers: ['four', 'six', 'three'], correct: 2 }
    ]
  },
  {
    id: 'a1-01',
    level: 'A1',
    title: 'Present Simple',
    skill: 'Grammar',
    tag: 'Grammar · Routines',
    xp: 40,
    minutes: 18,
    description: 'Күнделікті әрекеттер туралы айт.',
    objective: 'Әдет пен күн тәртібін Present Simple арқылы сипаттай аласың.',
    notes: {
      kk: 'I work, you study. He немесе she болса етістікке көбіне -s жалғанады.',
      zh: '一般现在时描述习惯。he/she/it 后的动词通常加 -s。',
      en: 'Use the present simple for habits and routines.'
    },
    example: 'I study English. She studies English.',
    quiz: [
      { q: 'He ___ English every day.', answers: ['study', 'studies', 'studying'], correct: 1 },
      { q: 'I ___ in Almaty.', answers: ['live', 'lives', 'living'], correct: 0 },
      { q: 'They ___ at 9:00.', answers: ['starts', 'starting', 'start'], correct: 2 }
    ]
  },
  {
    id: 'a1-02',
    level: 'A1',
    title: 'Asking Questions',
    skill: 'Speaking',
    tag: 'Speaking · Questions',
    xp: 40,
    minutes: 16,
    description: 'What, where, when сөздерін қолдан.',
    objective: 'What / Where / When арқылы қарапайым сұрақ қоя аласың.',
    notes: {
      kk: 'What — не? Where — қайда? When — қашан? Сұраққа толық сөйлеммен жауап бер.',
      zh: 'What 是什么，Where 是哪里，When 是什么时候。',
      en: 'Ask simple questions and answer with complete sentences.'
    },
    example: 'Where do you live? I live in Almaty.',
    quiz: [
      { q: '___ do you live?', answers: ['Where', 'What', 'When'], correct: 0 },
      { q: '___ is your name?', answers: ['When', 'What', 'Where'], correct: 1 },
      { q: 'When do you study? — I study ___ 8 p.m.', answers: ['in', 'on', 'at'], correct: 2 }
    ]
  },
  {
    id: 'a1-03',
    level: 'A1',
    title: 'My University Day',
    skill: 'Reading',
    tag: 'Listening · Reading',
    xp: 40,
    minutes: 17,
    description: 'Университеттегі күн туралы қысқа мәтін.',
    objective: 'Университет күні туралы қысқа мәтінді түсінесің.',
    notes: {
      kk: 'I go to university in the morning. After class I study English.',
      zh: '我早上去大学，上完课后学习英语。注意 in the morning 和 after class。',
      en: 'Read a short story about a university day.'
    },
    example: 'I go to university in the morning. I study English after work.',
    quiz: [
      { q: 'I go ___ university.', answers: ['to', 'at', 'by'], correct: 0 },
      { q: 'After work деген не?', answers: ['Жұмысқа дейін', 'Жұмыстан кейін', 'Жұмыс ішінде'], correct: 1 },
      { q: 'Morning — ?', answers: ['Таң', 'Кеш', 'Түн'], correct: 0 }
    ]
  }
];

/** Levels that are planned but not authored yet (docs/LEARNING_PROGRAM_KK.md). */
export const upcomingLevels: UpcomingLevel[] = [
  { level: 'A2', topics: ['Past simple', 'Future', 'Comparisons', 'Travel', 'Email basics', 'Modal verbs'] },
  { level: 'B1', topics: ['Opinions', 'Conditionals', 'Present perfect', 'Extended reading', 'IT & work English'] },
  { level: 'B2', topics: ['Academic reading', 'Complex arguments', 'Essays', 'Interviews', 'Discussions'] }
];

export const LESSON_IDS = lessons.map(l => l.id);

export function getLesson(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id);
}
