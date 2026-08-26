import type { CourseContent } from './types';

export const environmentalVolunteering: CourseContent = {
  slug: 'environmental-volunteering',
  level: 0,
  minutes: 30,
  passMark: 70,
  title: {
    ar: 'التطوّع البيئي والعمل المناخي',
    en: 'Environmental Volunteering and Climate Action',
  },
  lede: {
    ar: 'التطوّع البيئي ليس فقط زراعة أشجار أو تنظيف شواطئ — بل منظومة عمل تُوازن بين التدخّل الفوري والتغيير السلوكي طويل الأمد.',
    en: 'Environmental volunteering is not just planting trees or cleaning beaches — it is a work system that balances immediate intervention and long-term behavioural change.',
  },
  outcomes: {
    ar: [
      'تُميّز أنواع التطوّع البيئي وتختار المناسب للسياق',
      'تُخطّط لتدخّل بيئي يُراعي الأثر الفعلي لا مجرّد النشاط',
      'تُدمج مبادئ الاستدامة في تصميم برامج التطوّع',
      'تتجنّب الأنماط الشائعة للعمل البيئي الذي يضرّ أكثر مما يُفيد',
    ],
    en: [
      'Distinguish types of environmental volunteering and choose the right one for the context',
      'Plan an environmental intervention that considers actual impact, not just activity',
      'Integrate sustainability principles into volunteer programme design',
      'Avoid common patterns of environmental work that harm more than help',
    ],
  },
  sources: [
    'IUCN — Volunteering for Nature: A Practical Guide for Conservation Managers',
    'Conservation Volunteers Australia — Environmental Volunteering Best Practices',
    'UNEP — State of the World\'s Volunteerism: Nature and Sustainability',
    'WWF — Community-Based Natural Resource Management Guidelines',
  ],

  modules: [
    // ---------------------------------------------------------------- 1
    {
      id: 'ev-types',
      tag: { ar: 'الوحدة الأولى', en: 'Module 1' },
      title: { ar: 'أنواع التطوّع البيئي وأثره', en: 'Types of environmental volunteering and their impact' },
      lede: {
        ar: 'ليس كل نشاط بيئي يُغيّر شيئاً فعلياً في البيئة — الفرق بين الفعل المؤثّر والنشاط الرمزي يستوجب تمييزاً.',
        en: 'Not every environmental activity actually changes something in the environment — the difference between impactful action and symbolic activity requires discernment.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'التطوّع البيئي يندرج تحت أربعة أنواع رئيسية:\n\n**الحفاظ المباشر:** تنظيف مواقع، زراعة أشجار، إزالة نباتات غازية. سريع الأثر لكن أثره يتلاشى بدون صيانة وتحوّل سلوكي.\n\n**الرصد والبيانات:** جمع بيانات بيولوجية، رصد تلوّث، مراقبة أنواع. يحتاج تدريباً لكنه يُغذّي القرارات العلمية والسياسات.\n\n**التوعية والتعليم:** ورش في المدارس، حملات في المجتمع، برامج شبابية. الأثر أبطأ لكنه أعمق إن صُمِّم بعناية.\n\n**الدفاع والسياسات:** العمل مع الجهات الرسمية للتأثير على قوانين ولوائح بيئية. الأعلى تأثيراً والأصعب نفاذاً.',
            en: 'Environmental volunteering falls under four main types:\n\n**Direct conservation:** site cleaning, tree planting, invasive species removal. Quick impact but it fades without maintenance and behavioural change.\n\n**Monitoring and data:** collecting biological data, pollution monitoring, species observation. Requires training but feeds scientific decisions and policies.\n\n**Awareness and education:** school workshops, community campaigns, youth programmes. Slower impact but deeper when carefully designed.\n\n**Advocacy and policies:** working with official bodies to influence environmental laws and regulations. Highest impact and hardest to access.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q1',
          label: { ar: 'سؤال ١', en: 'Question 1' },
          question: {
            ar: 'جمعيتك تُنظّم يوم تنظيف سنوي لشاطئ. بعد ثلاث سنوات، الشاطئ ذاته يعود للتلوّث بعد أسابيع. ما الاستنتاج؟',
            en: 'Your organisation organises an annual beach cleaning day. After three years, the same beach returns to pollution within weeks. What is the conclusion?',
          },
          options: [
            { ar: 'التنظيف وحده غير كافٍ — يحتاج تدخّلاً موازياً في السلوك: التوعية وإدارة النفايات في المصدر', en: 'Cleaning alone is insufficient — it needs a parallel intervention in behaviour: awareness and waste management at the source' },
            { ar: 'يجب تنظيم أيام تنظيف أكثر وأكبر — رفع الوتيرة إلى مرّة كل شهر بدل مرّة في السنة يسبق تراكم النفايات ويُبقي الشاطئ نظيفاً', en: 'More and larger cleaning days should be organised — raising the frequency to monthly instead of yearly outpaces the accumulation and keeps the beach clean' },
            { ar: 'الشاطئ غير قابل للإنقاذ في السياق الحالي — الأجدى نقل الجهد إلى موقع آخر أقلّ تلوّثاً يظهر فيه أثر التنظيف', en: 'The beach is unsalvageable in the current context — the effort is better moved to a less polluted site where the cleaning actually shows' },
          ],
          correct: 0,
          feedback: {
            ar: 'تنظيف المكان دون معالجة مصدر التلوّث هو علاج الأعراض — لا المرض. التدخّل البيئي المؤثّر يجمع الفعل المباشر مع التغيير السلوكي والمؤسّسي.',
            en: 'Cleaning the site without addressing the pollution source is treating symptoms — not the disease. An impactful environmental intervention combines direct action with behavioural and institutional change.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q2',
          label: { ar: 'سؤال ٢', en: 'Question 2' },
          question: {
            ar: 'منطقتك تعاني من تلوّث مائي متكرّر. أيّ التدخّلات يُحتمل أن يكون الأعمق أثراً على المدى البعيد؟',
            en: 'Your area suffers from recurring water pollution. Which intervention is most likely to have the deepest long-term impact?',
          },
          options: [
            { ar: 'رصد مستمرّ لجودة المياه وتوثيق مصادر التلوّث لدعم ملفّ قانوني أو سياساتي', en: 'Continuous monitoring of water quality and documenting pollution sources to support a legal or policy case' },
            { ar: 'حملة تنظيف موسمية بمشاركة المدارس، فتكرارها كل فصل يُبقي القضية حاضرة في المنطقة ويُخفّف الحمل الظاهر على المجرى', en: 'A seasonal cleaning campaign with school participation, repeated each term so the issue stays present locally and the visible load on the watercourse drops' },
            { ar: 'توعية الأطفال بأهمية المياه النظيفة ضمن برنامج مدرسي ممتدّ، على أمل أن ينقلوا ما تعلّموه إلى أهاليهم فيتغيّر سلوك الأسرة كلّها', en: 'Educating children about the importance of clean water within an extended school programme, hoping they carry what they learn home so the whole household changes' },
          ],
          correct: 0,
          feedback: {
            ar: 'الرصد الموثَّق يُنتج أدلّة يمكن رفعها للجهات المعنية وتحويل المشكلة إلى قرار سياساتي. التوعية والتنظيف مكمّلات مهمّة لكنها لا تُعالج المصدر القانوني أو الصناعي للتلوّث.',
            en: 'Documented monitoring produces evidence that can be presented to relevant authorities and convert the problem into a policy decision. Awareness and cleaning are important complements but do not address the legal or industrial pollution source.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 2
    {
      id: 'ev-planning',
      tag: { ar: 'الوحدة الثانية', en: 'Module 2' },
      title: { ar: 'تخطيط التدخّل البيئي بمعيار الأثر', en: 'Planning environmental intervention by impact standard' },
      lede: {
        ar: 'النشاط البيئي المشهود ليس بالضرورة النشاط المؤثّر — أحياناً ما لا يُصوَّر هو ما يُغيّر شيئاً فعلياً.',
        en: 'A visible environmental activity is not necessarily an impactful one — sometimes what is not photographed is what actually changes something.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'تخطيط تدخّل بيئي جادّ يبدأ بسؤال: "ما التغيير البيئي الفعلي الذي نريد قياسه بعد سنة؟" — لا بسؤال "كم نريد جمع من متطوّع؟".\n\nمن هذا التغيير المستهدف تشتقّ الأنشطة، لا العكس. مثال: إن كان الهدف زيادة الغطاء الأخضر في حيٍّ بعينه بنسبة معيّنة — فأنشطة الزراعة يجب أن تتضمّن خطّة صيانة لسنة، وأنواعاً نباتية مناسبة للمناخ، وإشراك السكّان المحليّين الذين سيعتنون بها لاحقاً. الزراعة دون هذا الإطار قد تُنتج أشجاراً ميّتة خلال شهر.',
            en: 'Planning a serious environmental intervention starts with the question: "What actual environmental change do we want to measure after a year?" — not "How many volunteers do we want to gather?"\n\nFrom this targeted change, activities are derived, not the reverse. Example: if the goal is to increase green cover in a specific neighbourhood by a certain percentage — tree planting activities must include a one-year maintenance plan, climate-appropriate plant species, and involving local residents who will care for them later. Planting without this framework may produce dead trees within a month.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q3',
          label: { ar: 'سؤال ٣', en: 'Question 3' },
          question: {
            ar: 'تُخطّط لحملة تشجير في منطقة شبه جافّة. ما العامل الأكثر أهمية الذي يُحدّد نجاح الحملة؟',
            en: 'You are planning a reforestation campaign in a semi-arid area. What is the most important factor determining the campaign\'s success?',
          },
          options: [
            { ar: 'اختيار أنواع نباتية مقاومة للجفاف ووضع خطّة ري وصيانة مستمرّة بعد اليوم الأول', en: 'Choosing drought-resistant plant species and establishing a continuous irrigation and maintenance plan after the first day' },
            { ar: 'جمع أكبر عدد من المتطوّعين لزراعة أكبر عدد من الأشجار في يوم واحد', en: 'Gathering the largest possible number of volunteers to plant as many trees as possible in a single day' },
            { ar: 'توثيق الحدث بالصور ومشاركتها لرفع الوعي واجتذاب متطوّعين للموسم القادم', en: 'Documenting the event with photos and sharing them to raise awareness and attract volunteers for the next season' },
          ],
          correct: 0,
          feedback: {
            ar: 'شجرة مزروعة بدون خطّة صيانة في بيئة جافّة هي شجرة ميّتة في انتظار الانتظار. الاختيار الصحيح للنوع النباتي والتعهّد بالصيانة أهمّ بكثير من عدد الأشجار المزروعة.',
            en: 'A tree planted without a maintenance plan in a dry environment is a tree waiting to die. The correct choice of plant species and commitment to maintenance is far more important than the number of trees planted.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q4',
          label: { ar: 'سؤال ٤', en: 'Question 4' },
          question: {
            ar: 'مانح يريد تمويل "حملة بيئية" لكنه يُصرّ على اختيار الموقع (منطقة سياحية مرئية) لا على أساس الاحتياج البيئي. ما موقفك؟',
            en: 'A funder wants to finance an "environmental campaign" but insists on choosing the location (a visible tourist area) not based on environmental need. What is your position?',
          },
          options: [
            { ar: 'ناقش بوضوح: تمويل موقع يُحقّق أثراً بيئياً أقلّ قد يُضرّ بمصداقيتك ومصداقية الجمعية على المدى البعيد', en: 'Discuss clearly: funding a site that achieves less environmental impact may harm your credibility and the organisation\'s in the long run' },
            { ar: 'وافق — أي تشجير أفضل من لا تشجير، والموقع السياحي يمنح الحملة ظهوراً يجذب تمويلاً أكبر لاحقاً', en: 'Agree — any greening is better than none, and a visible tourist site gives the campaign media reach that attracts larger funding later' },
            { ar: 'ارفض التمويل لأنه يتعارض مع استقلالية قرار الجمعية، فقبول شرط الموقع مرّة يجعل كل مانح لاحق يتوقّع الحقّ نفسه', en: 'Refuse the funding as it conflicts with the organisation’s decision independence — accepting a site condition once makes every later funder expect the same right' },
          ],
          correct: 0,
          feedback: {
            ar: 'الحوار الصريح الذي يُشرح فيه أثر اختيار الموقع على الجودة البيئية هو المسار المناسب. قبول تمويل لنشاط رمزي كثيراً ما يُعطي المانح ثقةً يُبنى عليها التمويل المستقبلي — وهذا يُشجّعهم على تكرار الشرط.',
            en: 'Open dialogue explaining the impact of site selection on environmental quality is the appropriate path. Accepting funding for a symbolic activity often gives the funder confidence that future funding is built on — and this encourages them to repeat the condition.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 3
    {
      id: 'ev-sustainability',
      tag: { ar: 'الوحدة الثالثة', en: 'Module 3' },
      title: { ar: 'الاستدامة في برامج التطوّع البيئي', en: 'Sustainability in environmental volunteering programmes' },
      lede: {
        ar: 'التدخّل البيئي المستدام لا يعتمد على الحماس المتجدّد كل عام — بل على بنى مجتمعية وأنظمة تحلّ محلّ الحماس حين يخبو.',
        en: 'Sustainable environmental intervention does not rely on renewed enthusiasm every year — but on community structures and systems that replace enthusiasm when it fades.',
      },
      blocks: [
        {
          type: 'text',
          content: {
            ar: 'استدامة التدخّل البيئي تعني أنه يستمرّ بعد انسحاب المتطوّعين — إمّا لأن المجتمع المحلّي تبنّاه، أو لأن الجهة المعنية التزمت بصيانته، أو لأنه أحدث تغييراً في السياسة يستمرّ بقوّة القانون.\n\nالفخّ الشائع هو تصميم برامج تعتمد على حضور المتطوّعين الدائم. حين تتراجع الأعداد أو تنهار التمويلات، ينهار التدخّل معها. المتطوّع الواعي يسأل دائماً: "ما الذي سيستمرّ هنا بعد أن ننتهي؟" — وإن لم يكن له جواب، يُعيد تصميم البرنامج.',
            en: 'Sustainability of environmental intervention means it continues after volunteers withdraw — either because the local community adopted it, a relevant authority committed to its maintenance, or it caused a policy change that persists by force of law.\n\nThe common trap is designing programmes that depend on continuous volunteer presence. When numbers decline or funding collapses, the intervention collapses with it. The aware volunteer always asks: "What will continue here after we are done?" — and if there is no answer, redesigns the programme.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q5',
          label: { ar: 'سؤال ٥', en: 'Question 5' },
          question: {
            ar: 'برنامج تشجير ناجح في حيٍّ سكني يعتمد على ري يومي من متطوّعي الجمعية. ما المخاطرة الرئيسية؟',
            en: 'A successful greening programme in a residential neighbourhood relies on daily irrigation from organisation volunteers. What is the main risk?',
          },
          options: [
            { ar: 'البرنامج غير مستدام — انسحاب المتطوّعين يعني موت الأشجار، يجب تحويل مسؤولية الري للسكّان أو البلدية', en: 'The programme is not sustainable — volunteer withdrawal means tree death; watering responsibility must be transferred to residents or the municipality' },
            { ar: 'تكلفة الري مرتفعة ويجب تقليل عدد الأشجار إلى ما تحتمله الميزانية الحالية قبل أن يستنزف البرنامج موارد الجمعية كلّها', en: 'Irrigation cost is high and the number of trees should be reduced to what the current budget can bear, before the programme drains the organisation’s resources' },
            { ar: 'المتطوّعون يتعبون من الري اليومي ويحتاجون جدول تناوب أسبوعياً يُوزّع العبء ويمنع انقطاع أحدهم عن إفساد الري', en: 'Volunteers tire of daily irrigation and need a weekly rotation schedule that spreads the load so one person dropping out does not break the watering' },
          ],
          correct: 0,
          feedback: {
            ar: 'برنامج بيئي مرتبط باستمرار حضور المتطوّعين فيه نقطة فشل واحدة: الانسحاب. تحويل المسؤولية للمجتمع أو الجهة الرسمية هو ما يُحوّله من نشاط إلى تغيير.',
            en: 'An environmental programme tied to continued volunteer presence has one failure point: withdrawal. Transferring responsibility to the community or official body is what converts it from an activity to a change.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q6',
          label: { ar: 'سؤال ٦', en: 'Question 6' },
          question: {
            ar: 'تريد أن تُشرك المجتمع المحلّي في حماية منطقة خضراء على المدى الطويل. أيّ النهج أكثر فاعلية؟',
            en: 'You want to involve the local community in protecting a green area in the long term. Which approach is most effective?',
          },
          options: [
            { ar: 'أشرك السكّان في القرارات منذ البداية، اجعل منهم جزءاً من تصميم البرنامج والتنفيذ، لا فقط مستهدفين للتوعية', en: 'Involve residents in decisions from the start, make them part of programme design and implementation, not just targets of awareness' },
            { ar: 'نظّم حفلات توعية بيئية متكرّرة لبناء ثقافة الحفاظ على البيئة، فتراكم الرسائل على مدار السنة يُرسّخ العادة لدى السكّان', en: 'Organise repeated environmental awareness events to build a conservation culture, since messages accumulating across the year embed the habit in residents' },
            { ar: 'ركّز على الشباب لأنهم أكثر تقبّلاً للقيم البيئية، وحين يكبرون يحملون هذه القيم إلى أسرهم وإلى قرارات الحيّ بعد سنوات', en: 'Focus on youth as they are more receptive to environmental values, and as they grow they carry those values into their families and into neighbourhood decisions' },
          ],
          correct: 0,
          feedback: {
            ar: 'الإشراك في التصميم والتنفيذ يُولّد ملكية. من يُشارك في إنشاء الشيء يُدافع عنه. التوعية وحدها تُبني معرفة لا التزاماً.',
            en: 'Involvement in design and implementation generates ownership. Those who participate in creating something defend it. Awareness alone builds knowledge, not commitment.',
          },
        },
      ],
    },

    // ---------------------------------------------------------------- 4
    {
      id: 'ev-pitfalls',
      tag: { ar: 'الوحدة الرابعة', en: 'Module 4' },
      title: { ar: 'الأنماط الضارّة في العمل البيئي', en: 'Harmful patterns in environmental work' },
      lede: {
        ar: 'النيّة الحسنة بأسلوب خاطئ يمكن أن تُؤذي البيئة الطبيعية. معرفة الأخطاء الشائعة شرط للتدخّل المسؤول.',
        en: 'Good intention with a wrong method can harm the natural environment. Knowing common errors is a condition for responsible intervention.',
      },
      blocks: [
        {
          type: 'callout',
          variant: 'warn',
          title: { ar: 'أخطاء شائعة تضرّ البيئة', en: 'Common mistakes that harm the environment' },
          content: {
            ar: 'زراعة أنواع نباتية غازية أو غير ملائمة للبيئة المحلّية. تنظيف مواقع دون معرفة أثر هذا التنظيف على النظام البيئي (مثلاً: إزالة "أعشاب" هي في الواقع نباتات أصلية مهمّة). إحضار متطوّعين كثيرين لمواقع حسّاسة يُلحق ضغطاً بشرياً أكثر مما يُفيد. توثيق الحيوانات البرية بشكل تدخّلي يُخيفها أو يُؤذيها.',
            en: 'Planting invasive or locally inappropriate plant species. Cleaning sites without knowledge of this cleaning\'s impact on the ecosystem (e.g. removing "weeds" that are actually important native plants). Bringing many volunteers to sensitive sites causing more human pressure than benefit. Documenting wildlife in an intrusive way that frightens or harms them.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'بعض أنشطة التطوّع البيئي تنشأ من حماس لا من معرفة، وتُحدث ضرراً غير مقصود. مثال شائع: حملات تنظيف تُزيل فضلات ضروريّة لتربية الحشرات أو تغذية الطيور. أو زراعة أنواع نباتية جميلة لكنها غازية تنافس النباتات الأصلية على الموارد.\n\nالمعرفة البيئية الأساسية قبل أي تدخّل ليست ترفاً — بل ضمانة أن حسن النيّة لا يتحوّل إلى ضرر.',
            en: 'Some environmental volunteering activities arise from enthusiasm rather than knowledge, and cause unintended harm. A common example: cleaning campaigns that remove waste necessary for insect breeding or bird feeding. Or planting beautiful but invasive plant species that compete with native plants for resources.\n\nBasic environmental knowledge before any intervention is not luxury — it is the guarantee that good intention does not turn into harm.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'العلم المواطني (Citizen Science) هو مشاركة عامّة الناس — بما فيهم المتطوّعون — في جمع البيانات البيئية وتوثيقها بأساليب علمية منهجية. تطبيقات مثل iNaturalist وeBird تُتيح للمتطوّعين توثيق المخلوقات التي يُشاهدونها، ورفع هذه البيانات لقواعد معلومات عالمية يستخدمها الباحثون والمخطّطون البيئيون.\n\nمشاركتك في رصد التنوّع البيولوجي ليست هواية فقط — بل مساهمة حقيقية في فهم التغيّرات البيئية. المجتمعات التي تُوثّق بيئتها بشكل منتظم تستطيع اكتشاف التغيّرات المبكّرة في أعداد الحيوانات أو تراجع النباتات الأصلية قبل أن تتحوّل إلى أزمة كاملة.',
            en: 'Citizen Science is the participation of ordinary people — including volunteers — in collecting environmental data and documenting it using systematic scientific methods. Applications such as iNaturalist and eBird allow volunteers to document creatures they observe and upload this data to global databases used by researchers and environmental planners.\n\nYour participation in biodiversity monitoring is not just a hobby — but a real contribution to understanding environmental changes. Communities that regularly document their environment can detect early changes in animal populations or the decline of native plants before they become a full crisis.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'قصص التأثير البيئي (Environmental Storytelling) هي أداة نضال فعّالة لا تقلّ أهمّية عن العمل الميداني. حين تُروي قصة نهر نظّفته، أو حديقة أعدتها إلى الحياة، أو مجتمعاً تغيّر وعيه — تُحرّك الآخرين للعمل وتُضغط على صانعي القرار.\n\nالقصة البيئية المؤثّرة تتضمّن: الوضع قبل التدخّل (المشكلة)، العمل الذي حدث (الجهد البشري)، والتحوّل الذي نتج (الأثر). دوّن هذه القصص بصور وأرقام واقتباسات من المجتمع — واستخدم وسائل التواصل الاجتماعي والتقارير والمحافل المجتمعية لنشرها.',
            en: 'Environmental Storytelling is an effective advocacy tool no less important than fieldwork. When you tell the story of a river you cleaned, a garden you restored to life, or a community whose awareness changed — you move others to act and put pressure on decision-makers.\n\nAn impactful environmental story includes: the situation before intervention (the problem), the action that took place (the human effort), and the transformation that resulted (the impact). Document these stories with photos, numbers, and community quotes — and use social media, reports, and community forums to share them.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'التغيّر المناخي ليس قضيّة مجرّدة — تداعياته مرئية في بيئتك المحلّية: تراجع مستوى المياه في مجاري الأنهار، تغيّر في مواسم التزهير، انقراض بعض الأنواع الحشرية التي كانت شائعة. كمتطوّع بيئي، يمكنك ربط هذه التغيّرات المحلّية بالأسباب الكبرى وتوضيحها للمجتمع بأسلوب مفهوم.\n\nالتثقيف البيئي المحلّي أكثر تأثيراً من الحملات العامّة — حين يرى شخص التغيّر بعينيه في منطقته التي يعرفها يصبح أكثر استعداداً للتصرّف. وثّق التغيّرات البيئية في منطقتك بشكل منهجي وقارنها بمرور الوقت.',
            en: 'Climate change is not an abstract issue — its repercussions are visible in your local environment: declining water levels in river streams, changes in flowering seasons, the extinction of some insect species that were once common. As an environmental volunteer, you can link these local changes to larger causes and explain them to the community in an understandable way.\n\nLocal environmental education is more impactful than general campaigns — when a person sees the change with their own eyes in their familiar area they become more ready to act. Document environmental changes in your area systematically and compare them over time.',
          },
        },
        {
          type: 'text',
          content: {
            ar: 'استدامة السلوك البيئي الشخصي تبدأ بعادات صغيرة قابلة للتطبيق في الحياة اليومية — لا بتغييرات جذرية مستحيلة التطبيق. فصل النفايات، تقليل استخدام البلاستيك الفردي، تفضيل المنتجات المحلّية، استخدام وسائل النقل المشترك — هذه أفعال فردية لكن تأثيرها التراكمي حين يُمارسها آلاف الأشخاص ضخم.\n\nكمتطوّع بيئي، أنت نموذج يُحتذى به في مجتمعك. شارك عاداتك البيئية بأسلوب دعوي لا وعظي — أرِ الآخرين كيف تجعل هذه الاختيارات حياتك أفضل لا أصعب. التحوّل البيئي يبدأ بالتقليد الاجتماعي وهذا ما يفعله المتطوّع الواعي.',
            en: 'Sustainability of personal environmental behaviour begins with small habits applicable in daily life — not radical changes impossible to implement. Waste separation, reducing single-use plastic, preferring local products, using shared transportation — these are individual acts but their cumulative effect when practised by thousands of people is enormous.\n\nAs an environmental volunteer, you are a role model in your community. Share your environmental habits in an advocacy manner not a preaching one — show others how these choices make your life better, not harder. Environmental transformation begins with social imitation, and this is what the aware volunteer does.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q7',
          label: { ar: 'سؤال ٧', en: 'Question 7' },
          question: {
            ar: 'فريقك يريد تنظيم رحلة لمنطقة طبيعية محميّة بثلاثين متطوّعاً. ما السؤال الأهمّ الذي تطرحه أوّلاً؟',
            en: 'Your team wants to organise a trip to a protected natural area with thirty volunteers. What is the most important question to ask first?',
          },
          options: [
            { ar: 'هل المنطقة تستوعب هذا العدد من الزوّار دون ضرر للنظام البيئي، وما البروتوكولات الرسمية للدخول؟', en: 'Can the area accommodate this number of visitors without harm to the ecosystem, and what are the official entry protocols?' },
            { ar: 'كيف نُوثّق الرحلة بالصور بأفضل طريقة لزيادة الوعي البيئي لدى من لم يشارك فيها؟', en: 'How do we document the trip in the best way to increase environmental awareness among those who did not come?' },
            { ar: 'ما الأنشطة التطوّعية التي يمكن تنفيذها خلال الزيارة لتكون الرحلة مفيدة لا نزهة؟', en: 'What volunteer activities can be carried out during the visit so the trip is useful rather than an outing?' },
          ],
          correct: 0,
          feedback: {
            ar: 'الحماية تبدأ بالسؤال الصحيح: هل دخولنا يُساهم في الحفاظ أم في الضغط على المنطقة؟ ثلاثون شخصاً في منطقة حسّاسة قد يُلحقون ضرراً أكثر ممّا ينفعون.',
            en: 'Protection starts with the right question: does our entry contribute to conservation or to pressure on the area? Thirty people in a sensitive area may cause more harm than good.',
          },
        },
        {
          type: 'quiz',
          id: 'ev-q8',
          label: { ar: 'سؤال ٨', en: 'Question 8' },
          question: {
            ar: 'متطوّع متحمّس يقترح زراعة نوع نباتي شاع مؤخّراً على وسائل التواصل الاجتماعي لأنه "جميل ونموّه سريع". كيف تتعامل معه؟',
            en: 'An enthusiastic volunteer suggests planting a plant species that recently went viral on social media because it is "beautiful and fast-growing." How do you respond?',
          },
          options: [
            { ar: 'اشكر حماسه وأخبره أن اختيار النوع النباتي يستوجب استشارة متخصّص في البيئة المحلّية أولاً', en: 'Thank their enthusiasm and explain that selecting a plant species requires first consulting a local environment specialist' },
            { ar: 'وافق — سرعة النموّ ميزة وجمال المنطقة يُشجّع الزيارات، وحماس المتطوّع الذي يقترح لا يُردّ حتى لا ينطفئ', en: 'Agree — fast growth is an advantage and area beauty encourages visits, and a volunteer’s proposal should not be refused lest their enthusiasm die' },
            { ar: 'ارفض لأن اقتراحات وسائل التواصل الاجتماعي لا تُوثَق علمياً، واعتمد فقط ما ورد في أدلّة التشجير المعتمدة', en: 'Refuse because social media suggestions are not scientifically validated, and rely only on what the approved planting guides list' },
          ],
          correct: 0,
          feedback: {
            ar: 'الحماس البيئي قيمة — لكنه لا يُغني عن الخبرة. النوع النباتي "الجميل" قد يكون غازياً في بيئتك المحلّية. استشارة المتخصّص ليست تشكيكاً في النيّة بل ضماناً للأثر.',
            en: 'Environmental enthusiasm is a value — but it does not substitute for expertise. The "beautiful" plant species may be invasive in your local environment. Consulting a specialist is not questioning intent — it is guaranteeing impact.',
          },
        },
      ],
    },
  ],
};
