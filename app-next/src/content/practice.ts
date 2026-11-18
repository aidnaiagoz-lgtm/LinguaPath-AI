/* Original practice content for LinguaPath AI. */
import type { ExamQuestion, ListeningItem, Resource, SpeakingPhrase, Word } from './types';

/** Each exam question is linked to the lesson that teaches it. The weekly exam
 *  only shows questions from lessons the learner has completed. */
export const exam: ExamQuestion[] = [
  { id: 'ex-01', lessonId: 'a0-01', q: '«I am a student» қалай аударылады?', answers: ['Мен студентпін', 'Ол студент', 'Біз студентпіз'], correct: 0, topic: 'Reading' },
  { id: 'ex-02', lessonId: 'a0-02', q: 'I ___ a student.', answers: ['am', 'is', 'are'], correct: 0, topic: 'Grammar' },
  { id: 'ex-03', lessonId: 'a0-03', q: 'What time is it? — It is ___ o’clock.', answers: ['seven', 'sevens', 'seventh'], correct: 0, topic: 'Vocabulary' },
  { id: 'ex-04', lessonId: 'a1-01', q: 'She ___ English.', answers: ['speak', 'speaks', 'speaking'], correct: 1, topic: 'Grammar' },
  { id: 'ex-05', lessonId: 'a1-02', q: 'Where ___ you live? — I live in Almaty.', answers: ['do', 'does', 'is'], correct: 0, topic: 'Grammar' },
  { id: 'ex-06', lessonId: 'a1-02', q: 'Where are you from?', answers: ['Қайда барасың?', 'Қай жақтансың?', 'Қайда оқисың?'], correct: 1, topic: 'Vocabulary' },
  { id: 'ex-07', lessonId: 'a1-03', q: '“University” деген не?', answers: ['Университет', 'Мектеп', 'Кітапхана'], correct: 0, topic: 'Vocabulary' }
];

export const words: Word[] = [
  { en: 'apple', kk: 'алма', zh: '苹果' },
  { en: 'water', kk: 'су', zh: '水' },
  { en: 'study', kk: 'оқу', zh: '学习' },
  { en: 'teacher', kk: 'мұғалім', zh: '老师' },
  { en: 'book', kk: 'кітап', zh: '书' },
  { en: 'university', kk: 'университет', zh: '大学' },
  { en: 'morning', kk: 'таң', zh: '早上' },
  { en: 'friend', kk: 'дос', zh: '朋友' }
];

export const listening: ListeningItem[] = [
  { id: 'li-01', lessonId: 'a0-01', audioText: 'My name is Dana. I am a student.', prompt: 'Дана кім?', answers: ['Мұғалім', 'Студент', 'Дәрігер'], correct: 1, translation: { kk: 'Менің атым Дана. Мен студентпін.', zh: '我叫达娜。我是学生。', en: 'My name is Dana. I am a student.' } },
  { id: 'li-02', lessonId: 'a0-02', audioText: 'They are my friends.', prompt: 'Қай сөйлемді естідің?', answers: ['They is my friend.', 'They are my friends.', 'There are my friends.'], correct: 1, translation: { kk: 'Олар — менің достарым.', zh: '他们是我的朋友。', en: 'They are my friends.' } },
  { id: 'li-03', lessonId: 'a0-03', audioText: 'It is eight o’clock.', prompt: 'Сағат нешеде?', answers: ['07:00', '08:00', '09:00'], correct: 1, translation: { kk: 'Сағат сегіз.', zh: '现在八点。', en: 'It is eight o’clock.' } },
  { id: 'li-04', lessonId: 'a1-01', audioText: 'She works in a bank.', prompt: 'Ол қайда жұмыс істейді?', answers: ['Банкте', 'Мектепте', 'Кітапханада'], correct: 0, translation: { kk: 'Ол банкте жұмыс істейді.', zh: '她在银行工作。', en: 'She works in a bank.' } },
  { id: 'li-05', lessonId: 'a1-02', audioText: 'When do you study English?', prompt: 'Сұрақ не туралы?', answers: ['Қайда оқисың?', 'Қашан ағылшын оқисың?', 'Не оқисың?'], correct: 1, translation: { kk: 'Ағылшынды қашан оқисың?', zh: '你什么时候学英语？', en: 'When do you study English?' } },
  { id: 'li-06', lessonId: 'a1-03', audioText: 'I go to university in the morning.', prompt: 'Ол университетке қашан барады?', answers: ['Кешке', 'Таңертең', 'Түсте'], correct: 1, translation: { kk: 'Мен университетке таңертең барамын.', zh: '我早上去大学。', en: 'I go to university in the morning.' } }
];

export const speaking: SpeakingPhrase[] = [
  { id: 'sp-01', lessonId: 'a0-01', text: 'Hello! My name is Aidan.', tip: { kk: '“name” сөзіндегі [eɪ] дыбысын созып айт.', zh: '注意 “name” 里的 [eɪ] 音。', en: 'Stretch the [eɪ] sound in “name”.' } },
  { id: 'sp-02', lessonId: 'a0-02', text: 'She is a teacher. We are students.', tip: { kk: '“She is” → “She’s” деп қысқартып айтуға болады.', zh: '“She is” 口语里常说成 “She’s”。', en: '“She is” is often contracted to “She’s”.' } },
  { id: 'sp-03', lessonId: 'a0-03', text: 'It is seven o’clock.', tip: { kk: '“o’clock” — екпін соңғы буында: o-CLOCK.', zh: '“o’clock” 重音在后面：o-CLOCK。', en: 'Stress the second syllable: o-CLOCK.' } },
  { id: 'sp-04', lessonId: 'a1-01', text: 'I study English every evening.', tip: { kk: '“every” — екі буын: EV-ry.', zh: '“every” 读作两个音节：EV-ry。', en: 'Say “every” with two syllables: EV-ry.' } },
  { id: 'sp-05', lessonId: 'a1-02', text: 'Where do you live? I live in Almaty.', tip: { kk: 'Wh- сұрақта дауыс соңында төмендейді.', zh: '特殊疑问句结尾语调下降。', en: 'Wh- questions usually end with a falling tone.' } }
];

export const resources: Resource[] = [
  { name: 'VOA Learning English', type: 'Listening · A0–B1', url: 'https://learningenglish.voanews.com/', note: 'Аудио мен жаңадан бастаушыларға арналған сабақтар.', language: 'en' },
  { name: 'British Council LearnEnglish', type: 'Grammar · A1–C1', url: 'https://learnenglish.britishcouncil.org/', note: 'Деңгейге сай грамматика және жаттығулар.', language: 'en' },
  { name: 'BBC Learning English', type: 'Pronunciation · Listening', url: 'https://www.bbc.co.uk/learningenglish', note: 'Айтылым, қысқа видеосабақтар.', language: 'en' },
  { name: 'Cambridge English', type: 'Activities · Practice', url: 'https://www.cambridgeenglish.org/learning-english/', note: 'Деңгейлік жаттығулар.', language: 'en' },
  { name: 'Bilibili — 英语零基础', type: '中文讲解 · Beginner', url: 'https://search.bilibili.com/all?keyword=%E8%8B%B1%E8%AF%AD%E9%9B%B6%E5%9F%BA%E7%A1%80', note: 'Қытай тіліндегі түсіндірулер: автор видеоларына сілтемелер.', language: 'zh' },
  { name: 'Hujiang English', type: '中文语法', url: 'https://www.hjenglish.com/', note: 'Қытайша грамматика материалдары.', language: 'zh' },
  { name: 'Youdao Dictionary', type: 'English ↔ 中文', url: 'https://dict.youdao.com/', note: 'Сөздерді аудару және түсіну.', language: 'zh' },
  { name: 'IELTS Official', type: 'IELTS · Later stage', url: 'https://ielts.org/take-a-test/preparation-resources', note: 'Ресми дайындық ресурстары.', language: 'en' }
];
