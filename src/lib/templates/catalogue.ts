import type { Template } from './types';

/**
 * The association's printable forms.
 *
 * Every one of these was being kept in somebody's head or in a WhatsApp
 * message before. A volunteer running their first activity had no attendance
 * sheet, so attendance came back as a photograph of a list on lined paper
 * with no date on it — which is why the hours ledger has never had a single
 * entry to verify.
 *
 * Authored as data, printed to A4. Print rather than a generated PDF for the
 * same reason the certificate does it: every browser prints to PDF, the type
 * stays vector at any size, and there is no library to keep alive.
 *
 * Four of these are drafts a specialist has to approve. They are here so the
 * work is visible and so nobody writes a fifth version of the same form in a
 * hurry — but the library will not print them. See ReviewState in types.ts.
 */

const L = (ar: string, en: string) => ({ ar, en });

export const TEMPLATES: Template[] = [
  // ------------------------------------------------------------- planning
  {
    slug: 'activity-plan',
    title: L('خطة نشاط', 'Activity plan'),
    purpose: L(
      'ما الذي سيحدث، ومن المسؤول، وماذا يلزم — على ورقة واحدة قبل يوم النشاط.',
      'What happens, who is responsible, and what is needed — on one page before the day.',
    ),
    course: 'events-management',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('الأساسيات', 'The basics'),
        fields: [
          { kind: 'line', label: L('اسم النشاط', 'Activity name'), width: 8 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 4 },
          { kind: 'line', label: L('المكان', 'Location'), width: 6 },
          { kind: 'line', label: L('من الساعة — إلى الساعة', 'From — to'), width: 3 },
          { kind: 'line', label: L('عدد المشاركين المتوقّع', 'Expected participants'), width: 3 },
          { kind: 'line', label: L('المسؤول عن النشاط', 'Activity lead'), width: 6 },
          { kind: 'line', label: L('رقم للتواصل يوم النشاط', 'Contact number on the day'), width: 6 },
        ],
      },
      {
        title: L('الهدف', 'The point of it'),
        lede: L(
          'جملة واحدة. إذا لم تستطع كتابتها، فالنشاط ليس جاهزاً بعد.',
          'One sentence. If you cannot write it, the activity is not ready.',
        ),
        fields: [
          { kind: 'box', label: L('ما الذي سيكون مختلفاً بعد هذا النشاط؟', 'What will be different afterwards?'), lines: 2 },
        ],
      },
      {
        title: L('الخطوات', 'The running order'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الوقت', 'Time'), width: 2 },
              { head: L('ماذا يحدث', 'What happens'), width: 6 },
              { head: L('من ينفّذ', 'Who runs it'), width: 4 },
            ],
            rows: 5,
          },
        ],
      },
      {
        title: L('ما يلزم', 'What is needed'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('المادة أو المعدّة', 'Item'), width: 5 },
              { head: L('الكمية', 'Quantity'), width: 2 },
              { head: L('من يؤمّنها', 'Who brings it'), width: 3 },
              { head: L('✓', '✓'), width: 2 },
            ],
            rows: 3,
          },
        ],
      },
      {
        title: L('ما قد يسوء', 'What could go wrong'),
        lede: L(
          'اكتب اثنين على الأقل. النشاط الذي لا يمكن أن يسوء فيه شيء لم يُفكَّر فيه بعد.',
          'Write at least two. An activity where nothing could go wrong has not been thought about yet.',
        ),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الاحتمال', 'What could happen'), width: 6 },
              { head: L('ماذا نفعل عندها', 'What we do about it'), width: 6 },
            ],
            rows: 3,
          },
        ],
      },
      {
        title: L('الاعتماد', 'Sign-off'),
        fields: [{ kind: 'signoff', roles: [L('أعدّ الخطة', 'Prepared by'), L('اعتمدها', 'Approved by')] }],
      },
    ],
  },

  {
    slug: 'attendance-sheet',
    title: L('سجلّ حضور', 'Attendance sheet'),
    purpose: L(
      'من حضر فعلاً، وكم ساعة. هذه الورقة هي ما تُحتسب منه ساعات التطوّع.',
      'Who actually came, and for how long. This sheet is what volunteer hours are counted from.',
    ),
    course: 'documentation-and-reporting',
    review: 'ready',
    orientation: 'landscape',
    sections: [
      {
        title: L('النشاط', 'The activity'),
        fields: [
          { kind: 'line', label: L('اسم النشاط', 'Activity'), width: 6 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 3 },
          { kind: 'line', label: L('المكان', 'Location'), width: 3 },
        ],
      },
      {
        title: L('الحضور', 'Those present'),
        lede: L(
          'التوقيع عند الوصول والمغادرة، لا مرة واحدة في النهاية. الفرق بين الوقتين هو الساعات، ولا يمكن تقديره لاحقاً.',
          'Sign in on arrival and out on leaving, not once at the end. The gap between the two is the hours, and it cannot be estimated afterwards.',
        ),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('#', '#'), width: 1 },
              { head: L('الاسم', 'Name'), width: 4 },
              { head: L('رقم العضوية', 'Member no.'), width: 2 },
              { head: L('وصل', 'In'), width: 1 },
              { head: L('غادر', 'Out'), width: 1 },
              { head: L('التوقيع', 'Signature'), width: 3 },
            ],
            rows: 13,
          },
        ],
      },
      {
        title: L('التصديق', 'Confirmed by'),
        lede: L(
          'يوقّع المسؤول أنه رأى هؤلاء الأشخاص حاضرين. توقيعه هو ما يجعل الساعات قابلة للاعتماد.',
          'The lead signs that they saw these people there. That signature is what makes the hours countable.',
        ),
        fields: [{ kind: 'signoff', roles: [L('مسؤول النشاط', 'Activity lead')] }],
      },
    ],
  },

  {
    slug: 'activity-report',
    title: L('تقرير نشاط', 'Activity report'),
    purpose: L(
      'ماذا حدث فعلاً، بالأرقام وبما لا يظهر في الأرقام — بعد النشاط بيومين على الأكثر.',
      'What actually happened, in numbers and in what the numbers miss — within two days.',
    ),
    course: 'documentation-and-reporting',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('الأساسيات', 'The basics'),
        fields: [
          { kind: 'line', label: L('اسم النشاط', 'Activity'), width: 8 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 4 },
          { kind: 'line', label: L('المكان', 'Location'), width: 6 },
          { kind: 'line', label: L('كاتب التقرير', 'Written by'), width: 6 },
        ],
      },
      {
        title: L('الأرقام', 'The numbers'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('البند', 'Item'), width: 6 },
              { head: L('المخطّط', 'Planned'), width: 3 },
              { head: L('الفعلي', 'Actual'), width: 3 },
            ],
            rows: 3,
          },
          {
            kind: 'note',
            text: L(
              'اكتب المخطّط والفعلي معاً. الرقم الفعلي وحده لا يقول شيئاً؛ الفرق بينه وبين المتوقّع هو ما يُتعلَّم منه.',
              'Record both. The actual figure alone says nothing; the gap between it and what was expected is the part worth learning from.',
            ),
          },
        ],
      },
      {
        title: L('ما جرى', 'What happened'),
        fields: [
          { kind: 'box', label: L('وصف مختصر لسير النشاط', 'A short account of how it went'), lines: 3 },
        ],
      },
      {
        title: L('ما سار جيداً وما لم يسر', 'What worked and what did not'),
        fields: [
          { kind: 'box', label: L('ما سار جيداً ويستحق التكرار', 'What worked and is worth repeating'), lines: 2 },
          { kind: 'box', label: L('ما لم يسر، وما سببه', 'What did not, and why'), lines: 2 },
        ],
      },
      {
        title: L('ما يحتاج متابعة', 'Needing follow-up'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الأمر', 'Item'), width: 6 },
              { head: L('المسؤول', 'Who'), width: 3 },
              { head: L('المهلة', 'By when'), width: 3 },
            ],
            rows: 3,
          },
        ],
      },
      {
        title: L('الاعتماد', 'Sign-off'),
        fields: [{ kind: 'signoff', roles: [L('كاتب التقرير', 'Reported by'), L('المشرف', 'Supervisor')] }],
      },
    ],
  },

  {
    slug: 'after-action-review',
    title: L('مراجعة ما بعد النشاط', 'After-action review'),
    purpose: L(
      'اجتماع قصير مع الفريق بعد النشاط. أربعة أسئلة، ولا لوم على أحد.',
      'A short session with the team afterwards. Four questions, and nobody is blamed.',
    ),
    course: 'meetings-and-facilitation',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('الجلسة', 'The session'),
        fields: [
          { kind: 'line', label: L('النشاط الذي نراجعه', 'Activity being reviewed'), width: 8 },
          { kind: 'line', label: L('تاريخ الجلسة', 'Date of session'), width: 4 },
          { kind: 'line', label: L('الحاضرون', 'Present'), width: 12 },
        ],
      },
      {
        title: L('الأسئلة الأربعة', 'The four questions'),
        lede: L(
          'بهذا الترتيب تحديداً. البدء بما ساء يجعل الجلسة دفاعية ويتوقّف الناس عن الكلام.',
          'In this order. Starting with what went wrong makes the session defensive and people stop talking.',
        ),
        fields: [
          { kind: 'box', label: L('١. ماذا كان من المفترض أن يحدث؟', '1. What was supposed to happen?'), lines: 3 },
          { kind: 'box', label: L('٢. ماذا حدث فعلاً؟', '2. What actually happened?'), lines: 3 },
          { kind: 'box', label: L('٣. لماذا الفرق؟', '3. Why the difference?'), lines: 4 },
          { kind: 'box', label: L('٤. ماذا نغيّر في المرة القادمة؟', '4. What do we change next time?'), lines: 4 },
        ],
      },
      {
        title: L('القرارات', 'What was decided'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('القرار', 'Decision'), width: 6 },
              { head: L('المسؤول', 'Who'), width: 3 },
              { head: L('المهلة', 'By when'), width: 3 },
            ],
            rows: 4,
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- meetings
  {
    slug: 'meeting-agenda',
    title: L('جدول أعمال اجتماع', 'Meeting agenda'),
    purpose: L(
      'يُرسل قبل الاجتماع لا في بدايته. لكل بند وقت ومالك وقرار مطلوب.',
      'Sent before the meeting, not handed out at it. Every item has a time, an owner and a decision to reach.',
    ),
    course: 'meetings-and-facilitation',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('الاجتماع', 'The meeting'),
        fields: [
          { kind: 'line', label: L('الموضوع', 'Subject'), width: 8 },
          { kind: 'line', label: L('التاريخ والساعة', 'Date and time'), width: 4 },
          { kind: 'line', label: L('المكان أو الرابط', 'Place or link'), width: 6 },
          { kind: 'line', label: L('المدة', 'Length'), width: 2 },
          { kind: 'line', label: L('من يدير الاجتماع', 'Chair'), width: 4 },
        ],
      },
      {
        title: L('ما يجب أن يكون صحيحاً في النهاية', 'What must be true at the end'),
        lede: L(
          'إذا لم تستطع كتابة هذا بجملة، فأنت لا تحتاج اجتماعاً — تحتاج رسالة أو قراراً تتّخذه وحدك.',
          'If you cannot write this in a sentence, you do not need a meeting — you need an email or a decision you make yourself.',
        ),
        fields: [{ kind: 'box', label: L('الهدف', 'Purpose'), lines: 2 }],
      },
      {
        title: L('البنود', 'The items'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الوقت', 'Time'), width: 2 },
              { head: L('البند', 'Item'), width: 4 },
              { head: L('من يعرضه', 'Led by'), width: 3 },
              { head: L('المطلوب: قرار / نقاش / علم', 'Decide / discuss / note'), width: 3 },
            ],
            rows: 8,
          },
        ],
      },
      {
        title: L('ما يجب أن يقرأه الحاضرون قبل الاجتماع', 'To read beforehand'),
        fields: [{ kind: 'box', label: L('المرفقات والمستندات', 'Attachments and documents'), lines: 3 }],
      },
    ],
  },

  {
    slug: 'meeting-minutes',
    title: L('محضر اجتماع', 'Meeting minutes'),
    purpose: L(
      'ما قُرِّر ومن يفعل ماذا ومتى. لا نقل حرفي للنقاش — المحضر الذي يعيد كل كلمة لا يقرأه أحد.',
      'What was decided, who does what, and when. Not a transcript — minutes that repeat every word go unread.',
    ),
    course: 'meetings-and-facilitation',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('الاجتماع', 'The meeting'),
        fields: [
          { kind: 'line', label: L('الموضوع', 'Subject'), width: 8 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 4 },
          { kind: 'line', label: L('الحاضرون', 'Present'), width: 12 },
          { kind: 'line', label: L('المعتذرون', 'Apologies'), width: 12 },
          { kind: 'line', label: L('كاتب المحضر', 'Minuted by'), width: 6 },
        ],
      },
      {
        title: L('القرارات', 'Decisions'),
        lede: L(
          'القرار جملة تبدأ بفعل. «ناقشنا الميزانية» ليس قراراً.',
          'A decision is a sentence with a verb in it. "We discussed the budget" is not one.',
        ),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('#', '#'), width: 1 },
              { head: L('القرار', 'Decision'), width: 11 },
            ],
            rows: 5,
          },
        ],
      },
      {
        title: L('المهام', 'Actions'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('المهمة', 'Action'), width: 6 },
              { head: L('المسؤول', 'Owner'), width: 3 },
              { head: L('المهلة', 'By when'), width: 3 },
            ],
            rows: 6,
          },
        ],
      },
      {
        title: L('ما أُجّل', 'Carried over'),
        fields: [{ kind: 'box', label: L('بنود لم يُبتّ فيها وسبب التأجيل', 'Items not settled, and why'), lines: 3 }],
      },
      {
        title: L('الاجتماع القادم', 'Next meeting'),
        fields: [{ kind: 'line', label: L('التاريخ والمكان', 'Date and place'), width: 12 }],
      },
    ],
  },

  // -------------------------------------------------------------- project
  {
    slug: 'project-plan',
    title: L('خطة مشروع مبسّطة', 'Simple project plan'),
    purpose: L(
      'صفحة واحدة تسبق أي مشروع: ما نحاول تغييره، وكيف نعرف أننا نجحنا.',
      'One page before any project: what we are trying to change, and how we will know it worked.',
    ),
    course: 'project-management',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('المشروع', 'The project'),
        fields: [
          { kind: 'line', label: L('الاسم', 'Name'), width: 8 },
          { kind: 'line', label: L('المسؤول', 'Lead'), width: 4 },
          { kind: 'line', label: L('يبدأ في', 'Starts'), width: 3 },
          { kind: 'line', label: L('ينتهي في', 'Ends'), width: 3 },
          { kind: 'line', label: L('الفئة المستهدفة', 'Who it is for'), width: 6 },
        ],
      },
      {
        title: L('المشكلة', 'The problem'),
        fields: [
          { kind: 'box', label: L('ما المشكلة، وكيف نعرف أنها موجودة؟', 'What is the problem, and how do we know it exists?'), lines: 4 },
        ],
      },
      {
        title: L('النجاح', 'Success'),
        lede: L(
          'رقم أو حالة يمكن التحقّق منها. «رفع الوعي» ليس مؤشراً — لا يمكن قياسه ولا نفيه.',
          'A number or a state you can check. "Raising awareness" is not an indicator — it cannot be measured or disproved.',
        ),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('المؤشّر', 'Indicator'), width: 5 },
              { head: L('الوضع الآن', 'Where it is now'), width: 3 },
              { head: L('الهدف', 'Target'), width: 2 },
              { head: L('كيف نقيسه', 'How measured'), width: 2 },
            ],
            rows: 4,
          },
        ],
      },
      {
        title: L('المراحل', 'The stages'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('المرحلة', 'Stage'), width: 5 },
              { head: L('تنتهي في', 'Done by'), width: 3 },
              { head: L('المسؤول', 'Owner'), width: 4 },
            ],
            rows: 5,
          },
        ],
      },
      {
        title: L('ما نحتاجه ولا نملكه', 'What we need and do not have'),
        fields: [{ kind: 'box', label: L('موارد، أذونات، شركاء', 'Resources, permissions, partners'), lines: 3 }],
      },
      {
        title: L('الاعتماد', 'Sign-off'),
        fields: [{ kind: 'signoff', roles: [L('أعدّها', 'Prepared by'), L('اعتمدها', 'Approved by')] }],
      },
    ],
  },

  {
    slug: 'risk-register',
    title: L('سجلّ المخاطر', 'Risk register'),
    purpose: L(
      'ما قد يعطّل المشروع، وماذا سنفعل قبل أن يحدث لا بعده.',
      'What could derail the project, and what we do about it before rather than after.',
    ),
    course: 'project-management',
    review: 'ready',
    orientation: 'landscape',
    sections: [
      {
        title: L('المشروع', 'The project'),
        fields: [
          { kind: 'line', label: L('اسم المشروع', 'Project'), width: 8 },
          { kind: 'line', label: L('تاريخ آخر تحديث', 'Last updated'), width: 4 },
        ],
      },
      {
        title: L('المخاطر', 'The risks'),
        lede: L(
          'الاحتمال والأثر من ١ إلى ٣. ما مجموعه ٥ أو أكثر يحتاج إجراءً مكتوباً، لا انتباهاً فقط.',
          'Likelihood and impact from 1 to 3. Anything totalling 5 or more needs a written response, not just attention.',
        ),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الخطر', 'Risk'), width: 4 },
              { head: L('الاحتمال ١-٣', 'Likelihood 1-3'), width: 1 },
              { head: L('الأثر ١-٣', 'Impact 1-3'), width: 1 },
              { head: L('ماذا نفعل الآن', 'What we do now'), width: 4 },
              { head: L('المسؤول', 'Owner'), width: 2 },
            ],
            rows: 10,
          },
        ],
      },
    ],
  },

  {
    slug: 'budget-sheet',
    title: L('ورقة موازنة نشاط', 'Activity budget'),
    purpose: L(
      'المتوقّع والمصروف جنباً إلى جنب، ومكان لإثبات كل مبلغ.',
      'Expected and spent side by side, with somewhere to account for every figure.',
    ),
    course: 'project-management',
    review: 'ready',
    orientation: 'landscape',
    sections: [
      {
        title: L('النشاط', 'The activity'),
        fields: [
          { kind: 'line', label: L('اسم النشاط', 'Activity'), width: 6 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 3 },
          { kind: 'line', label: L('العملة', 'Currency'), width: 3 },
        ],
      },
      {
        title: L('البنود', 'Line items'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('البند', 'Item'), width: 4 },
              { head: L('المتوقّع', 'Budgeted'), width: 2 },
              { head: L('المصروف', 'Spent'), width: 2 },
              { head: L('الفرق', 'Difference'), width: 2 },
              { head: L('رقم الإيصال', 'Receipt no.'), width: 2 },
            ],
            rows: 12,
          },
          {
            kind: 'note',
            text: L(
              'كل مبلغ مصروف يحتاج إيصالاً أو تفسيراً مكتوباً لسبب غيابه. الصندوق الذي لا يُطابَق مرة واحدة لا يُطابَق أبداً.',
              'Every figure spent needs a receipt, or a written note of why there is not one. A float that goes unreconciled once is never reconciled.',
            ),
          },
        ],
      },
      {
        title: L('التصديق', 'Sign-off'),
        fields: [{ kind: 'signoff', roles: [L('أعدّها', 'Prepared by'), L('راجعها', 'Checked by')] }],
      },
    ],
  },

  {
    slug: 'stakeholder-map',
    title: L('خريطة أصحاب المصلحة', 'Stakeholder map'),
    purpose: L(
      'من يتأثّر بما نفعل، ومن يستطيع تعطيله، وماذا نحتاج من كلٍّ منهم.',
      'Who is affected by what we do, who can stop it, and what we need from each.',
    ),
    course: 'community-needs',
    review: 'ready',
    orientation: 'landscape',
    sections: [
      {
        title: L('المشروع أو النشاط', 'The project or activity'),
        fields: [{ kind: 'line', label: L('الاسم', 'Name'), width: 8 }, { kind: 'line', label: L('التاريخ', 'Date'), width: 4 }],
      },
      {
        title: L('الأطراف', 'The parties'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الطرف', 'Party'), width: 3 },
              { head: L('ما مصلحته في هذا', 'What their stake is'), width: 3 },
              { head: L('تأثيره: عالٍ / متوسط / منخفض', 'Influence: high / medium / low'), width: 2 },
              { head: L('ما نحتاجه منه', 'What we need from them'), width: 2 },
              { head: L('من يتواصل معه', 'Who talks to them'), width: 2 },
            ],
            rows: 9,
          },
        ],
      },
      {
        title: L('من نسيناه', 'Who we left out'),
        lede: L(
          'أصعب سؤال في هذه الورقة. الطرف الغائب عن الخريطة هو من يظهر في منتصف المشروع.',
          'The hardest question on this sheet. The party missing from the map is the one who appears half way through.',
        ),
        fields: [{ kind: 'box', label: L('من لم نضعه، ولماذا', 'Who is not here, and why'), lines: 2 }],
      },
    ],
  },

  {
    slug: 'needs-assessment-interview',
    title: L('دليل مقابلة لتقييم الاحتياجات', 'Needs assessment interview guide'),
    purpose: L(
      'أسئلة مفتوحة ومكان لتدوين ما يُقال — ولما لا يُقال.',
      'Open questions and somewhere to record what is said, and what is not.',
    ),
    course: 'community-needs',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('المقابلة', 'The interview'),
        fields: [
          { kind: 'line', label: L('التاريخ', 'Date'), width: 3 },
          { kind: 'line', label: L('المكان', 'Place'), width: 4 },
          { kind: 'line', label: L('من أجرى المقابلة', 'Interviewer'), width: 5 },
          { kind: 'line', label: L('رمز المشارك (لا اسم)', 'Participant code (not a name)'), width: 4, hint: L('استخدم رمزاً. الاسم يُحفظ منفصلاً إن لزم.', 'Use a code. Any name is kept separately if needed at all.') },
        ],
      },
      {
        title: L('قبل أن تبدأ', 'Before you start'),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('شرحت من نحن ولماذا نسأل', 'Explained who we are and why we are asking'),
              L('قلت إن المشاركة اختيارية وإن بالإمكان التوقّف في أي لحظة', 'Said taking part is voluntary and they can stop at any point'),
              L('قلت ماذا سيحدث بما يقولونه ومن سيراه', 'Said what happens to what they say and who sees it'),
              L('لم أعد بشيء لا أستطيع الوفاء به', 'Made no promise I cannot keep'),
            ],
          },
        ],
      },
      {
        title: L('الأسئلة', 'The questions'),
        lede: L(
          'اسأل ثم اصمت. الصمت بعد السؤال هو ما يجعل الشخص يُكمل.',
          'Ask, then stop talking. The silence after the question is what makes someone go on.',
        ),
        fields: [
          { kind: 'box', label: L('كيف تسير الأمور هذه الأيام؟', 'How are things at the moment?'), lines: 4 },
          { kind: 'box', label: L('ما أصعب شيء تواجهونه؟', 'What is the hardest thing you are dealing with?'), lines: 4 },
          { kind: 'box', label: L('ماذا جرّبتم؟ وماذا نفع؟', 'What have you tried? What helped?'), lines: 4 },
          { kind: 'box', label: L('لو تغيّر شيء واحد، ما هو؟', 'If one thing changed, what would it be?'), lines: 3 },
          { kind: 'box', label: L('من غيركم يواجه هذا ولا نعرف عنه؟', 'Who else is dealing with this that we do not know about?'), lines: 4 },
        ],
      },
      {
        title: L('ما لم يُقل', 'What was not said'),
        fields: [
          { kind: 'box', label: L('تردّد، تغيير موضوع، صمت — دوّنه هنا', 'Hesitation, changing the subject, silence — note it here'), lines: 5 },
        ],
      },
    ],
  },

  {
    slug: 'handover-note',
    title: L('مذكّرة تسليم', 'Handover note'),
    purpose: L(
      'حين ينتقل نشاط أو ملف من شخص إلى آخر — ما يعرفه الأول ولا يعرفه الثاني.',
      'When an activity or a file passes from one person to another — what the first knows and the second does not.',
    ),
    course: 'teamwork',
    review: 'ready',
    orientation: 'portrait',
    sections: [
      {
        title: L('التسليم', 'The handover'),
        fields: [
          { kind: 'line', label: L('ما يُسلَّم', 'What is being handed over'), width: 8 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 4 },
          { kind: 'line', label: L('من', 'From'), width: 6 },
          { kind: 'line', label: L('إلى', 'To'), width: 6 },
        ],
      },
      {
        title: L('الوضع الحالي', 'Where things stand'),
        fields: [{ kind: 'box', label: L('ما أُنجز وما لم يُنجز', 'What is done and what is not'), lines: 4 }],
      },
      {
        title: L('ما ينتظر إجراءً', 'Waiting on something'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الأمر', 'Item'), width: 5 },
              { head: L('ينتظر ماذا أو من', 'Waiting on what or whom'), width: 4 },
              { head: L('المهلة', 'By when'), width: 3 },
            ],
            rows: 4,
          },
        ],
      },
      {
        title: L('الأشخاص', 'The people'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الاسم', 'Name'), width: 4 },
              { head: L('دوره في هذا الملف', 'Their part in this'), width: 5 },
              { head: L('كيف نصل إليه', 'How to reach them'), width: 3 },
            ],
            rows: 4,
          },
        ],
      },
      {
        title: L('ما لا يظهر في الأوراق', 'What is not written down anywhere'),
        lede: L(
          'أهم قسم في هذه الورقة. حساسيات، وعود شفهية، أمور جُرِّبت وفشلت.',
          'The most useful section here. Sensitivities, verbal promises, things already tried that did not work.',
        ),
        fields: [{ kind: 'box', label: L('ما يجب أن يعرفه من يستلم', 'What the person taking over needs to know'), lines: 4 }],
      },
      {
        title: L('التوقيع', 'Signed'),
        fields: [{ kind: 'signoff', roles: [L('المُسلِّم', 'Handing over'), L('المُستلِم', 'Taking over')] }],
      },
    ],
  },

  // --------------------------------------------------- awaiting specialist
  {
    slug: 'incident-report',
    title: L('تقرير حادثة', 'Incident report'),
    purpose: L(
      'ما وقع، ومتى، ومن أُبلغ — للحوادث التي تمسّ سلامة شخص.',
      'What happened, when, and who was told — for anything touching a person’s safety.',
    ),
    course: 'protecting-vulnerable',
    review: 'needs-review',
    reviewBecause: L(
      'نموذج الإبلاغ عن حادثة هو وثيقة سياسة حماية، لا استمارة تنظيمية. صيغته تحدّد ماذا يُسجَّل ومن يراه وكم يُحفظ، وقد تُستخدم لاحقاً في إجراء رسمي. يجب أن يعتمده مسؤول الحماية في الجمعية قبل أن يملأه أي متطوّع.',
      'An incident-report form is a safeguarding policy document, not an administrative one. Its wording decides what gets recorded, who sees it and how long it is kept, and it may be used in a formal process later. The association’s safeguarding lead must approve it before any volunteer fills one in.',
    ),
    orientation: 'portrait',
    sections: [],
  },

  {
    slug: 'safeguarding-referral',
    title: L('استمارة إحالة', 'Safeguarding referral'),
    purpose: L(
      'إحالة حالة إلى الجهة المختصة داخل الجمعية أو خارجها.',
      'Referring a case to the right person inside the association or outside it.',
    ),
    course: 'protecting-vulnerable',
    review: 'needs-review',
    reviewBecause: L(
      'مسار الإحالة يعتمد على من هي الجهة المختصة قانونياً في لبنان وعلى اتفاقات الجمعية معها، وهي معلومات لا يجوز افتراضها. تحديد المسار الخاطئ قد يؤخّر حماية طفل أو يكشف بياناته لمن لا يحقّ له.',
      'A referral route depends on which body is legally competent in Lebanon and on the association’s own arrangements with it — neither can be assumed. Getting the route wrong could delay protection for a child, or expose their details to someone with no right to them.',
    ),
    orientation: 'portrait',
    sections: [],
  },

  {
    slug: 'photo-consent',
    title: L('استمارة موافقة على التصوير', 'Photography consent'),
    purpose: L(
      'إذن مكتوب بالتقاط صورة ونشرها، ومدى هذا الإذن.',
      'Written permission to take a photograph and to publish it, and the limits of that permission.',
    ),
    course: 'media-and-content',
    review: 'needs-review',
    reviewBecause: L(
      'الموافقة على الصورة مسألة قانونية، وتزداد تعقيداً حين يكون المصوَّر طفلاً أو ناجياً من عنف. صياغة الإذن تحدّد ما يحقّ للجمعية نشره ولكم من الوقت وكيف يُسحب الإذن. تحتاج مراجعة قانونية، لا صياغة تقريبية.',
      'Consent to an image is a legal matter, and more so when the subject is a child or a survivor of violence. The wording decides what the association may publish, for how long, and how consent is withdrawn. This needs a legal review, not an approximation.',
    ),
    orientation: 'portrait',
    sections: [],
  },

  {
    slug: 'field-safety-checklist',
    title: L('قائمة تحقّق للسلامة الميدانية', 'Field safety checklist'),
    purpose: L(
      'ما يُتحقَّق منه قبل الخروج إلى الميدان.',
      'What gets checked before going out into the field.',
    ),
    course: 'field-safety',
    review: 'needs-review',
    reviewBecause: L(
      'قائمة السلامة يعتمد عليها الناس. البند الناقص فيها يُقرأ على أنه ليس مطلوباً، والقائمة التي تشمل الإسعاف الأولي تحتاج من يقرّها مهنياً — لا نموذجاً لغوياً. تُعرض هنا كي تكون نقطة بداية لمن سيراجعها.',
      'People rely on a safety list. An item missing from it reads as an item not required, and a list that touches first aid needs someone professionally qualified to sign it off — not a language model. It sits here as a starting point for whoever reviews it.',
    ),
    orientation: 'portrait',
    sections: [],
  },
];

export function templateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function printableTemplates(): Template[] {
  return TEMPLATES.filter((t) => t.review === 'ready');
}
