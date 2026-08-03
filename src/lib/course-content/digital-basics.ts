import type { CourseContent } from './types';

/**
 * Level 1 · Course 5 — Digital Basics for Volunteers.
 * Deliberately framed around what a volunteer actually needs: documenting,
 * coordinating, and protecting other people's data — not generic office training.
 * Status: DRAFT — requires review and approval before publication.
 */
export const digitalBasics: CourseContent = {
  slug: 'digital-basics',
  level: 1,
  minutes: 60,
  passMark: 70,
  title: { ar: 'المهارات الرقمية الأساسية', en: 'Digital Basics for Volunteers' },
  lede: {
    ar: 'الأدوات التي يحتاجها كل متطوّع فعلاً: التوثيق، والتنسيق، وحماية بيانات الناس. ليست دورة حاسوب عامة.',
    en: 'The tools a volunteer actually needs: documenting, coordinating, and protecting other people’s data. This is not a generic computer course.',
  },
  outcomes: {
    ar: [
      'توثّق نشاطاً بشكل يمكن الرجوع إليه بعد سنة',
      'تنظّم ملفاتك بأسماء وبنية يفهمها غيرك',
      'تستخدم جدول بيانات بسيط للحضور والأعداد',
      'تحمي بيانات المستفيدين على هاتفك وحاسوبك',
      'تتعرّف على محاولات الاحتيال والروابط الخبيثة',
      'تلتزم بقواعد استخدام وسائل التواصل كمتطوّع',
    ],
    en: [
      'Document an activity in a way that still makes sense a year later',
      'Organise files with names and structure others can follow',
      'Use a simple spreadsheet for attendance and counts',
      'Protect beneficiary data on your phone and computer',
      'Recognise scam attempts and malicious links',
      'Follow the rules for using social media as a volunteer',
    ],
  },
  sources: [
    'Core Humanitarian Standard on Quality and Accountability (2024 edition) — data and accountability',
    'IFRC Volunteering Policy (August 2022) — volunteer conduct and confidentiality',
    'Do No Harm principle in humanitarian action',
  ],

  modules: [
    {
      id: 'documenting',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'التوثيق الذي ينفع لاحقاً', en: 'Documentation that is useful later' },
      lede: {
        ar: 'التوثيق ليس روتيناً إدارياً — هو ما يجعل عمل الجمعية قابلاً للإثبات أمام أي جهة.',
        en: 'Documentation is not administrative routine — it is what makes an organisation’s work provable to anyone who asks.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'اختبار بسيط لأي توثيق: لو قرأه شخص لم يحضر النشاط بعد سنة، هل يفهم ماذا حدث؟ إن كان الجواب لا، فالتوثيق ناقص مهما بدا مرتّباً.',
            en: 'A simple test for any record: if someone who was not there reads it a year from now, will they understand what happened? If not, the record is incomplete however tidy it looks.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'التاريخ والمكان ونوع النشاط — دائماً في الأعلى',
              'عدد المشاركين وعدد المستفيدين — رقمان مختلفان لا تخلط بينهما',
              'ما نُفّذ فعلاً، لا ما كان مخطّطاً',
              'ما تعثّر ولماذا — هذا أنفع جزء وأكثره إهمالاً',
              'أسماء المسؤولين عن النشاط',
              'الصور: تُسلَّم للمنظمة مع ذكر إن كان هناك إذن نشر',
            ],
            en: [
              'Date, place and activity type — always at the top',
              'Number of participants and number of beneficiaries — two different figures, never conflated',
              'What was actually delivered, not what was planned',
              'What went wrong and why — the most useful section and the most often skipped',
              'Names of those responsible for the activity',
              'Photos: handed to the organisation, noting whether publication consent exists',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ المشاركون ≠ المستفيدون', en: '⚠️ Participants ≠ beneficiaries' },
          content: {
            ar: 'إن وزّع ١٥ متطوّعاً حصصاً على ٨٠ أسرة، فالمشاركون ١٥ والمستفيدون ٨٠. الخلط بين الرقمين يُفسد تقارير المنظمة، وهو من أكثر الأخطاء شيوعاً في التوثيق الميداني.',
            en: 'If 15 volunteers distribute parcels to 80 families, participants are 15 and beneficiaries are 80. Conflating the two corrupts the organisation’s reporting, and it is one of the most common field-documentation errors.',
          },
        },
        {
          type: 'quiz',
          id: 'c5q1',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'أيّ تسمية ملف هي الأفضل لتقرير نشاط؟',
            en: 'Which file name is best for an activity report?',
          },
          options: [
            { ar: 'تقرير.docx', en: 'report.docx' },
            { ar: 'تقرير نهائي معدّل ٢ (نسخة أخيرة).docx', en: 'final report edited 2 (last version).docx' },
            {
              ar: '2026-03-15_توزيع-غذائي_طرابلس_تقرير.docx',
              en: '2026-03-15_food-distribution_tripoli_report.docx',
            },
            { ar: 'تقرير محمد.docx', en: 'mohamad report.docx' },
          ],
          correct: 2,
          feedback: {
            ar: 'التاريخ أولاً بصيغة سنة-شهر-يوم يجعل الملفات تترتّب زمنياً تلقائياً، ثم النشاط والمكان والنوع. أسماء مثل «نهائي معدّل ٢» تصبح بلا معنى خلال أسابيع، والاسم الشخصي لا يفيد من يبحث بعد سنة.',
            en: 'Date first in year-month-day order makes files sort chronologically by themselves, then activity, place and type. Names like “final edited 2” become meaningless within weeks, and a personal name helps nobody searching a year later.',
          },
        },
      ],
    },

    {
      id: 'data',
      tag: { ar: 'الوحدة الثانية · مهمّة', en: 'Module 2 · Important' },
      title: { ar: 'حماية بيانات الناس', en: 'Protecting people’s data' },
      lede: {
        ar: 'هاتفك يحمل أسماء وصوراً وظروف عائلات. هذه أمانة، لا محتوى.',
        en: 'Your phone carries names, images and family circumstances. That is a trust, not content.',
      },
      blocks: [
        {
          type: 'list',
          items: {
            ar: [
              'قفل شاشة على هاتفك وحاسوبك — بلا استثناء',
              'قوائم المستفيدين لا تُحفظ في هاتفك الشخصي بعد انتهاء المهمة',
              'لا تُرسل بيانات مستفيدين عبر تطبيقات دردشة شخصية',
              'لا تصوّر شاشة فيها أسماء أو أرقام لتشاركها',
              'احذف ما لم تعد تحتاجه — الاحتفاظ «للاحتياط» مخاطرة لا فائدة',
              'إن ضاع هاتفك وفيه بيانات، أبلغ المنظمة فوراً',
            ],
            en: [
              'A screen lock on your phone and computer — no exceptions',
              'Beneficiary lists are not kept on your personal phone after the task ends',
              'Never send beneficiary data through personal chat apps',
              'Never screenshot a screen containing names or numbers to share it',
              'Delete what you no longer need — keeping it “just in case” is risk without benefit',
              'If your phone is lost with data on it, tell the organisation immediately',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 لماذا هذا خطير فعلاً؟', en: '🛑 Why this genuinely matters' },
          content: {
            ar: 'قائمة أسماء عائلات تتلقّى مساعدة ليست مجرّد ملف. تسريبها قد يعرّض تلك العائلات للوصم في مجتمعها، أو للاستغلال، أو لخطر حقيقي في بعض السياقات. مبدأ «لا ضرر» يشمل بياناتهم كما يشمل أجسادهم.',
            en: 'A list of families receiving aid is not just a file. Leaking it can expose those families to stigma in their community, to exploitation, or in some contexts to real danger. Do No Harm covers their data as much as their persons.',
          },
        },
        {
          type: 'quiz',
          id: 'c5q2',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'أرسل لك زميل عبر واتساب صورة شاشة فيها قائمة أسماء وأرقام هواتف مستفيدين، وطلب أن تراجعها بسرعة.',
            en: 'A teammate sends you a WhatsApp screenshot showing a list of beneficiary names and phone numbers, asking you to check it quickly.',
          },
          options: [
            {
              ar: 'تراجعها وترد عليه، فالأمر عاجل والقائمة قصيرة',
              en: 'Review it and reply — it is urgent and the list is short',
            },
            {
              ar: 'تراجعها ثم تحذف الصورة من هاتفك',
              en: 'Review it, then delete the image from your phone',
            },
            {
              ar: 'تنبّهه أن هذه بيانات لا تُرسَل هكذا، وتطلب مراجعتها عبر القناة الرسمية، وتحذف الصورة',
              en: 'Tell him this data must not be sent this way, ask to review it through the official channel, and delete the image',
            },
            { ar: 'تتجاهل الرسالة', en: 'Ignore the message' },
          ],
          correct: 2,
          feedback: {
            ar: 'المراجعة والحذف تعالج نسختك أنت فقط، بينما الصورة باقية عند المرسِل وعلى خوادم التطبيق. التنبيه يوقف الممارسة من جذرها، والتجاهل يترك الخطأ يتكرّر مع غيرك.',
            en: 'Reviewing and deleting only handles your copy — the image still sits with the sender and on the app’s servers. Speaking up stops the practice at its root; ignoring it lets the same mistake repeat with someone else.',
          },
        },
      ],
    },

    {
      id: 'safety',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الأمان الرقمي ووسائل التواصل', en: 'Digital safety and social media' },
      lede: {
        ar: 'ما تنشره كمتطوّع يُقرأ كموقف من المنظمة، حتى لو كتبته من حسابك الشخصي.',
        en: 'What you post as a volunteer is read as the organisation’s position, even from your personal account.',
      },
      blocks: [
        {
          type: 'grid',
          items: [
            {
              title: { ar: 'الروابط المشبوهة', en: 'Suspicious links' },
              text: {
                ar: 'لا تفتح رابطاً من مصدر لا تعرفه، ولو وصلك من رقم يبدو مألوفاً.',
                en: 'Do not open a link from a source you do not know, even from a number that looks familiar.',
              },
            },
            {
              title: { ar: 'انتحال الصفة', en: 'Impersonation' },
              text: {
                ar: 'إن طلب أحد باسم المنظمة مالاً أو بيانات، تحقّق عبر القناة الرسمية قبل أي ردّ.',
                en: 'If someone claiming to be from the organisation asks for money or data, verify through the official channel before responding.',
              },
            },
            {
              title: { ar: 'كلمات المرور', en: 'Passwords' },
              text: {
                ar: 'لا تشارك كلمة مرور حساب المنظمة عبر الدردشة، ولا تستخدم كلمة واحدة لكل شيء.',
                en: 'Never share an organisation password over chat, and never reuse one password everywhere.',
              },
            },
            {
              title: { ar: 'النشر باسمك', en: 'Posting personally' },
              text: {
                ar: 'يمكنك مشاركة تجربتك، لكن دون بيانات مستفيدين ولا صور أطفال ولا مواقف سياسية باسم المنظمة.',
                en: 'You may share your experience, but never beneficiary data, images of children, or political positions in the organisation’s name.',
              },
            },
          ],
        },
        {
          type: 'quiz',
          id: 'c5q3',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'انتشر خبر على وسائل التواصل ينتقد توزيعاً قامت به منظمتك، وتشعر أن الخبر ظالم وتريد الردّ من حسابك الشخصي.',
            en: 'A post criticising a distribution your organisation ran is spreading, you feel it is unfair, and you want to reply from your personal account.',
          },
          options: [
            {
              ar: 'تردّ فوراً بالحقائق التي تعرفها لأنك كنت حاضراً',
              en: 'Reply at once with the facts you know — you were there',
            },
            {
              ar: 'تنقل الأمر إلى القائد أو الإدارة، ولا تردّ باسم المنظمة من حسابك',
              en: 'Escalate to the lead or management, and do not respond in the organisation’s name from your account',
            },
            { ar: 'تشارك الخبر مع تعليق ساخر', en: 'Share the post with a sarcastic comment' },
            { ar: 'تتجاهل تماماً ولا تخبر أحداً', en: 'Ignore it completely and tell no one' },
          ],
          correct: 1,
          feedback: {
            ar: 'حضورك لا يجعلك ناطقاً باسم المنظمة، والردّ الفردي — ولو بحقائق صحيحة — قد يصعّد الأمر أو يكشف تفاصيل لا يجوز نشرها. لكن التجاهل التام خطأ أيضاً: الإدارة يجب أن تعلم لتردّ بشكل منظّم.',
            en: 'Being present does not make you a spokesperson, and an individual reply — even with accurate facts — can escalate matters or expose details that should not be public. Complete silence is also wrong: management needs to know so they can respond properly.',
          },
        },
      ],
    },
  ],
};
