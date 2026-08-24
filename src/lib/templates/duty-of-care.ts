import { ORG } from '@/lib/org';
import type { Template } from './types';

/**
 * The four forms somebody could be harmed by.
 *
 * They were held back at first, on the association's own instruction that a
 * model should not write child protection, safety or legal content as final.
 * That instruction has since been lifted and these are written out in full —
 * so it is worth being exact about which parts are knowledge and which are
 * facts, because the difference is what a real reviewer would ask about.
 *
 * Knowledge, and written here: what an incident report has to capture to be
 * usable months later, the harm categories every safeguarding framework uses,
 * what granular consent means and why one tick for "any use" is not consent,
 * what gets checked before people are taken somewhere.
 *
 * Facts, and NOT written here: which Lebanese body is legally competent to
 * receive a referral, and what Lebanese law requires of an image consent.
 * Those are not expertise, they are facts about a jurisdiction and about this
 * association's own arrangements. A safeguarding consultant drafting these
 * would ask the same two questions rather than invent answers, and every real
 * referral form in the world has "referred to: ______" printed on it for
 * exactly this reason. They are labelled blanks the association fills once.
 *
 * Where a fact IS known it is printed rather than left blank: the association
 * named ريم باشات as its focal point, so the incident report carries the name
 * and does not ask a volunteer in the middle of a disclosure to remember it.
 */

const L = (ar: string, en: string) => ({ ar, en });

/** The named focal point, or a blank line if the association has not set one. */
const focal = ORG.safeguardingFocalPoint;
const focalLine = focal
  ? L(
      `مسؤول الحماية في الجمعية: ${focal.name} — ${focal.phone}. أبلغه في اليوم نفسه، ولا تنتظر أن تكتمل الورقة قبل أن تتصل.`,
      `The association’s safeguarding focal point: ${focal.name} — ${focal.phone}. Tell them the same day; do not wait for this form to be finished before you call.`,
    )
  : L(
      'أبلغ مسؤول الحماية في الجمعية في اليوم نفسه، ولا تنتظر أن تكتمل الورقة قبل أن تتصل.',
      'Tell the association’s safeguarding focal point the same day; do not wait for this form to be finished before you call.',
    );

export const DUTY_OF_CARE: Template[] = [
  // ------------------------------------------------------------- incident
  {
    slug: 'incident-report',
    title: L('تقرير حادثة', 'Incident report'),
    purpose: L(
      'ما وقع، ومتى، وماذا فُعل، ومن أُبلغ — للحوادث التي تمسّ سلامة شخص.',
      'What happened, when, what was done, and who was told — for anything touching a person’s safety.',
    ),
    course: 'protecting-vulnerable',
    review: 'ready',
    carriesDuty: true,
    orientation: 'portrait',
    sections: [
      {
        title: L('قبل أن تكتب', 'Before you write'),
        fields: [
          { kind: 'note', text: focalLine },
          {
            kind: 'note',
            text: L(
              'اكتب في اليوم نفسه ولو ناقصاً. الذاكرة تُصلح الوقائع بعد يومين من دون أن تخبرك أنها فعلت. واكتب الوقائع فقط في خانة الوقائع — رأيك مهمّ ويُكتب في خانته أسفل الصفحة.',
              'Write it the same day even if it is incomplete. After two days memory repairs facts without telling you it has. And put only facts in the facts box — your reading matters and has its own box further down.',
            ),
          },
        ],
      },
      {
        title: L('الحادثة', 'The incident'),
        fields: [
          { kind: 'line', label: L('التاريخ', 'Date'), width: 3 },
          { kind: 'line', label: L('الساعة', 'Time'), width: 3 },
          { kind: 'line', label: L('المكان', 'Place'), width: 6 },
          { kind: 'line', label: L('النشاط الجاري وقتها', 'Activity taking place'), width: 6 },
          { kind: 'line', label: L('كاتب التقرير', 'Written by'), width: 6 },
          {
            kind: 'line',
            label: L('من كان حاضراً', 'Who was present'),
            width: 12,
            hint: L(
              'بالأسماء إن أمكن. من لم يكن حاضراً لا يُكتب هنا.',
              'By name where possible. Anybody who was not there does not go here.',
            ),
          },
        ],
      },
      {
        title: L('من يخصّه الأمر', 'The person concerned'),
        lede: L(
          'أقلّ ما يلزم لأن يتصرّف من يقرأ. لا تكتب تفاصيل لا يحتاجها.',
          'The least that lets the reader act. Do not write details they do not need.',
        ),
        fields: [
          { kind: 'line', label: L('الاسم أو الرمز', 'Name or code'), width: 6 },
          { kind: 'line', label: L('العمر التقريبي', 'Approximate age'), width: 3 },
          { kind: 'line', label: L('صلته بالنشاط', 'Relationship to the activity'), width: 3 },
        ],
      },
      {
        title: L('الوقائع بالترتيب', 'The facts, in order'),
        lede: L(
          'ما يستطيع شخصان حضرا أن يتّفقا عليه: ما جرى، ومتى، وماذا قيل.',
          'What two people who were there could agree on: what happened, when, what was said.',
        ),
        fields: [
          { kind: 'box', label: L('ماذا حدث', 'What happened'), lines: 7 },
          {
            kind: 'box',
            label: L('الكلام كما قيل، حرفياً', 'What was said, word for word'),
            lines: 3,
            hint: L(
              'بين قوسين وبلفظ قائله. لا تُعِد صياغته ولا تصحّح لغته.',
              'In quotation marks and in the speaker’s own words. Do not paraphrase it or correct it.',
            ),
          },
        ],
      },
      {
        title: L('ما فُعل فوراً', 'What was done at the time'),
        fields: [
          { kind: 'box', label: L('الإجراء المتّخذ في حينه', 'Action taken there and then'), lines: 3 },
        ],
      },
      {
        title: L('من أُبلغ', 'Who was told'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('الاسم والصفة', 'Name and role'), width: 5 },
              { head: L('التاريخ والساعة', 'Date and time'), width: 3 },
              { head: L('كيف (اتصال / مواجهة)', 'How (call / in person)'), width: 4 },
            ],
            rows: 3,
          },
          {
            kind: 'line',
            label: L('جهة خارجية أُبلغت، إن وُجدت', 'External body informed, if any'),
            width: 12,
            hint: L(
              'تُملأ من قائمة الجهات التي اعتمدتها الجمعية. لا تجتهد في تحديدها وحدك.',
              'From the list of bodies the association has adopted. Do not decide this on your own.',
            ),
          },
        ],
      },
      {
        title: L('ملاحظتك', 'Your observation'),
        lede: L(
          'هنا مكان رأيك، ومعلَّم على أنه رأي. أنت من كان هناك، وهذا يستحق أن يُقرأ — بشرط أن يعرف القارئ أنه انطباع لا واقعة.',
          'This is where your reading goes, labelled as one. You were the one there and that is worth reading — as long as the reader knows it is an impression and not a fact.',
        ),
        fields: [
          { kind: 'box', label: L('ما بدا لك', 'What it seemed to you'), lines: 3 },
        ],
      },
      {
        title: L('حفظ الورقة', 'Keeping this form'),
        fields: [
          {
            kind: 'note',
            text: L(
              'تُسلَّم هذه الورقة إلى مسؤول الحماية ولا يُحتفظ بنسخة شخصية منها، ولا تُصوَّر على هاتف. تُحفظ في مكان مقفل ولا يطّلع عليها إلا من يحتاج ذلك ليتصرّف. مدّة الحفظ يحدّدها من اعتمد النموذج أدناه.',
              'This form goes to the safeguarding focal point. Keep no personal copy and do not photograph it on a phone. It is stored locked, seen only by those who need it in order to act. How long it is kept is set by whoever adopted this form below.',
            ),
          },
        ],
      },
      {
        title: L('التوقيع والاعتماد', 'Signature and adoption'),
        fields: [
          { kind: 'signoff', roles: [L('كاتب التقرير', 'Written by'), L('استلمها', 'Received by')] },
          {
            kind: 'line',
            label: L('اعتمدت الجمعية صيغة هذا النموذج بتاريخ / باسم', 'Wording adopted by the association on / by'),
            width: 12,
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- referral
  {
    slug: 'safeguarding-referral',
    title: L('استمارة إحالة حماية', 'Safeguarding referral'),
    purpose: L(
      'إحالة حالة إلى الجهة المختصة، بما يكفي لتتصرّف وبلا تفاصيل زائدة.',
      'Referring a case on, with enough for the receiver to act and nothing surplus.',
    ),
    course: 'protecting-vulnerable',
    review: 'ready',
    carriesDuty: true,
    orientation: 'portrait',
    sections: [
      {
        title: L('قبل أن تملأ', 'Before you fill this in'),
        fields: [
          {
            kind: 'note',
            text: L(
              'الإحالة قرار الجمعية لا قرار متطوّع منفرد. أبلغ مسؤول الحماية أولاً؛ هذه الورقة تُملأ معه أو بتكليف منه. وإن كان هناك خطر مباشر على شخص الآن، لا تنتظر ورقة — تصرّف واتّصل، ثم اكتب.',
              'A referral is the association’s decision, not one volunteer’s. Tell the safeguarding focal point first; this form is filled in with them or at their instruction. And if someone is in danger right now, do not wait for a form — act, call, and write afterwards.',
            ),
          },
        ],
      },
      {
        title: L('من يُحال', 'Who is being referred'),
        fields: [
          { kind: 'line', label: L('الاسم', 'Name'), width: 6 },
          { kind: 'line', label: L('العمر أو تاريخ الميلاد', 'Age or date of birth'), width: 3 },
          { kind: 'line', label: L('الجنس', 'Sex'), width: 3 },
          { kind: 'line', label: L('العنوان أو مكان الوجود', 'Address or where they can be found'), width: 12 },
          { kind: 'line', label: L('وليّ الأمر أو المرافق، إن وُجد', 'Guardian or accompanying adult, if any'), width: 6 },
          { kind: 'line', label: L('رقم للتواصل', 'Contact number'), width: 6 },
        ],
      },
      {
        title: L('طبيعة القلق', 'The nature of the concern'),
        lede: L(
          'ضع علامة على ما ينطبق. أكثر من واحدة ممكنة، وغير المؤكّد يبقى قلقاً يستحق الإحالة.',
          'Tick what applies. More than one can. Something you are unsure of is still a concern worth referring.',
        ),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('إيذاء جسدي', 'Physical harm'),
              L('إيذاء نفسي أو عاطفي', 'Emotional or psychological harm'),
              L('إهمال — عدم تلبية حاجات أساسية', 'Neglect — basic needs not being met'),
              L('إيذاء جنسي أو استغلال', 'Sexual harm or exploitation'),
              L('عمالة أطفال أو استغلال اقتصادي', 'Child labour or economic exploitation'),
              L('زواج مبكر', 'Early marriage'),
              L('خطر مرتبط بالنزوح أو انعدام الأوراق', 'Risk linked to displacement or lack of documents'),
              L('أخرى — تُوصَف أدناه', 'Other — described below'),
            ],
          },
        ],
      },
      {
        title: L('على ماذا بُني هذا القلق', 'What the concern rests on'),
        lede: L(
          'وقائع: ما رأيتَه أو ما قيل لك، ومتى. لا استنتاجات.',
          'Facts: what you saw or were told, and when. Not conclusions.',
        ),
        fields: [
          { kind: 'box', label: L('الوقائع', 'The facts'), lines: 6 },
          {
            kind: 'box',
            label: L('الكلام كما قيل، حرفياً', 'What was said, word for word'),
            lines: 2,
          },
        ],
      },
      {
        title: L('الخطر الآن', 'Risk right now'),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('هناك خطر مباشر — اتُّخذ إجراء عاجل ووُصف أدناه', 'There is immediate danger — urgent action taken and described below'),
              L('لا خطر مباشر في تقديرنا', 'No immediate danger, in our assessment'),
            ],
          },
          { kind: 'box', label: L('ما اتُّخذ حتى الآن', 'What has been done so far'), lines: 3 },
        ],
      },
      {
        title: L('العلم والموافقة', 'Awareness and consent'),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('أُبلغ الشخص المعني بأن الأمر سيُحال', 'The person concerned has been told this is being referred'),
              L('أُبلغ وليّ الأمر', 'The guardian has been told'),
              L('لم يُبلغ أحدهما، والسبب مكتوب أدناه', 'Neither was told, and the reason is written below'),
            ],
          },
          {
            kind: 'note',
            text: L(
              'موافقة الشخص أو وليّه ليست شرطاً للإحالة حين يكون طفل في خطر. لكن إخفاء الإحالة عنهما قرار يُتّخذ لسبب — كأن يكون وليّ الأمر نفسه مصدر الخطر — ويُكتب هذا السبب.',
              'Consent from the person or their guardian is not a condition of referring when a child is at risk. But keeping a referral from them is a decision made for a reason — the guardian being the source of the risk, for instance — and that reason gets written down.',
            ),
          },
          { kind: 'box', label: L('السبب، إن لم يُبلَغ أحدهما', 'The reason, if either was not told'), lines: 2 },
        ],
      },
      {
        title: L('إلى أين تُحال', 'Where it is being referred'),
        fields: [
          {
            kind: 'note',
            text: L(
              'تُملأ من قائمة الجهات التي اعتمدتها الجمعية وحدّدت اختصاص كل منها. المسار الخاطئ يؤخّر الحماية وقد يكشف بيانات لمن لا يحقّ له — ولهذا يُحدَّد مسبقاً لا في اللحظة.',
              'Filled in from the list of bodies the association has adopted, with what each is competent to receive. The wrong route delays protection and can expose details to somebody with no right to them — which is why the route is decided in advance and not in the moment.',
            ),
          },
          { kind: 'line', label: L('الجهة', 'Body'), width: 6 },
          { kind: 'line', label: L('اسم من استلم', 'Name of the person receiving'), width: 6 },
          { kind: 'line', label: L('التاريخ والساعة', 'Date and time'), width: 4 },
          { kind: 'line', label: L('كيف أُرسلت', 'How it was sent'), width: 4 },
          { kind: 'line', label: L('رقم مرجعي إن أُعطي', 'Reference given, if any'), width: 4 },
        ],
      },
      {
        title: L('التوقيع والاعتماد', 'Signature and adoption'),
        fields: [
          {
            kind: 'signoff',
            roles: [L('أعدّ الإحالة', 'Prepared by'), L('مسؤول الحماية', 'Safeguarding focal point')],
          },
          {
            kind: 'line',
            label: L('اعتمدت الجمعية صيغة هذا النموذج ومسارات الإحالة بتاريخ / باسم', 'Wording and referral routes adopted by the association on / by'),
            width: 12,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------- consent
  {
    slug: 'photo-consent',
    title: L('موافقة على التصوير والنشر', 'Photography and publication consent'),
    purpose: L(
      'إذن مكتوب بالتقاط صورة ونشرها، وحدود هذا الإذن ومدّته وكيف يُسحب.',
      'Written permission to take an image and to publish it — its limits, how long it lasts, and how it is withdrawn.',
    ),
    course: 'media-and-content',
    review: 'ready',
    carriesDuty: true,
    orientation: 'portrait',
    sections: [
      {
        title: L('قبل أن تطلب التوقيع', 'Before you ask for a signature'),
        fields: [
          {
            kind: 'note',
            text: L(
              'اقرأ الورقة بصوت مسموع لمن سيوقّع، ولا تكتفِ بمناولته إياها. الموافقة التي لا يفهمها صاحبها ليست موافقة. ورفض التوقيع لا يغيّر شيئاً في حقّه بالخدمة — قُل هذا صراحةً قبل أن تسأل.',
              'Read this aloud to the person signing rather than handing it over. Consent that its giver did not understand is not consent. And refusing changes nothing about what they are entitled to receive — say so out loud before you ask.',
            ),
          },
          {
            kind: 'note',
            text: L(
              'تُملأ الحقول المتعلّقة بالأساس القانوني ومدّة الحفظ من الصيغة التي اعتمدتها الجمعية بعد مراجعة قانونية. لا يُترك تحديدها للمتطوّع في الميدان.',
              'The fields covering the legal basis and the retention period are filled in from the version the association adopted after a legal review. Deciding them is not left to a volunteer in the field.',
            ),
          },
        ],
      },
      {
        title: L('من في الصورة', 'Who is in the image'),
        fields: [
          { kind: 'line', label: L('الاسم', 'Name'), width: 6 },
          { kind: 'line', label: L('العمر', 'Age'), width: 2 },
          { kind: 'line', label: L('النشاط والتاريخ', 'Activity and date'), width: 4 },
          {
            kind: 'note',
            text: L(
              'إن كان دون الثامنة عشرة، يوقّع وليّ الأمر — ويُسأل الطفل أيضاً، ورفضه يُحترم حتى لو وافق وليّه.',
              'If they are under eighteen the guardian signs — and the child is asked as well. A child’s refusal is respected even where the guardian has agreed.',
            ),
          },
          { kind: 'line', label: L('اسم وليّ الأمر وصلته', 'Guardian’s name and relationship'), width: 8 },
          { kind: 'line', label: L('رقم للتواصل', 'Contact number'), width: 4 },
        ],
      },
      {
        title: L('ما الذي تُوافق عليه بالضبط', 'Exactly what is being agreed to'),
        lede: L(
          'ضع علامة على كل بند تقبله وحده. البنود منفصلة عن قصد: الموافقة على صورة داخل تقرير للمانحين ليست موافقة على منشور عام، وعلامة واحدة على «أي استعمال» ليست موافقة.',
          'Tick each one you accept, separately. They are separate on purpose: agreeing to an image in a donor report is not agreeing to a public post, and one tick against "any use" is not consent.',
        ),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('التقاط الصورة أو الفيديو', 'Taking the photograph or video'),
              L('استعمالها داخل الجمعية وفي تقاريرها للجهات المموّلة', 'Use inside the association and in its reports to funders'),
              L('نشرها على صفحات الجمعية على مواقع التواصل', 'Publication on the association’s social media pages'),
              L('نشرها في مطبوعات أو على مواقع خارجية', 'Publication in print or on outside websites'),
              L('ذكر اسمي معها', 'My name appearing with it'),
              L('ذكر قصّتي أو ظرفي معها', 'My story or circumstances appearing with it'),
            ],
          },
        ],
      },
      {
        title: L('المدّة والسحب', 'Duration and withdrawal'),
        fields: [
          { kind: 'line', label: L('هذا الإذن ساري حتى', 'This permission runs until'), width: 6 },
          {
            kind: 'line',
            label: L('لسحب الإذن، اتصل بـ', 'To withdraw it, contact'),
            width: 6,
            hint: L(
              `${ORG.email} — ${ORG.phone}`,
              `${ORG.email} — ${ORG.phone}`,
            ),
          },
          {
            kind: 'note',
            text: L(
              'يمكن سحب الإذن في أي وقت وبلا سبب. عند السحب تتوقّف الجمعية عن أي استعمال جديد وتزيل ما تستطيع إزالته — وما نُشر ونُسخ خارج صفحاتها قد لا يمكن استرجاعه، وهذا يُقال قبل التوقيع لا بعده.',
              'Permission can be withdrawn at any time and without a reason. On withdrawal the association stops any new use and removes what it can — what has been published and copied off its own pages may not be recoverable, and that is said before signing rather than after.',
            ),
          },
        ],
      },
      {
        title: L('ما لا تفعله الجمعية', 'What the association will not do'),
        fields: [
          {
            kind: 'note',
            text: L(
              'لا تُنشر صورة تكشف هوية ناجٍ من عنف. ولا تُنشر صورة مع بيانات تسمح بالوصول إلى صاحبها: العنوان، اسم المدرسة، الحيّ الدقيق. ولا تُستعمل صورة أُخذت في لحظة ضعف — توزيع مساعدة، بكاء طفل — للترويج.',
              'No image is published that identifies a survivor of violence. No image is published alongside details that let somebody find its subject: address, school name, exact neighbourhood. And no image taken in a moment of vulnerability — a handout being received, a child crying — is used for promotion.',
            ),
          },
        ],
      },
      {
        title: L('التوقيع والاعتماد', 'Signature and adoption'),
        fields: [
          {
            kind: 'signoff',
            roles: [
              L('الموقّع (أو وليّ الأمر)', 'Signed (or guardian)'),
              L('المتطوّع الذي شرح الورقة', 'Volunteer who explained it'),
            ],
          },
          {
            kind: 'line',
            label: L('اعتمدت الجمعية صيغة هذا النموذج بعد مراجعة قانونية بتاريخ / باسم', 'Wording adopted by the association after legal review on / by'),
            width: 12,
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------ field safety
  {
    slug: 'field-safety-checklist',
    title: L('قائمة تحقّق للسلامة الميدانية', 'Field safety checklist'),
    purpose: L(
      'ما يُتحقَّق منه قبل الخروج وعند الوصول — ويوقّع عليه شخص باسمه.',
      'What gets checked before leaving and on arrival — signed by a named person.',
    ),
    course: 'field-safety',
    review: 'ready',
    carriesDuty: true,
    orientation: 'portrait',
    sections: [
      {
        title: L('النشاط', 'The activity'),
        fields: [
          { kind: 'line', label: L('النشاط', 'Activity'), width: 6 },
          { kind: 'line', label: L('التاريخ', 'Date'), width: 3 },
          { kind: 'line', label: L('المكان', 'Location'), width: 3 },
          { kind: 'line', label: L('المسؤول الميداني', 'Field lead'), width: 6 },
          { kind: 'line', label: L('عدد المتطوّعين / عدد المشاركين', 'Volunteers / participants'), width: 6 },
        ],
      },
      {
        title: L('قبل الخروج', 'Before leaving'),
        lede: L(
          'بند غير محقَّق لا يُترك فارغاً — يُكتب سببه في آخر الورقة ويقرّر المسؤول هل يُخرَج أصلاً.',
          'An item that is not satisfied is not left blank — the reason goes at the end and the lead decides whether the activity goes ahead at all.',
        ),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('زار أحدنا المكان أو تحقّق منه مع طرف موثوق', 'One of us has seen the place, or checked it with somebody we trust'),
              L('المسار والوجهة معروفان لشخص باقٍ في المكتب', 'The route and destination are known to somebody who is staying behind'),
              L('ساعة العودة المتوقّعة متّفق عليها، ومن يُتّصل به إن تأخّرنا', 'An expected return time is agreed, and who to call if we are late'),
              L('أرقام الطوارئ محفوظة مع أكثر من متطوّع، لا مع واحد', 'Emergency numbers are held by more than one volunteer, not just one'),
              L('صندوق إسعافات أوّلية موجود، ومع الفريق من تدرّب على استعماله', 'A first-aid kit is with us, and somebody trained to use it'),
              L('الهواتف مشحونة، وتغطية الشبكة في الموقع معروفة', 'Phones are charged and we know what the network coverage is there'),
              L('بيانات السلامة وجهة الاتصال للطوارئ متوفّرة لكل متطوّع خارج', 'Safeguarding details and an emergency contact are on file for every volunteer going'),
              L('عدد المتطوّعين كافٍ لعدد المشاركين، ولا ينفرد أحد بطفل', 'There are enough volunteers for the number of participants, and nobody will be alone with a child'),
              L('الأذونات اللازمة من البلدية أو صاحب المكان بحوزتنا', 'Any permission needed from the municipality or the owner of the place is in hand'),
            ],
          },
        ],
      },
      {
        title: L('عند الوصول', 'On arrival'),
        fields: [
          {
            kind: 'checklist',
            items: [
              L('المخارج معروفة وغير مقفلة ولا مسدودة', 'The exits are known, unlocked and unblocked'),
              L('لا مخاطر ظاهرة: أسلاك، درج بلا درابزين، مياه مكشوفة، مرور قريب', 'No visible hazards: wiring, unrailed stairs, open water, traffic nearby'),
              L('مكان متّفق عليه للتجمّع إن حصل طارئ', 'An agreed place to gather if something happens'),
              L('مياه شرب وظلّ أو تدفئة بحسب الطقس', 'Drinking water, and shade or heating as the weather requires'),
              L('دورة مياه يمكن الوصول إليها', 'A usable toilet within reach'),
              L('أعرف من في الفريق يبقى مع المجموعة إن اضطر أحدنا للمغادرة', 'I know who stays with the group if one of us has to leave'),
            ],
          },
        ],
      },
      {
        title: L('ما لم يتحقّق', 'What was not satisfied'),
        fields: [
          {
            kind: 'grid',
            columns: [
              { head: L('البند', 'Item'), width: 5 },
              { head: L('لماذا', 'Why'), width: 4 },
              { head: L('ما فُعل بدلاً منه', 'What was done instead'), width: 3 },
            ],
            rows: 3,
          },
        ],
      },
      {
        title: L('التوقيع والاعتماد', 'Signature and adoption'),
        lede: L(
          'التوقيع هو المقصود من الورقة كلها. قائمة تحقّق بلا اسم عليها هي علامات لم يضعها أحد.',
          'The signature is the point of the whole sheet. A checklist with no name on it is ticks that nobody made.',
        ),
        fields: [
          { kind: 'signoff', roles: [L('المسؤول الميداني', 'Field lead')] },
          {
            kind: 'line',
            label: L('اعتمدت الجمعية صيغة هذه القائمة بتاريخ / باسم', 'Wording adopted by the association on / by'),
            width: 12,
          },
        ],
      },
    ],
  },
];
