export type ExplanationLanguage = 'kk' | 'zh' | 'en';
export type CefrLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
export type Skill = 'Grammar' | 'Vocabulary' | 'Reading' | 'Listening' | 'Speaking';

export type Trilingual = Record<ExplanationLanguage, string>;

export interface Question {
  q: string;
  answers: string[];
  correct: number;
}

export interface Lesson {
  id: string;
  level: CefrLevel;
  title: string;
  skill: Skill;
  tag: string;
  xp: number;
  minutes: number;
  description: string;
  objective: string;
  notes: Trilingual;
  example: string;
  quiz: Question[];
}

export interface ExamQuestion extends Question {
  id: string;
  lessonId: string;
  topic: Skill;
}

export interface Word {
  en: string;
  kk: string;
  zh: string;
}

export interface Resource {
  name: string;
  type: string;
  url: string;
  note: string;
  language: 'en' | 'zh' | 'multi';
}

export interface ListeningItem {
  id: string;
  lessonId: string;
  audioText: string;
  prompt: string;
  answers: string[];
  correct: number;
  translation: Trilingual;
}

export interface SpeakingPhrase {
  id: string;
  lessonId: string;
  text: string;
  tip: Trilingual;
}

export interface UpcomingLevel {
  level: CefrLevel;
  topics: string[];
}
