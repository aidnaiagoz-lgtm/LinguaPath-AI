/* Scripted DEMO replies. No language model is called. Clearly labelled in the UI. */
import type { ExplanationLanguage } from '@/content/types';

export const greetings: Record<ExplanationLanguage, string> = {
  kk: 'Сәлем! Мен Mira — LinguaPath-тағы оқу көмекшіңмін. Қазір демо режимдемін: жауаптарым алдын ала жазылған, нақты AI әлі қосылмаған. «grammar», «hello» немесе «translate» деп жазып көр.',
  zh: '你好！我是 Mira，你在 LinguaPath 的学习助手。目前是演示模式：回答是预先写好的，还没有连接真正的 AI。试着输入 “grammar”、“hello” 或 “translate”。',
  en: 'Hi! I’m Mira, your learning assistant in LinguaPath. I’m in demo mode: my replies are pre-written and no real AI is connected yet. Try typing “grammar”, “hello” or “translate”.'
};

export const suggestions: Record<ExplanationLanguage, string[]> = {
  kk: ['To be грамматикасын түсіндір', 'Hello — қалай таныстырамын?', 'Сөйлемді аударып көрейік'],
  zh: ['解释一下 to be 语法', '怎么用英语自我介绍？', '一起翻译一个句子'],
  en: ['Explain the verb “to be”', 'How do I introduce myself?', 'Let’s translate a sentence']
};

const replies = {
  grammar: {
    kk: 'To be етістігі:\n• I am a student.\n• You / We / They are students.\n• He / She / It is a teacher.\n\nЕнді өзің бір сөйлем жазып көр: «She ___ my friend.»',
    zh: 'to be 动词：\n• I am a student.\n• You / We / They are students.\n• He / She / It is a teacher.\n\n现在你来填空：“She ___ my friend.”',
    en: 'The verb “to be”:\n• I am a student.\n• You / We / They are students.\n• He / She / It is a teacher.\n\nYour turn: “She ___ my friend.”'
  },
  hello: {
    kk: 'Өзіңді таныстыру үлгісі:\n“Hello! My name is … . I am a student. I live in … .”\n\nӨз атыңмен ағылшынша жазып көр — мен құрылымын тексеруге көмектесемін (демо).',
    zh: '自我介绍模板：\n“Hello! My name is … . I am a student. I live in … .”\n\n用你的名字写一遍吧（演示）。',
    en: 'A simple introduction:\n“Hello! My name is … . I am a student. I live in … .”\n\nWrite it with your own details (demo).'
  },
  translate: {
    kk: 'Аудару жаттығуы:\nEnglish: I study English every evening.\nҚазақша: Мен күн сайын кешке ағылшын тілін оқимын.\n中文：我每天晚上学习英语。\n\nЕнді «I go to university in the morning» сөйлемін аударып көр.',
    zh: '翻译练习：\nEnglish: I study English every evening.\n中文：我每天晚上学习英语。\nҚазақша: Мен күн сайын кешке ағылшын тілін оқимын.\n\n现在试着翻译 “I go to university in the morning”。',
    en: 'Translation practice:\nEnglish: I study English every evening.\nKazakh: Мен күн сайын кешке ағылшын тілін оқимын.\nChinese: 我每天晚上学习英语。\n\nNow translate “I go to university in the morning”.'
  },
  fallback: {
    kk: 'Мен әзірге демо нұсқамын, сондықтан еркін сұраққа толық жауап бере алмаймын. Нақты AI қосылғанда, қазақша, қытайша және ағылшынша араластырып жазсаң да түсінемін.\n\nҚазір көріп шық: «grammar», «hello» немесе «translate».',
    zh: '我目前只是演示版本，还不能回答开放式问题。连接真正的 AI 之后，你可以混合使用哈萨克语、中文和英语提问。\n\n现在可以试试：“grammar”、“hello” 或 “translate”。',
    en: 'I’m only a demo for now, so I can’t answer open questions yet. Once real AI is connected, you’ll be able to mix Kazakh, Chinese and English freely.\n\nFor now, try “grammar”, “hello” or “translate”.'
  }
} satisfies Record<string, Record<ExplanationLanguage, string>>;

export function demoReply(input: string, language: ExplanationLanguage): string {
  const s = input.toLowerCase();
  if (/grammar|граммат|语法|to be/.test(s)) return replies.grammar[language];
  if (/hello|сәлем|你好|\bhi\b|таныстыр|introduc|自我介绍/.test(s)) return replies.hello[language];
  if (/translat|аудар|翻译/.test(s)) return replies.translate[language];
  return replies.fallback[language];
}
