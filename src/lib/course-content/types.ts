import type { Locale } from '../i18n';

export type L = Record<Locale, string>;
export type LList = Record<Locale, string[]>;

export type Block =
  | { type: 'text'; content: L }
  | { type: 'list'; items: LList }
  | { type: 'ordered'; items: LList }
  | { type: 'callout'; variant: 'info' | 'warn' | 'stop'; title: L; content: L }
  | { type: 'grid'; items: { title: L; text: L }[] }
  | { type: 'compare'; yesTitle: L; noTitle: L; yes: LList; no: LList }
  | {
      type: 'quiz';
      id: string;
      label: L;
      question: L;
      scenario?: L;
      options: L[];
      correct: number;
      feedback: L;
    };

export type Module = {
  id: string;
  tag: L;
  title: L;
  lede: L;
  blocks: Block[];
};

export type CourseContent = {
  slug: string;
  level: number;
  minutes: number;
  passMark: number;
  title: L;
  lede: L;
  outcomes: LList;
  modules: Module[];
  sources: string[];
};
