import type { CourseContent } from './types';
import { ORG, reportingContact } from '../org';

/**
 * Level 0 — the orientation. Mandatory, and nothing else opens until it is
 * passed at 80%.
 *
 * Two things make this course different from every other one.
 *
 * First, the reporting details are read from ORG rather than written into the
 * text. A volunteer who has just been told a child disclosed something to them
 * needs a name and a number that are correct today, not a name that was
 * correct when somebody wrote a paragraph. Change the person in org.ts and
 * every course follows.
 *
 * Second, the limitations of that arrangement are stated to the reader instead
 * of hidden. The association currently has one person in every safeguarding
 * role and one shared telephone line. Both are real constraints on how a
 * volunteer should report, so both are on the page. A course that implied a
 * private line and an independent second channel would be teaching something
 * that is not true, in the one course where being wrong reaches a child.
 *
 * Grounded in: the IFRC Volunteering Policy and Child Safeguarding Policy, the
 * Core Humanitarian Standard, the Keeping Children Safe International Child
 * Safeguarding Standards, and the UN's PSEA core principles. Nothing is quoted
 * from them; the obligations are restated in the words a volunteer in Tripoli
 * would actually use.
 */

const focal = reportingContact('safeguarding');
const hasEscalation = ORG.reporting.escalation !== null;

/** The reporting block, assembled from what the association has actually named. */
const REPORT_TO_AR = focal
  ? `مسؤولة الحماية في جمعية تكافل: ${focal.name} — ${focal.phone}. أبلغ في اليوم نفسه، مهما بدا القلق صغيراً أو غير مؤكّد. وإن تعذّر الوصول، تواصل مع الجمعية على ${ORG.email}.`
  : 'لم تُسمّ الجمعية بعد مسؤولاً للحماية. لا تعتبر هذه الدورة كافية قبل أن تفعل.';

const REPORT_TO_EN = focal
  ? `Takaful's safeguarding focal point: ${focal.name} — ${focal.phone}. Report the same day, however small or uncertain the concern seems. If you cannot get through, contact the association at ${ORG.email}.`
  : 'The association has not yet named a safeguarding focal point. Do not treat this course as sufficient until it has.';

export const codeOfConductAndReporting: CourseContent = {
  slug: 'code-of-conduct-and-reporting',
  level: 0,
  // Measured from the content below at roughly 700 Arabic characters a minute
  // plus two minutes a question, not aspired to.
  minutes: 30,
  // 80, not 70. Everything in this course is about somebody else's safety, and
  // a volunteer who gets a fifth of it wrong is still working with children.
  passMark: 80,
  title: {
    ar: 'مدوّنة السلوك والحماية وآلية الإبلاغ',
    en: 'Code of Conduct, Safeguarding and Reporting',
  },
  lede: {
    ar: 'الدورة التي تُفتح قبل كل شيء آخر. ما يُنتظر منك، أين تقف حدودك، كيف تحمي من تخدمهم وتحمي نفسك، ومتى وكيف تُبلّغ — بأسماء وأرقام حقيقية لا بعبارات عامة.',
    en: 'The course that opens before anything else. What is expected of you, where your limits are, how to protect the people you serve and yourself, and when and how to report — with real names and numbers rather than general phrases.',
  },
  outcomes: {
    ar: [
      'تلتزم بمدوّنة سلوك المتطوّع وتشرح سبب كل بند فيها',
      'تحدّد الحدود المهنية وتتعرّف على السلوك الذي يتجاوزها',
      'تطبّق مبدأ عدم الإضرار على قرار ميداني حقيقي',
      'تميّز بين الشكوى والحادث والحالة الطارئة، وتختار القناة الصحيحة لكلٍّ منها',
      'تُبلّغ عن مخاوف الحماية والاستغلال والتحرّش عبر القنوات الرسمية للجمعية',
    ],
    en: [
      'Follow the volunteer code of conduct and explain the reason behind each clause',
      'Identify professional boundaries and recognise behaviour that crosses them',
      'Apply the do-no-harm principle to a real field decision',
      'Distinguish a complaint from an incident from an emergency, and pick the right channel for each',
      'Report safeguarding, exploitation and harassment concerns through the association’s official channels',
    ],
  },
  sources: [
    'IFRC Volunteering Policy (August 2022)',
    'IFRC Child Safeguarding Policy',
    'International Child Safeguarding Standards — Keeping Children Safe',
    'Core Humanitarian Standard on Quality and Accountability (2024 edition)',
    'UN Protection from Sexual Exploitation and Abuse — core principles',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'why',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'لماذا توجد مدوّنة سلوك أصلاً', en: 'Why a code of conduct exists at all' },
      lede: {
        ar: 'ليست قائمة ممنوعات كُتبت لعدم الثقة بك. هي ما تعلّمته منظمات كثيرة بالطريقة الصعبة.',
        en: 'Not a list of prohibitions written because nobody trusts you. It is what a great many organisations learned the hard way.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'حين تتطوّع، تدخل بيوت الناس وحياتهم في لحظة يكونون فيها في أضعف أحوالهم. أنت تحمل شيئاً لا يملكونه: القرار بمن يحصل على المساعدة، والمعلومة عن أوضاعهم، وأحياناً الوصول إلى أطفالهم. هذا الفارق في القوة هو سبب وجود كل بند في هذه الدورة.',
            en: 'When you volunteer, you enter people’s homes and lives at a moment when they are at their least powerful. You hold something they do not: the decision about who receives help, information about their circumstances, and sometimes access to their children. That imbalance of power is the reason every clause in this course exists.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'المتطوّع الذي يسيء لا يبدأ عادةً بنيّة سيئة. يبدأ بخطوة صغيرة تبدو لطيفة — رقم هاتف يُعطى، وعد يُقطع، صورة تُلتقط، استثناء يُمنح لعائلة. المدوّنة تضع خطوطاً واضحة تحديداً لأن الخط الغامض يُعبَر من دون أن ينتبه أحد.',
            en: 'A volunteer who causes harm rarely starts with bad intent. They start with a small step that looks kind — a phone number given, a promise made, a photograph taken, an exception granted to one family. The code draws clear lines precisely because a vague one gets crossed without anyone noticing.',
          },
        },
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'أنت تمثّل الجمعية', en: 'You represent the association' },
              text: {
                ar: 'ما تفعله في الميدان يُنسب إلى تكافل، لا إليك وحدك. وثقة المجتمع تُبنى ببطء وتُكسر بحادثة واحدة.',
                en: 'What you do in the field is attributed to Takaful, not only to you. A community’s trust is built slowly and broken by a single incident.',
              },
            },
            {
              title: { ar: 'المدوّنة تحميك أنت أيضاً', en: 'The code protects you too' },
              text: {
                ar: 'الالتزام بقاعدة «لا تنفرد بطفل» يحمي الطفل، ويحميك من اتّهام لا تملك ما ينفيه.',
                en: 'Following the never-alone-with-a-child rule protects the child, and protects you from an allegation you would have no way to disprove.',
              },
            },
            {
              title: { ar: 'لا تُطبَّق بالنيّة', en: 'It is not judged by intent' },
              text: {
                ar: 'السؤال ليس «هل قصدت الأذى؟» بل «هل وقع الأذى؟». هذا ما يجعل القواعد قابلة للتطبيق.',
                en: 'The question is not "did you mean harm?" but "did harm occur?". That is what makes the rules usable.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: 'مبدأ عدم الإضرار', en: 'Do no harm' },
          content: {
            ar: 'أن تنوي الخير لا يكفي. النشاط الذي يجمع أطفالاً في مكان غير آمن، أو التوزيع الذي يخلق حسداً بين الجيران، أو الصورة التي تكشف هوية ناجٍ من عنف — كلها نوايا حسنة أنتجت ضرراً. اسأل قبل كل نشاط: من قد يتضرّر من هذا، حتى لو لم يكن مقصوداً؟',
            en: 'Meaning well is not enough. An activity that gathers children in an unsafe place, a distribution that breeds resentment between neighbours, a photograph that reveals the identity of a survivor of violence — all good intentions that produced harm. Ask before every activity: who could be hurt by this, even unintentionally?',
          },
        },
        {
          type: 'quiz',
          id: 'q-why-1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'متطوّع أعطى رقمه الشخصي لأمّ قالت إنها تحتاج مساعدة عاجلة خارج أوقات النشاط، بنيّة صادقة تماماً. ما المشكلة؟',
            en: 'A volunteer gave their personal number to a mother who said she needed urgent help outside activity hours, with entirely sincere intent. What is the problem?',
          },
          options: [
            {
              ar: 'لا مشكلة، لأنّ نيّته كانت المساعدة والأمّ هي من طلبت، وما دام لم يأخذ منها شيئاً فهو تطوّع إضافي من وقته',
              en: 'No problem — their intent was to help, the mother is the one who asked, and as long as they took nothing in return it is extra volunteering out of their own time',
            },
            {
              ar: 'أنشأ علاقة خارج إشراف الجمعية، ووعداً ضمنياً لا يستطيع الوفاء به، ولا سجلّ لما يجري',
              en: 'They created a relationship outside the association’s oversight, an implied promise they cannot keep, and no record of what happens next',
            },
            {
              ar: 'المشكلة فقط أنّه لم يخبر زميله، ولو أخبره لصار في الفريق من يعرف بالأمر ويشهد على ما جرى',
              en: 'The only problem is that they did not tell a colleague — had they done so, somebody on the team would know and could vouch for what happened',
            },
            {
              ar: 'كان عليه أن يعطي رقم الجمعية بدل رقمه، فتصل الأمّ إلى من يناوب على الخطّ في أيّ وقت',
              en: 'They should have given the association’s number instead, so the mother reaches whoever is on the line at any hour',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الخيار الرابع صحيح جزئياً وهو التصرّف العملي الصواب — لكنه ليس تشخيص المشكلة. النيّة الحسنة لا تلغي أن التواصل صار خارج أي إشراف أو توثيق، وأن الأمّ صارت تتوقّع منك ما لا تملكه. القاعدة: التواصل مع المستفيدين يمرّ عبر قنوات الجمعية، وما يحدث خارجها لا أحد يستطيع حمايتك أو حمايتهم فيه.',
            en: 'The fourth option is partly right and is the correct practical move — but it is not the diagnosis. Good intent does not change the fact that contact is now outside any oversight or record, and that the mother has come to expect something you do not have. The rule: contact with the people we serve goes through the association’s channels, and what happens outside them is where nobody can protect you or them.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'dignity',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'الكرامة والخصوصية', en: 'Dignity and privacy' },
      lede: {
        ar: 'المساعدة حقّ لا صدقة. الفرق بينهما يظهر في التفاصيل الصغيرة أكثر مما يظهر في السياسات.',
        en: 'Assistance is a right, not charity. The difference shows in small details far more than in policies.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'هذا جوهر المعيار الإنساني الأساسي: من يتلقّى المساعدة صاحب حقّ، لا شخص يُتفضَّل عليه. ما يعنيه عملياً أنه يُسأل ولا يُفترض عنه، ويُخبَر بمعايير الاستفادة بدل أن يخمّنها، ويستطيع أن يشتكي دون أن يخاف على مساعدته.',
            en: 'This is the heart of the Core Humanitarian Standard: a person receiving assistance holds a right, not a favour. In practice that means they are asked rather than assumed about, told the eligibility criteria rather than left to guess, and able to complain without fearing for their assistance.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ يحفظ الكرامة', en: '✔ Keeps dignity intact' },
          noTitle: { ar: '✘ يجرحها', en: '✘ Damages it' },
          yes: {
            ar: [
              'تسأل الأسرة أين تفضّل استلام الحصّة',
              'تشرح لماذا استفاد فلان ولم يستفد آخر',
              'تنادي الناس بأسمائهم لا بأرقامهم',
              'تنتظر إذناً قبل دخول غرفة',
              'تتحدّث إلى الشخص نفسه لا عنه أمامه',
            ],
            en: [
              'Asking a family where they would rather receive their parcel',
              'Explaining why one household qualified and another did not',
              'Calling people by their names, not their numbers',
              'Waiting to be invited before entering a room',
              'Speaking to a person rather than about them in front of them',
            ],
          },
          no: {
            ar: [
              'تصوير طابور الاستلام لأن الصورة «مؤثّرة»',
              'مناقشة وضع أسرة أمام أسرة أخرى',
              'وصف المستفيدين بـ«الحالات» أمامهم',
              'توزيع أمام المارّة من دون داعٍ',
              'الوعد بمساعدة قادمة لست متأكداً منها',
            ],
            en: [
              'Photographing the queue because the image is "powerful"',
              'Discussing one family’s circumstances in front of another',
              'Referring to people as "cases" within their hearing',
              'Distributing in public view when there is no need to',
              'Promising future help you are not certain of',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الخصوصية جزء من الكرامة. اسم المستفيد ووضعه الصحي وعدد أفراد أسرته ومكان سكنه معلومات تخصّه هو، وأنت مؤتمن عليها لا مالك لها. المعلومة تُشارك مع من يحتاجها لأداء عمله فقط — لا مع زميل فضولي، ولا في مجموعة واتساب، ولا في منشور.',
            en: 'Privacy is part of dignity. A person’s name, health situation, household size and address belong to them; you are entrusted with that information, not an owner of it. It is shared only with someone who needs it to do their job — not with a curious colleague, not in a WhatsApp group, not in a post.',
          },
        },
        {
          type: 'quiz',
          id: 'q-dignity-1',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          scenario: {
            ar: 'أثناء توزيع، تسألك امرأة لماذا حصلت جارتها على حصّة ولم تحصل هي. الجواب أن معايير هذه الدورة تشمل الأسر التي فيها طفل دون الخامسة.',
            en: 'During a distribution, a woman asks you why her neighbour received a parcel and she did not. The answer is that this round’s criteria cover households with a child under five.',
          },
          question: {
            ar: 'ما التصرّف الصحيح؟',
            en: 'What is the right response?',
          },
          options: [
            {
              ar: 'تعتذر وتقول إنّك لا تعرف المعايير، حتى لا تُحرج جارتها ولا تفتح نقاشاً في وسط التوزيع',
              en: 'Apologise and say you do not know the criteria, so as not to embarrass the neighbour or open up a discussion in the middle of a distribution',
            },
            {
              ar: 'تشرح المعيار المعلن بوضوح، وتدلّها على قناة الشكاوى إن رأت أنه طُبّق عليها خطأً',
              en: 'Explain the published criterion clearly, and point her to the complaints channel if she believes it was applied to her wrongly',
            },
            {
              ar: 'تشرح لها وضع جارتها حتى تفهم أنّها أحوج، فتقتنع بالقرار ولا تعود إلى الموضوع',
              en: 'Explain her neighbour’s circumstances so she understands the neighbour needed it more, accepts the decision and does not return to it',
            },
            {
              ar: 'تعدها بحصّة في التوزيع القادم حتى تنصرف الآن، وتتدبّر الأمر حين يحين موعده',
              en: 'Promise her a parcel in the next distribution so she leaves now, and work out how to manage it when the time comes',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الأول يجعل التوزيع يبدو عشوائياً ويغذّي الشعور بالظلم. الثالث يكشف بيانات جارتها وهو خرق للخصوصية مهما كانت النيّة. الرابع وعد لا تملكه. الشفافية عن المعيار — لا عن الأشخاص — هي ما يحفظ الكرامة والثقة معاً، وقناة الشكاوى موجودة تحديداً لهذه اللحظة.',
            en: 'The first makes the distribution look arbitrary and feeds a sense of injustice. The third discloses her neighbour’s data and is a privacy breach whatever the intent. The fourth is a promise that is not yours to make. Transparency about the criterion — not about individuals — is what protects dignity and trust together, and the complaints channel exists for exactly this moment.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'boundaries',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الحدود المهنية', en: 'Professional boundaries' },
      lede: {
        ar: 'أين ينتهي دورك. وهو سؤال يُطرح عليك في الميدان أكثر مما تتوقّع.',
        en: 'Where your role ends — a question the field will put to you more often than you expect.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'لا تنفرد بطفل أو بشخص معرّض للخطر في مكان مغلق أو بعيد عن النظر',
              'لا تعطِ رقمك الشخصي ولا تتواصل مع مستفيد عبر حساباتك الخاصة',
              'لا تزر بيت مستفيد وحدك ولا خارج إطار نشاط معلن',
              'لا تقدّم مالاً أو هدايا من جيبك لمستفيد بعينه',
              'لا تقدّم استشارة طبية أو نفسية أو قانونية — أحِل إلى مختص',
              'لا تعِد بشيء لا تملك أنت قرار تنفيذه',
              'لا تستخدم موقعك للحصول على أي منفعة، مهما صغرت',
            ],
            en: [
              'Never be alone with a child or a person at risk in a closed space or out of sight',
              'Never give out your personal number or contact someone we serve through your own accounts',
              'Never visit a household alone or outside a declared activity',
              'Never give money or gifts from your own pocket to a particular person',
              'Never give medical, psychological or legal advice — refer to someone qualified',
              'Never promise something the decision on which is not yours',
              'Never use your position to obtain any benefit, however small',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'العطاء الشخصي ليس لطفاً محايداً', en: 'Personal giving is not neutral kindness' },
          content: {
            ar: 'أن تدفع من جيبك لأسرة واحدة يبدو أفضل تصرّف ممكن في اللحظة. لكنه يخلق علاقة تبعية بينك وبين أسرة بعينها، ويجعل غيرها يشعر بالظلم، ويضع من بعدك في موقف من يُقارَن به. إن رأيت حاجة عاجلة، ارفعها للجمعية — هذا هو الطريق الذي يستطيع أن يستمرّ.',
            en: 'Paying out of your own pocket for one family feels like the best possible thing to do in the moment. But it creates a dependency between you and that particular household, leaves others feeling wronged, and puts whoever comes after you in the position of being compared. If you see an urgent need, raise it with the association — that is the route that can continue.',
          },
        },
        {
          type: 'quiz',
          id: 'q-bound-1',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'طفلة في العاشرة تعلّقت بك خلال نشاط. تنتظرك كل مرة، وطلبت رقمك «حتى تتكلّم معك لما تزعل».',
            en: 'A ten-year-old has grown attached to you during an activity. She waits for you every time, and has asked for your number "so she can talk to you when she is sad".',
          },
          question: { ar: 'ماذا تفعل؟', en: 'What do you do?' },
          options: [
            {
              ar: 'تعطيها رقم زميلة لتبقى على تواصل بأمان، وتطلب منها أن تُخبرك إن اتّصلت',
              en: 'Give her a colleague’s number so she can stay safely in touch, and ask that colleague to tell you if she rings',
            },
            {
              ar: 'ترفض بلطف، وتوزّع انتباهك على كل الأطفال، وتُخبر مسؤولة الحماية بشدّة تعلّقها',
              en: 'Decline kindly, spread your attention across all the children, and tell the safeguarding focal point about the strength of her attachment',
            },
            {
              ar: 'تتجنّبها تماماً في الأنشطة القادمة حتى ينقطع التعلّق من نفسه',
              en: 'Avoid her entirely in the coming activities until the attachment fades of its own accord',
            },
            {
              ar: 'تعطيها رقمك بشرط ألّا تتصل إلا نهاراً وأن تكون المكالمات قصيرة',
              en: 'Give her your number on condition that she only calls during the day and keeps the calls short',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'التواصل الشخصي مع طفل خارج النشاط ممنوع دائماً، وإعطاء رقم زميلة لا يغيّر شيئاً في ذلك. والتجنّب التام يؤذيها هو الآخر ويقول لها إن ارتباطها بشخص بالغ يُعاقب. التوازن الصحيح: دفء متساوٍ للجميع، حدود واضحة، وإخبار مسؤولة الحماية — لأن التعلّق الشديد قد يكون إشارة إلى حاجة أعمق في البيت لا إليك أنت.',
            en: 'Personal contact with a child outside the activity is always prohibited, and giving a colleague’s number changes nothing about that. Total avoidance harms her too, and teaches her that attaching to an adult gets punished. The right balance: equal warmth for everyone, clear boundaries, and telling the safeguarding focal point — because strong attachment can signal a deeper need at home rather than anything about you.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'psea',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: {
        ar: 'الحماية من الاستغلال والإساءة والتحرّش',
        en: 'Protection from exploitation, abuse and harassment',
      },
      lede: {
        ar: 'أصعب وحدة في الدورة، وأقلّها قابلية للتفاوض.',
        en: 'The hardest module in this course, and the least negotiable.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'الاستغلال الجنسي هو استغلال موقع القوة أو الثقة أو الحاجة للحصول على منفعة جنسية. الإساءة الجنسية هي أي اعتداء أو تهديد به. القواعد التالية مطلقة في العمل الإنساني، لا تحتمل استثناءً ولا تفسيراً ثقافياً ولا موافقة من الطرف الآخر.',
            en: 'Sexual exploitation is using a position of power, trust or another person’s need to obtain a sexual benefit. Sexual abuse is any assault or threat of one. The rules below are absolute in humanitarian work: no exception, no cultural interpretation, and no consent from the other party changes them.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'أي نشاط جنسي مع شخص دون الثامنة عشرة ممنوع، ولا يُعتدّ بأي ادّعاء عن العمر أو الموافقة',
              'أي مقابل جنسي لقاء مساعدة أو خدمة أو وظيفة أو وعد بها ممنوع منعاً باتّاً',
              'العلاقات مع المستفيدين ممنوعة، لأن فارق القوة يجعل الموافقة الحرّة غير ممكنة',
              'التحرّش بأي شكل — كلامي أو جسدي أو رقمي — ممنوع تجاه المستفيدين والزملاء على السواء',
              'التمييز بسبب الجنس أو الدين أو الجنسية أو الإعاقة أو الأصل ممنوع في الخدمة وفي الفريق',
              'من يعلم بمخالفة ولم يُبلّغ يتحمّل جزءاً من المسؤولية',
            ],
            en: [
              'Any sexual activity with a person under eighteen is prohibited, and no claim about age or consent is accepted',
              'Exchanging any sexual favour for assistance, a service, a job or the promise of one is absolutely prohibited',
              'Relationships with people we serve are prohibited, because the power gap makes free consent impossible',
              'Harassment of any kind — verbal, physical or digital — is prohibited towards those we serve and towards colleagues alike',
              'Discrimination on the basis of sex, religion, nationality, disability or origin is prohibited in service and within the team',
              'Anyone who knows of a breach and does not report it carries part of the responsibility',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'البند السادس هو الذي يُنسى', en: 'The sixth is the one that gets forgotten' },
          content: {
            ar: 'أغلب من يعرفون بمخالفة لا يُبلّغون، لا لأنهم يوافقون عليها بل لأنهم غير متأكدين، أو لا يريدون أذيّة زميل، أو يظنّون أن غيرهم سيتولّى الأمر. تقدير ما إذا كان القلق يستحقّ إجراءً ليس قرارك، ولا يُنتظر منك أن تكون متأكداً قبل أن تُبلّغ. المطلوب منك أن تنقل ما رأيت.',
            en: 'Most people who know of a breach do not report it — not because they approve, but because they are unsure, or do not want to harm a colleague, or assume someone else will handle it. Judging whether a concern warrants action is not your decision, and you are not expected to be certain before reporting. What is asked of you is to pass on what you saw.',
          },
        },
        {
          type: 'quiz',
          id: 'q-psea-1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'سمعت زميلاً يقول لشابة تنتظر في طابور التسجيل إنه «يقدر يسرّع معاملتها» إذا خرجت معه. هي ضحكت ولم تشتكِ. ماذا تفعل؟',
            en: 'You hear a colleague tell a young woman waiting in a registration queue that he "could speed things up for her" if she went out with him. She laughed and did not complain. What do you do?',
          },
          options: [
            {
              ar: 'لا شيء — هي لم تشتكِ وقد يكون يمزح، والتدخّل في مزحة قد يجعل الأمر أكبر ممّا هو',
              en: 'Nothing — she did not complain and he may have been joking, and stepping into a joke can make it bigger than it is',
            },
            {
              ar: 'تنبّهه على انفراد وتكتفي بذلك إن اعتذر، فالزميل يستحقّ فرصة قبل أن يصل اسمه إلى الجمعية',
              en: 'Warn him privately and leave it there if he apologises — a colleague deserves a chance before his name reaches the association',
            },
            {
              ar: 'تُبلّغ مسؤولة الحماية في اليوم نفسه، بغضّ النظر عن ردّ فعلها أو نيّته',
              en: 'Report to the safeguarding focal point the same day, regardless of her reaction or his intent',
            },
            {
              ar: 'تسألها أوّلاً إن كانت انزعجت، فإن قالت إنّها لم تنزعج فلا داعي لإزعاجها أكثر',
              en: 'Ask her first whether she was bothered, and if she says she was not there is no need to trouble her further',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'هذا عرض لمقابل جنسي لقاء خدمة، وهو من أخطر ما ورد في هذه الوحدة. ضحكها ليس موافقة — كثيراً ما تكون الضحكة وسيلة نجاة من موقف محرج أمام من يملك قرار معاملتها. والنيّة غير ذات صلة، والتنبيه الشخصي يترك الأمر بلا سجلّ ويترك من بعدها معرّضاً. القرار ليس قرارك: انقل ما سمعت.',
            en: 'That is an offer of a sexual favour in exchange for a service, among the gravest things in this module. Her laugh is not consent — a laugh is often how someone survives an awkward moment in front of a person who controls their paperwork. His intent is irrelevant, and a private warning leaves no record and leaves the next woman exposed. The judgement is not yours to make: pass on what you heard.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 5
    {
      id: 'data',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'البيانات والتصوير والموافقة', en: 'Data, photography and consent' },
      lede: {
        ar: 'ما تحمله على هاتفك عن الناس، وما يجوز أن تنشره عنهم.',
        en: 'What you carry about people on your phone, and what you may publish about them.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'لا تحتفظ بكشوف أسماء أو صور مستفيدين على هاتفك الشخصي بعد انتهاء المهمّة',
              'لا ترسل بيانات مستفيدين في مجموعة واتساب — المجموعة يقرأها من لا تعرف ولا تُحذف من أجهزتهم',
              'شارك الملف مع من يحتاجه لعمله فقط، عبر قناة الجمعية',
              'لا تستخدم اسم مستفيد أو صورته في حسابك الشخصي',
              'أبلغ فوراً إن ضاع هاتفك أو دفترك أو تسرّب ملف',
            ],
            en: [
              'Do not keep beneficiary name lists or photographs on your personal phone after the task ends',
              'Do not send beneficiary data into a WhatsApp group — a group is read by people you do not know and cannot be deleted from their devices',
              'Share a file only with whoever needs it for their work, through the association’s channel',
              'Do not use a person’s name or image on your personal account',
              'Report immediately if you lose your phone or notebook, or a file leaks',
            ],
          },
        },
        {
          type: 'text',
          content: {
            ar: 'الموافقة على التصوير ليست ابتسامة أمام الكاميرا. الموافقة الصحيحة أن يعرف الشخص أين ستُنشر الصورة ولماذا، وأن يعرف أن رفضه لن يؤثّر على مساعدته إطلاقاً، وأن يستطيع سحب موافقته لاحقاً. وللأطفال: موافقة وليّ الأمر، وموافقة الطفل نفسه، والاثنتان معاً لا إحداهما.',
            en: 'Consent to photography is not a smile at the camera. Real consent means the person knows where the image will appear and why, knows that refusing will not affect their assistance in any way, and can withdraw it later. For children: the guardian’s consent and the child’s own, both together rather than either one.',
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'صور لا تُنشر مهما كانت الموافقة', en: 'Images that are not published, whatever the consent' },
          content: {
            ar: 'وجه طفل في سياق حماية أو عنف، أو ناجٍ من اعتداء، أو شخص في لحظة انهيار أو عري أو إصابة، أو ما يكشف مكان سكن أسرة معرّضة للخطر. الموافقة لا تُلغي الضرر الذي قد يقع على صاحب الصورة بعد النشر، وهو لا يستطيع أن يتوقّعه كما تستطيع أنت.',
            en: 'A child’s face in a safeguarding or violence context, a survivor of assault, a person in a moment of collapse, undress or injury, or anything that reveals where an at-risk family lives. Consent does not cancel the harm that may reach the subject after publication, and they cannot foresee it the way you can.',
          },
        },
        {
          type: 'quiz',
          id: 'q-data-1',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: {
            ar: 'انتهى نشاط، وطلب منك المشرف أن ترسل كشف الحضور بأسماء الأطفال بسرعة. أسرع طريقة أمامك هي تصويره وإرساله في مجموعة الفريق على واتساب. ما التصرّف؟',
            en: 'An activity has ended and your supervisor asks you to send the attendance list of children’s names quickly. The fastest route available is to photograph it and post it in the team’s WhatsApp group. What do you do?',
          },
          options: [
            {
              ar: 'ترسله في المجموعة — كلّهم زملاء ومؤتمنون ووقّعوا على مدوّنة السلوك نفسها التي وقّعتها',
              en: 'Post it in the group — they are all trusted colleagues who signed the very same code of conduct that you signed',
            },
            {
              ar: 'ترسله للمشرف وحده عبر قناة الجمعية، وتحذف الصورة من هاتفك بعد التأكّد من الوصول',
              en: 'Send it to the supervisor alone through the association’s channel, and delete the photo from your phone once you have confirmed it arrived',
            },
            {
              ar: 'ترسله في المجموعة ثمّ تحذفه بعد دقائق، فحذف الرسالة يسحبها من عند الجميع قبل أن ينتبه أحد لوجودها',
              en: 'Post it in the group and then delete it after a few minutes — deleting a message takes it back from everyone before anybody has had time to notice it',
            },
            {
              ar: 'تكتب الأسماء نصّاً بدل الصورة في المجموعة نفسها، فالنصّ لا يُحفظ في معرض صور أحد',
              en: 'Type the names as text in the same group instead of a photo, since text is not saved into anybody’s picture gallery',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الحذف من المجموعة لا يحذف ما نُسخ أو حُفظ على أجهزة الآخرين، والمجموعة نفسها قد تضمّ من غادر الفريق. وكتابة الأسماء نصّاً لا تغيّر شيئاً — المشكلة في الوجهة لا في الصيغة. الوجهة الصحيحة واحدة: من يحتاج المعلومة لعمله، عبر قناة الجمعية، ثم تنظيف جهازك.',
            en: 'Deleting from a group does not delete what was copied or saved on other people’s devices, and the group itself may still include someone who has left the team. Typing the names changes nothing — the problem is the destination, not the format. There is one correct destination: the person who needs it for their work, through the association’s channel, then clear your own device.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 6
    {
      id: 'reporting',
      tag: { ar: 'الوحدة السادسة', en: 'Module 6' },
      title: { ar: 'الإبلاغ: متى وكيف ولمن', en: 'Reporting: when, how and to whom' },
      lede: {
        ar: 'الوحدة التي تجعل كل ما سبق قابلاً للتنفيذ. بأسماء وأرقام حقيقية.',
        en: 'The module that makes everything above actionable — with real names and numbers.',
      },
      blocks: [
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'شكوى', en: 'A complaint' },
              text: {
                ar: 'اعتراض على خدمة أو معاملة أو قرار. تُعالج ضمن أيام، وتُغلق بردّ يصل لصاحبها.',
                en: 'An objection to a service, a decision or how someone was treated. Handled within days, and closed with a reply that reaches the person.',
              },
            },
            {
              title: { ar: 'حادث', en: 'An incident' },
              text: {
                ar: 'شيء وقع فعلاً: إصابة، خرق للسلوك، ضياع بيانات، قلق على سلامة شخص. يُبلَّغ في اليوم نفسه.',
                en: 'Something that actually happened: an injury, a breach of conduct, lost data, a concern for someone’s safety. Reported the same day.',
              },
            },
            {
              title: { ar: 'حالة طارئة', en: 'An emergency' },
              text: {
                ar: 'خطر مباشر على حياة أو سلامة الآن. تتّصل بخدمات الطوارئ أولاً، ثم بالجمعية.',
                en: 'Immediate danger to life or safety, right now. Call the emergency services first, then the association.',
              },
            },
          ],
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: 'إلى من تُبلّغ', en: 'Who to report to' },
          content: { ar: REPORT_TO_AR, en: REPORT_TO_EN },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: {
            ar: 'حدّان يجب أن تعرفهما عن هذه القناة',
            en: 'Two limits you should know about this channel',
          },
          content: {
            ar: `الرقم أعلاه هو خطّ الجمعية العام وليس خطّاً مباشراً، فاختر مكاناً لا يُسمع فيه حديثك حين تُبلّغ. ${
              hasEscalation
                ? 'وإن كان قلقك يخصّ مسؤولة الحماية نفسها، فهناك جهة بديلة مسجّلة في سياسة الجمعية.'
                : 'ولم تُسمَّ بعد جهة ثانية للشكاوى التي تخصّ مسؤولة الحماية نفسها — في هذه الحالة توجّه إلى من هو أعلى منها في الجمعية مباشرةً، ولا تكتم الأمر.'
            }`,
            en: `The number above is the association’s general line rather than a direct one, so choose somewhere you cannot be overheard when you report. ${
              hasEscalation
                ? 'And if your concern is about the safeguarding focal point herself, an alternative contact is recorded in the association’s policy.'
                : 'No second contact has yet been named for a concern about the safeguarding focal point herself — in that case go directly to whoever is above her in the association, and do not sit on it.'
            }`,
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'دوّن ما رأيت أو سمعت بالوقائع: متى، أين، من كان حاضراً، وماذا قيل بالضبط',
              'لا تحقّق ولا تسأل الطفل أسئلة إضافية ولا تواجه من تشتبه به',
              'لا تعِد بالسرية — قل إنك ستُخبر من يستطيع المساعدة فقط',
              'أبلغ في اليوم نفسه عبر القناة أعلاه',
              'لا تناقش الأمر مع أحد آخر، ولو بحسن نيّة، ولو بلا أسماء',
            ],
            en: [
              'Write down what you saw or heard as facts: when, where, who was present, and what was said exactly',
              'Do not investigate, do not ask a child further questions, and do not confront the person you suspect',
              'Do not promise secrecy — say you will tell only the person who can help',
              'Report the same day through the channel above',
              'Do not discuss it with anyone else, even in good faith, even without names',
            ],
          },
        },
        {
          type: 'quiz',
          id: 'q-report-1',
          label: { ar: 'سيناريو حسّاس', en: 'A difficult scenario' },
          scenario: {
            ar: 'طفل يقول لك أثناء نشاط: «ما بدي ارجع عالبيت.» ويبدو خائفاً. سألك ألّا تخبر أحداً.',
            en: 'During an activity a child says to you: "I don’t want to go home," and looks frightened. He asks you not to tell anyone.',
          },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right response?' },
          options: [
            {
              ar: 'تعده بألّا تخبر أحداً حتى يثق بك ويكمل كلامه، ثمّ تُبلّغ بعد أن ينتهي',
              en: 'Promise not to tell anyone so that he trusts you and says more, and then report it once he has finished',
            },
            {
              ar: 'تسأله أسئلة هادئة لتعرف ما يحدث في البيت قبل أن تُبلّغ، حتى لا ترفع قلقاً ناقصاً',
              en: 'Ask him calm questions to find out what is happening at home before reporting, so you do not pass on an incomplete concern',
            },
            {
              ar: 'تطمئنه، وتقول إنك ستخبر شخصاً واحداً مهمّته مساعدته، وتدوّن كلامه كما قاله وتُبلّغ اليوم',
              en: 'Reassure him, tell him you will tell one person whose job is to help him, write down his words as he said them, and report today',
            },
            {
              ar: 'تخبر والدته لتفهم ما المشكلة، فهي أقرب الناس إليه وأعرفهم بأحواله',
              en: 'Tell his mother so you can understand the problem — she is the closest person to him and knows his circumstances best',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الوعد بالسرية وعد لا تستطيع الوفاء به، وكسره لاحقاً يعلّم الطفل ألّا يثق بالكبار مرّة أخرى. والأسئلة الإضافية تحقيق — وقد تُفسد أي إجراء رسمي لاحق وتُعيد على الطفل الحدث. وإخبار الأهل قد يكون إعادته إلى مصدر الخطر نفسه. الصياغة الصحيحة: «رح خبّر شخص واحد شغلته يساعدك.»',
            en: 'Promising secrecy is promising what you cannot deliver, and breaking it later teaches a child not to trust an adult again. Extra questions are an investigation — they can compromise any formal process later and make the child relive it. Telling the family may be returning him to the source of the danger. The right wording is: "I am going to tell one person whose job it is to help you."',
          },
        },
        {
          type: 'quiz',
          id: 'q-report-2',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ الحالات التالية «حالة طارئة» تبدأ فيها بالاتصال بخدمات الطوارئ قبل الجمعية؟',
            en: 'Which of the following is an emergency, where you call the emergency services before the association?',
          },
          options: [
            {
              ar: 'مستفيدة اشتكت الأسبوع الماضي من سوء معاملة متطوّع لها',
              en: 'A woman complained last week about the way a volunteer treated her',
            },
            {
              ar: 'ضاع دفتر فيه أسماء أطفال وأرقام أهاليهم',
              en: 'A notebook with children’s names and their parents’ numbers has been lost',
            },
            { ar: 'مشارك فقد وعيه أثناء النشاط الآن', en: 'A participant has lost consciousness during the activity, now' },
            {
              ar: 'متطوّع لم يلتزم بمهمّته مرّتين هذا الشهر',
              en: 'A volunteer has failed to do the task assigned to them twice this month',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الأولى شكوى، والثانية حادث يُبلَّغ اليوم نفسه، والرابعة مسألة إدارية. الثالثة وحدها خطر مباشر على الحياة الآن — وترتيب الاتصال ليس تفصيلاً: الدقائق الأولى هي ما يصنع الفرق، والجمعية تُبلَّغ بعد تأمين المصاب لا قبله.',
            en: 'The first is a complaint, the second an incident to report the same day, the fourth an administrative matter. Only the third is immediate danger to life right now — and the order of the calls is not a detail: the first minutes are what make the difference, and the association is told after the person is safe, not before.',
          },
        },
      ],
    },
  ],
};
