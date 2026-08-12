import type { CourseContent } from './types';

/**
 * Level 1 · Course 5 — Digital Basics for Volunteers.
 * Deliberately framed around what a volunteer actually needs: documenting,
 * coordinating, and protecting other people's data — not generic office training.
 *
 * Six modules, matching the length this course claims. It ran for a while at
 * three, which made "60 minutes" a promise the content did not keep.
 */
export const digitalBasics: CourseContent = {
  slug: 'digital-basics',
  level: 1,
  minutes: 25, // Measured from the content. See volunteering-foundations.
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
      'تسمّي ملفاتك وترتّبها بحيث يجدها غيرك بعد رحيلك',
      'تبني جدول حضور بسيط يصلح للتقارير لا للفوضى',
      'تصوّر وتنشر بموافقة، وتعرف متى لا تصوّر إطلاقاً',
    ],
    en: [
      'Document an activity in a way that still makes sense a year later',
      'Organise files with names and structure others can follow',
      'Use a simple spreadsheet for attendance and counts',
      'Protect beneficiary data on your phone and computer',
      'Recognise scam attempts and malicious links',
      'Follow the rules for using social media as a volunteer',
      'Name and arrange files so someone else can find them after you leave',
      'Build a simple attendance sheet that works for reports rather than against them',
      'Photograph and publish with consent, and know when not to photograph at all',
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

    {
      id: 'files',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'تسمية الملفات وترتيبها', en: 'Naming and arranging files' },
      lede: {
        ar: 'ملفّ اسمه «جديد ١» ليس ملفّاً — هو شيء سيبحث عنه أحدهم عشرين دقيقة بعد سنة.',
        en: 'A file called “new 1” is not a file — it is twenty minutes somebody will spend looking for it a year from now.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'أنت لا تسمّي الملف لنفسك اليوم، بل لزميل لا تعرفه سيفتح المجلّد بعد سنتين وأنت لست هناك ليسألك. القاعدة الوحيدة التي تحلّ معظم الفوضى: ابدأ بالتاريخ معكوساً — سنة ثم شهر ثم يوم — لأن الترتيب الأبجدي حينها يصبح ترتيباً زمنياً وحده.',
            en: 'You do not name a file for yourself today. You name it for a colleague you have never met who will open the folder in two years, with you no longer there to ask. The single rule that fixes most of the mess: start with the date backwards — year, then month, then day — because alphabetical order then sorts itself chronologically.',
          },
        },
        {
          type: 'compare',
          yesTitle: { ar: '✔ اسم يجده غيرك', en: '✔ A name someone else can find' },
          noTitle: { ar: '✘ اسم يضيع', en: '✘ A name that gets lost' },
          yes: {
            ar: [
              '2026-08-12-حضور-نشاط-طرابلس.xlsx',
              '2026-07-تقرير-شهري-التعليم.pdf',
              '2026-06-30-محضر-اجتماع-الفريق.docx',
              'استمارة-تسجيل-فارغة-v2.pdf',
            ],
            en: [
              '2026-08-12-attendance-tripoli-activity.xlsx',
              '2026-07-monthly-report-education.pdf',
              '2026-06-30-team-meeting-minutes.docx',
              'registration-form-blank-v2.pdf',
            ],
          },
          no: {
            ar: [
              'جديد ١.xlsx',
              'تقرير نهائي نهائي أخير.docx',
              'صورة واتساب ٢٠٢٦-٠٨-١٢ في ٤.٣٣.٥١ م.jpeg',
              'اسمه على سطح المكتب فقط ولا نسخة في مكان مشترك',
            ],
            en: [
              'new 1.xlsx',
              'final report final last.docx',
              'WhatsApp Image 2026-08-12 at 4.33.51 PM.jpeg',
              'sitting on a desktop only, with no copy anywhere shared',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: '⚠️ الملف الوحيد على جهازك ليس ملفاً', en: '⚠️ A file only on your device is not a file' },
          content: {
            ar: 'هاتف يُسرق، حاسوب يتعطّل، ومتطوّع يغادر. أي ملف يخصّ الجمعية يجب أن تكون له نسخة في المكان المشترك الذي تحدّده الجمعية، لا في مجلّد باسمك وحدك. وهذا لا يعني إرساله في مجموعة واتساب — المجموعة ليست أرشيفاً.',
            en: 'Phones are stolen, laptops fail, and volunteers move on. Any file belonging to the association needs a copy in whatever shared place the association nominates — not in a folder with only your name on it. That does not mean sending it to a WhatsApp group; a group chat is not an archive.',
          },
        },
        {
          type: 'quiz',
          id: 'c5q4',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'صوّرت استمارات حضور ورقية بهاتفك في نهاية النشاط. ما الأنسب؟',
            en: 'You photographed the paper attendance sheets with your phone at the end of the activity. What is most appropriate?',
          },
          options: [
            {
              ar: 'تتركها في معرض صور هاتفك حتى تحتاجها',
              en: 'Leave them in your phone’s photo gallery until you need them',
            },
            {
              ar: 'ترسلها في مجموعة الفريق ليراها الجميع',
              en: 'Send them to the team group so everyone can see',
            },
            {
              ar: 'ترفعها إلى المكان المشترك باسم يحمل التاريخ والنشاط، ثم تحذفها من هاتفك',
              en: 'Upload them to the shared place with a name carrying the date and activity, then delete them from your phone',
            },
            {
              ar: 'تحتفظ بها في هاتفك وترسل نسخة للقائد فقط',
              en: 'Keep them on your phone and send a copy to the lead only',
            },
          ],
          correct: 2,
          feedback: {
            ar: 'الاستمارات تحمل أسماء أشخاص، وأحياناً أرقام هواتفهم. بقاؤها في معرض الصور يعني أنها تُنسخ تلقائياً إلى أي خدمة سحابية شخصية وتظهر لأي شخص يتصفّح هاتفك. المجموعة أسوأ لأنها تنسخها إلى ثلاثين جهازاً. ارفع، سمِّ، ثم احذف من عندك — هذا ما يجعل البيانات في مكان واحد يُعرف من يصل إليه.',
            en: 'Those sheets carry people’s names and sometimes their phone numbers. Left in your gallery they sync automatically to a personal cloud account and show to anyone scrolling your phone. The group is worse: it copies them onto thirty devices. Upload, name, then delete your copy — that is what keeps the data in one place where access is known.',
          },
        },
      ],
    },

    {
      id: 'spreadsheets',
      tag: { ar: 'الوحدة الخامسة', en: 'Module 5' },
      title: { ar: 'جدول بيانات يخدمك', en: 'A spreadsheet that works for you' },
      lede: {
        ar: 'الجدول الجيّد لا يحتاج شرحاً. الجدول السيّئ يحتاج الشخص الذي بناه — وهو غالباً غير متاح.',
        en: 'A good spreadsheet needs no explanation. A bad one needs the person who built it, and they are usually unavailable.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'لست بحاجة إلى إتقان برنامج جداول. أنت بحاجة إلى بناء جدول يستطيع غيرك جمعه وفرزه وقراءته. وأكثر ما يمنع ذلك ليس نقص المهارة، بل عادات صغيرة: خلية فيها اسمان، تاريخ مكتوب بثلاث طرق، وأرقام مكتوبة كنصّ.',
            en: 'You do not need to master a spreadsheet program. You need to build a sheet somebody else can total, sort and read. What prevents that is rarely a lack of skill — it is small habits: two names in one cell, dates written three different ways, and numbers stored as text.',
          },
        },
        {
          type: 'ordered',
          items: {
            ar: [
              'سطر واحد للعناوين في الأعلى، ولا شيء فوقه — لا عنوان ولا شعار',
              'صفّ واحد لكل شخص أو حدث، ولا تدمج الخلايا أبداً',
              'معلومة واحدة في كل عمود: الاسم الأول في عمود، والعائلة في عمود',
              'التواريخ بصيغة واحدة في الملف كلّه: 2026-08-12',
              'الأرقام أرقام: اكتب 120 لا «120 دقيقة» — الوحدة تُكتب في عنوان العمود',
              'الخلية الفارغة تعني «لا نعرف»؛ إن كان الجواب صفراً فاكتب صفراً',
            ],
            en: [
              'One header row at the top and nothing above it — no title, no logo',
              'One row per person or event, and never merge cells',
              'One fact per column: first name in one column, family name in another',
              'One date format throughout the file: 2026-08-12',
              'Numbers as numbers: write 120, not “120 minutes” — the unit belongs in the column header',
              'An empty cell means “we do not know”; if the answer is zero, write zero',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'info',
          title: { ar: '💡 لماذا لا تُدمج الخلايا', en: '💡 Why merged cells are the enemy' },
          content: {
            ar: 'الخلايا المدموجة تبدو مرتّبة على الشاشة وتكسر الفرز والجمع والتصفية جميعاً. إن أردت إبراز شيء استخدم لوناً أو خطاً عريضاً — لا دمجاً. الجدول أداة حساب أولاً وورقة تصميم أخيراً.',
            en: 'Merged cells look tidy on screen and break sorting, totalling and filtering all at once. If you need to draw the eye, use colour or bold — not a merge. A sheet is a calculating tool first and a design surface last.',
          },
        },
        {
          type: 'quiz',
          id: 'c5q5',
          label: { ar: 'تحقّق من فهمك', en: 'Check your understanding' },
          question: {
            ar: 'طُلب منك جدول حضور شهري لثلاثة أنشطة. ما البنية الأنسب؟',
            en: 'You are asked for a monthly attendance sheet covering three activities. Which structure is best?',
          },
          options: [
            {
              ar: 'ثلاثة ملفات منفصلة، ملفّ لكل نشاط، بأسماء مختلفة الصيغة',
              en: 'Three separate files, one per activity, named in different styles',
            },
            {
              ar: 'ملفّ واحد، صفّ لكل حضور، وأعمدة: التاريخ، النشاط، الاسم، العائلة، الدقائق',
              en: 'One file, one row per attendance, with columns: date, activity, first name, family name, minutes',
            },
            {
              ar: 'ملفّ واحد، ورقة لكل نشاط، وكل ورقة بترتيب أعمدة مختلف',
              en: 'One file, a tab per activity, each tab with a different column order',
            },
            {
              ar: 'ملفّ واحد فيه جدول لكل أسبوع مع عناوين مدموجة فوق كل جدول',
              en: 'One file with a table per week and merged headings above each table',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الصفّ الواحد لكل حضور يجعل الملف قابلاً للفرز والجمع بأي طريقة: حسب النشاط، أو الشخص، أو التاريخ، دون إعادة بناء. الملفات المنفصلة تعني جمعاً يدوياً في نهاية الشهر، والأوراق المختلفة الترتيب تعني أن كل تقرير يبدأ بتوحيدها، والعناوين المدموجة تكسر كل ذلك من البداية.',
            en: 'One row per attendance makes the file sortable and totallable any way you like — by activity, by person, by date — without rebuilding it. Separate files mean adding up by hand at month end, inconsistent tabs mean every report starts with reconciling them, and merged headings break all of it from the outset.',
          },
        },
      ],
    },

    {
      id: 'photos',
      tag: { ar: 'الوحدة السادسة · مهمّة', en: 'Module 6 · Important' },
      title: { ar: 'الصورة والموافقة', en: 'Photographs and consent' },
      lede: {
        ar: 'الصورة التي تنشرها اليوم تبقى على الإنترنت أطول ممّا يبقى المشروع، وأطول ممّا يبقى المصوَّر طفلاً.',
        en: 'A photograph you publish today outlives the project, and outlives the child in it being a child.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التصوير في العمل الإنساني ليس توثيقاً بريئاً دائماً. صورة أسرة تتلقّى مساعدة تُظهرها في أضعف لحظاتها أمام كل من يعرفها، وقد تلاحقها سنوات. القاعدة: الموافقة قبل الصورة، والموافقة على النشر منفصلة عن الموافقة على التصوير.',
            en: 'Photography in humanitarian work is not always innocent documentation. A picture of a family receiving aid shows them at their weakest to everyone who knows them, and can follow them for years. The rule: consent before the photograph, and consent to publish is a separate question from consent to be photographed.',
          },
        },
        {
          type: 'list',
          items: {
            ar: [
              'اطلب الإذن قبل أن ترفع الكاميرا، لا بعدها',
              'اشرح أين ستُنشر الصورة تحديداً — «للجمعية» ليست إجابة',
              'موافقة الطفل وحدها لا تكفي: يلزم إذن وليّه، والطفل نفسه له أن يرفض',
              'لا تصوّر أحداً وهو يتسلّم مساعدة إلّا بإذن صريح لهذه اللحظة تحديداً',
              'لا تصوّر داخل بيوت الناس أو في مراكز الإيواء دون ترتيب مسبق',
              '«لا» تعني لا، وتُحترم دون محاولة إقناع',
              'أعطِ صورة نشاط تُظهر العمل لا الحاجة: أيدٍ تعمل، لا وجوه تنتظر',
            ],
            en: [
              'Ask before the camera comes up, not after',
              'Say exactly where it will appear — “for the association” is not an answer',
              'A child’s agreement is not enough: their guardian must consent, and the child may still refuse',
              'Never photograph someone receiving assistance without explicit consent for that specific moment',
              'Do not photograph inside people’s homes or in shelters without prior arrangement',
              '“No” means no, and is respected without persuasion',
              'Prefer an image that shows the work rather than the need: hands working, not faces waiting',
            ],
          },
        },
        {
          type: 'callout',
          variant: 'stop',
          title: { ar: '🛑 صور الأطفال', en: '🛑 Photographs of children' },
          content: {
            ar: 'لا تُنشر صورة طفل مع اسمه ومكانه معاً أبداً. أيّ اثنين من هذه الثلاثة يكفيان لأن يجده شخص لا نريده أن يجده. وإن كان الطفل في وضع حماية — نزوح، فقدان أهل، إساءة — فلا صورة إطلاقاً، مهما كانت الموافقة.',
            en: 'Never publish a child’s photograph together with their name and their location. Any two of those three are enough for someone we do not want finding them to find them. And if the child is in a protection situation — displacement, loss of family, abuse — then no photograph at all, whatever consent was given.',
          },
        },
        {
          type: 'quiz',
          id: 'c5q6',
          label: { ar: 'سيناريو ميداني', en: 'Field scenario' },
          question: { ar: 'ما التصرّف الصحيح؟', en: 'What is the right action?' },
          scenario: {
            ar: 'التقطت صورة جميلة لطفل يرسم في نشاط، وأذن لك والده بالتصوير. تريد نشرها على صفحة الجمعية مع تعليق «سعيد في مركزنا في طرابلس».',
            en: 'You took a lovely photo of a child drawing at an activity, and his father agreed to the photograph. You want to post it on the association’s page captioned “Saeed at our centre in Tripoli”.',
          },
          options: [
            {
              ar: 'تنشرها كما هي — الإذن موجود والتعليق لطيف',
              en: 'Post it as it is — you have consent and the caption is warm',
            },
            {
              ar: 'تنشرها بلا اسم ولا تحديد للمكان، بعد التأكّد أن الإذن يشمل النشر لا التصوير فقط',
              en: 'Post it with no name and no specific location, after checking the consent covered publishing and not only photographing',
            },
            {
              ar: 'تنشرها باسمه وتحذف اسم المدينة',
              en: 'Post it with his name and drop the city',
            },
            {
              ar: 'ترسلها في مجموعة المتطوّعين بدل الصفحة العامة',
              en: 'Send it to the volunteers’ group instead of the public page',
            },
          ],
          correct: 1,
          feedback: {
            ar: 'الإذن بالتصوير ليس إذناً بالنشر، وهذان سؤالان منفصلان يجب أن يُطرح كلّ منهما. والاسم مع المكان معاً يجعلان الطفل قابلاً للتحديد لأي شخص، وهذا بالضبط ما نتجنّبه. أما مجموعة المتطوّعين فليست أكثر أماناً — الصور تُعاد مشاركتها منها كما من أي مكان آخر.',
            en: 'Consent to be photographed is not consent to publish; those are two separate questions and each must be asked. A name together with a location makes the child identifiable to anyone, which is precisely what we avoid. And the volunteers’ group is no safer — pictures get forwarded out of it like anywhere else.',
          },
        },
      ],
    },
  ],
};
