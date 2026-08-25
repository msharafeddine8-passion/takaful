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
  | { type: 'reveal'; prompt: L; answer: L }
  /**
   * Pair each item with the one thing it goes with.
   *
   * Not `sort` with more buckets. A bucket takes many items and the reader
   * classifies; here every right belongs to exactly one left, so knowing three
   * of four should tell you the fourth and a misplaced pair costs two. That is
   * the shape of a term against its definition and of a problem against the
   * move that answers it, neither of which is a classification.
   */
  | {
      type: 'match';
      prompt: L;
      /**
       * Authored already paired: pairs[i].left goes with pairs[i].right. The
       * reader is given the rights in a different order, and the rows in
       * another again, so neither list can be read off against the other.
       */
      pairs: { left: L; right: L; because: L }[];
    }
  /**
   * A document somebody filed, and what is wrong with it.
   *
   * The exercise the reporting and safeguarding courses could not have. `sort`
   * asks the reader to classify every item, which tells them how many there
   * are of each kind before they start. Reviewing a form is the opposite job:
   * most of it is fine, nobody says how much is not, and the skill is noticing
   * at all. A report that names a child is not a wrong answer among four — it
   * is a line that reads perfectly normally until somebody looks.
   *
   * Every line carries a note, the sound ones included, because "this line is
   * fine" is a thing a reader can be wrong about in both directions.
   */
  | {
      type: 'review';
      prompt: L;
      /** What the document is, as it would be headed on paper. */
      docTitle: L;
      /**
       * In the order the form has them, and deliberately not shuffled: a form
       * whose fields move about is not a form, and the position of a line is
       * part of what makes it look unremarkable.
       */
      lines: { label: L; text: L; wrong?: boolean; note: L }[];
      /** What the whole document was trying to teach. Shown after marking. */
      afterword: L;
    }
  /**
   * A conversation, turn by turn: what you say changes what you hear next.
   *
   * `scenario` stops after one move, which is the wrong shape for the moment
   * this curriculum most needs practised. A child disclosing, somebody in
   * acute distress, a participant taking over a room — none of those is
   * decided by a single reply. The second thing you say is only available
   * because of the first, and the commonest failure is a reply that sounds
   * kind and closes the conversation.
   *
   * So a reply may end it. That is not a punishment; it is what would have
   * happened, and being shown the transcript stopping is the teaching.
   */
  | {
      type: 'dialogue';
      title: L;
      /** Who the reader is talking to, named on their lines. */
      speaker: L;
      /** What they say before the reader has said anything. */
      opening: L;
      /**
       * One entry per turn, in order. The context for a turn is whatever the
       * previous reply drew out of the other person, so the branch is in what
       * is said back rather than in which turn comes next — a tree of turns
       * would let an author write a node nothing reaches, and an unreachable
       * node is invisible in review.
       */
      turns: {
        replies: {
          text: L;
          /** What they say back to this. */
          says: L;
          /** Why, said to the reader rather than in the character's voice. */
          note: L;
          /** This reply closes the conversation. */
          ends?: boolean;
          /** What the association would say. At most one per turn. */
          best?: boolean;
        }[];
      }[];
      afterword: L;
    }
  /**
   * Build the entry out of its parts, one choice per part.
   *
   * Everything else here asks the reader to judge something already written.
   * This asks them to produce it, which is the actual job in the courses that
   * end in a document: an action item is not right or wrong as a whole, it is
   * missing an owner or missing a date. Slotting it together makes visible
   * which part a reader keeps leaving vague.
   */
  | {
      type: 'build';
      prompt: L;
      slots: {
        label: L;
        /** The right one first — the reader is given them shuffled. */
        options: L[];
        /** Why that one, and what the others were missing. */
        because: L;
      }[];
      /** The finished thing, said in prose. Shown once it is assembled right. */
      afterword: L;
    };

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
