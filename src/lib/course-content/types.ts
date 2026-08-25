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
    }
  /*
   * ---------------------------------------------------------------- practice
   *
   * Everything below is practice, and none of it is marked.
   *
   * questionsIn() collects `quiz` and nothing else, and courseFingerprint
   * hashes the same list — so adding these to a course people have already
   * sat changes no score, invalidates no certificate, and does not move the
   * version an old attempt was taken against. That property is what makes it
   * possible to improve forty-one courses without touching anybody's record,
   * and it holds because these are separate block types rather than a flag on
   * the existing one.
   *
   * Their answers live in the browser. For a marked question that would be a
   * leak; here it is the point — the reader finds out at once whether they had
   * it right, with no round trip and nothing counting against them.
   */
  /** Put the steps back into the order they happen in. */
  | {
      type: 'order';
      prompt: L;
      /** Authored in the right order. The reader is given them shuffled. */
      steps: LList;
      /** Why this order and not another. Shown once it is right. */
      afterword: L;
    }
  /** Put each item in the bucket it belongs in. */
  | {
      type: 'sort';
      prompt: L;
      buckets: { id: string; label: L }[];
      items: { text: L; bucket: string; because: L }[];
    }
  /**
   * A situation, and where each response leads.
   *
   * Not a question with one right answer: several are defensible, and the
   * consequence is the thing that teaches. `best` marks the one the
   * association would take, so nobody is left guessing what was expected.
   */
  | {
      type: 'scenario';
      title: L;
      situation: L;
      choices: { text: L; outcome: L; best?: boolean }[];
    }
  /**
   * Think, then look.
   *
   * A prompt with the answer behind a press. Having to try first is most of
   * what makes it stay, and it costs one button.
   */
  | { type: 'reveal'; prompt: L; answer: L };

export type Module = {
  id: string;
  tag: L;
  title: L;
  lede: L;
  blocks: Block[];
};

/**
 * ---------------------------------------------------------------- practical
 *
 * Work the learner writes and a trainer reads.
 *
 * A course-level field rather than a block, and that is the whole design. It
 * is not part of any module, it carries no `correct`, and questionsIn()
 * cannot see it — so declaring one on a course volunteers have already sat
 * changes no score, moves no fingerprint and invalidates no certificate.
 * courseFingerprint() hashes the slug, the pass mark, the module ids and the
 * quiz questions; a practical task is none of those, and probe-practical
 * asserts that across the whole catalogue rather than trusting this comment.
 *
 * Text only. There is no attachment field here and no upload path behind it —
 * see the header of migration 041 for why a file store is a different and much
 * larger decision than this one.
 */
export type PracticalTask = {
  /**
   * Stable for the life of the task; it keys every submission ever made
   * against it. Rewording the brief is free. Changing this id orphans the work
   * of everybody who has already done it.
   */
  id: string;
  title: L;
  /** What to produce, in words. The whole instruction. */
  brief: L;
  /**
   * What the trainer will look for, said plainly and in advance.
   *
   * Not a mark scheme — nothing here is scored. It exists so a learner is not
   * guessing, and so two trainers reading two submissions are reading them
   * against the same thing.
   */
  looksLike: LList;
  /** Shortest useful answer, in characters. Below this it is not the thing. */
  minChars: number;
  /** The ceiling. A textarea with no limit is a row nobody can read. */
  maxChars: number;
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
  /** Optional, and absent from almost every course. See PracticalTask. */
  practical?: PracticalTask;
};
