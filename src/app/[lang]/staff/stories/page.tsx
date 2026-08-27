import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { formatDuration, formatNumber } from '@/lib/format';
import {
  activityChoiceName,
  allStories,
  photoAlt,
  photosByStory,
  linkableActivities,
  linkableProjects,
  projectNameOf,
  storyDate,
  storyLocation,
  storyTitle,
  type ActivityChoice,
  type ProjectChoice,
  type StoryCard,
  type StoryPhoto,
} from '@/lib/stories';
import {
  addStoryPhotoAction,
  archiveStoryAction,
  createStoryAction,
  removeStoryPhotoAction,
  setStoryPhotoFacesAction,
  setStoryPhotoOrderAction,
  setStoryPublishedAction,
  updateStoryAction,
} from '@/lib/actions/stories';
import { stories, isStoryError, type StoryStrings } from '@/lib/dictionaries/stories';

/**
 * «قصص من الميدان»: writing up what the association did, and deciding which
 * photographs of it the world may see.
 *
 * ── A SERVER COMPONENT, ALL THE WAY DOWN ──────────────────────────────────
 *
 * There is no client component in this feature. Every control is a plain
 * `<form action={serverAction}>` and every panel is a `<details>`, so adding a
 * story, editing one, publishing one, archiving one, uploading a photograph and
 * taking one down all cost no JavaScript at all and work before hydration. The
 * file input is an ordinary `<input type="file">` in an ordinary form — no
 * base64 round trip and no upload widget.
 *
 * A server-only form cannot normally show WHY a write was refused, and this
 * feature has several a coordinator will meet by working normally — a
 * photograph over the size cap, a slug another story holds, an upload with no
 * answer about who is in it. So the actions redirect back with `?error=…` and
 * the banner below renders the sentence. That is why this page reads
 * searchParams at all.
 *
 * ── THERE IS NO PARTICIPANT BOX ON THIS SCREEN ────────────────────────────
 *
 * Not as a number field, not as a placeholder, not disabled and greyed out.
 * `derivedNote` explains why where the two figures would have been: both are
 * read from the attendance register of the activity the story names, so a story
 * linked to one shows the register's own numbers and a story linked to nothing
 * shows none. The badges on each card print whatever the register currently
 * says, which is how a coordinator sees the effect of choosing an activity
 * without anybody typing a figure. See migration 060.
 *
 * ── THE PICTURES, AND THE ONE QUESTION THAT IS ASKED EVERY TIME ───────────
 *
 * `faces` is a required radio group with all three sentences visible, not a
 * select and not a checkbox. A select hides two of the three options behind a
 * tap, and the two it hides are the ones somebody needs to read. Nothing
 * defaults it — the action refuses an upload that did not answer.
 *
 * The photographs shown here come from /api/story-photo, which serves any
 * picture to somebody holding this page's capability INCLUDING a restricted
 * one. That is deliberate: the picture a coordinator most needs to look at is
 * the one that may not be published, and a screen that could not show its own
 * withheld pictures would be a screen where the safeguarding answer is chosen
 * blind. The public route is a different file and answers a different question.
 *
 * ── MOBILE FIRST ──────────────────────────────────────────────────────────
 *
 * One column at 375px, splitting at `sm`. Nothing carries a min-width, so the
 * page never scrolls sideways; every control is `min-h-11`, which is 44px; and
 * the logical properties (`ms-`/`me-`/`text-start`) mean the same markup reads
 * right-to-left in Arabic and left-to-right in English.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/stories'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: stories(lang).staffTitle,
    alternates: alternatesFor(lang, '/staff/stories'),
    robots: { index: false, follow: false },
  };
}

/* The same summary pill as the partners and committees screens — these pages
 * belong to one product. `inline-flex` is what removes the disclosure triangle:
 * a summary is a list-item by default and stops being one the moment its
 * display changes, in every engine including the WebKit one that ignores
 * `list-style: none` here. */
const PILL =
  'inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line' +
  ' bg-surface-2 px-4 text-[0.88rem] font-extrabold text-ink-2 transition-colors hover:bg-surface';

const FIELD =
  'min-h-11 w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-brand-blue';

const LABEL = 'mb-1.5 block text-[0.88rem] font-bold';

const HINT = 'mt-1.5 text-[0.82rem] leading-relaxed text-ink-3';

const NOTE =
  'rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.84rem] leading-relaxed text-ink-2';

const SUBMIT =
  'min-h-11 w-full rounded-full bg-brand-blue px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto';

const SECONDARY =
  'min-h-11 rounded-full border-2 border-brand-blue px-6 text-[0.9rem] font-extrabold text-brand-blue transition-colors hover:bg-brand-blue/10 dark:border-brand-orange dark:text-brand-orange';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-ink-2 break-words">
      {children}
    </span>
  );
}

/** How an activity reads in the picker: its name, its day, and its register. */
function activityLabel(choice: ActivityChoice, lang: Locale, t: StoryStrings): string {
  const template = choice.onDate ? t.activityOption : t.activityOptionUndated;
  return template
    .replace('{title}', activityChoiceName(choice, lang))
    .replace('{date}', choice.onDate ?? '')
    .replace('{n}', String(choice.attended));
}

/** The one form a story is typed into, for both adding and correcting. */
function StoryForm({
  lang,
  card,
  projects,
  activities,
  t,
}: {
  lang: Locale;
  /** Absent for «+ إضافة قصّة»; present when correcting one. */
  card?: StoryCard;
  projects: ProjectChoice[];
  activities: ActivityChoice[];
  t: StoryStrings;
}) {
  const editing = card !== undefined;
  const story = card?.story;
  const uid = story ? story.id : 'new';

  return (
    <form action={editing ? updateStoryAction : createStoryAction} className="space-y-5">
      <input type="hidden" name="lang" value={lang} />
      {editing && story && <input type="hidden" name="storyId" value={story.id} />}

      <div>
        <label className={LABEL} htmlFor={`titleAr-${uid}`}>
          {t.titleArLabel}
        </label>
        <input
          id={`titleAr-${uid}`}
          name="titleAr"
          type="text"
          required
          defaultValue={story?.titleAr ?? ''}
          className={FIELD}
        />
        <p className={HINT}>{t.titleArHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`titleEn-${uid}`}>
          {t.titleEnLabel}
        </label>
        <input
          id={`titleEn-${uid}`}
          name="titleEn"
          type="text"
          dir="ltr"
          defaultValue={story?.titleEn ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.titleEnHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`slug-${uid}`}>
          {t.slugLabel}
        </label>
        <input
          id={`slug-${uid}`}
          name="slug"
          type="text"
          required
          dir="ltr"
          /* The same shape as chk_st_slug. The browser refuses the obvious
             mistakes; lib/stories.ts refuses them again, because a `pattern` is
             a courtesy and not a check. */
          pattern="[a-z0-9][a-z0-9\-]{1,60}"
          defaultValue={story?.slug ?? ''}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.slugHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`locAr-${uid}`}>
            {t.locationArLabel}
          </label>
          <input
            id={`locAr-${uid}`}
            name="locationAr"
            type="text"
            defaultValue={story?.locationAr ?? ''}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor={`locEn-${uid}`}>
            {t.locationEnLabel}
          </label>
          <input
            id={`locEn-${uid}`}
            name="locationEn"
            type="text"
            dir="ltr"
            defaultValue={story?.locationEn ?? ''}
            className={`${FIELD} text-start`}
          />
        </div>
      </div>
      <p className={HINT}>{t.locationHint}</p>

      <div>
        <label className={LABEL} htmlFor={`project-${uid}`}>
          {t.projectLabel}
        </label>
        <select
          id={`project-${uid}`}
          name="projectId"
          defaultValue={story?.projectId ?? ''}
          className={FIELD}
        >
          {/* '' is a real answer here — the association itself — rather than an
              unanswered question, which is why it is worded as one. */}
          <option value="">{t.projectNone}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {projectNameOf(project, lang)}
            </option>
          ))}
        </select>
        <p className={HINT}>{t.projectHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`activity-${uid}`}>
          {t.activityLabel}
        </label>
        <select
          id={`activity-${uid}`}
          name="activityId"
          defaultValue={story?.activityId ?? ''}
          className={FIELD}
        >
          <option value="">{t.activityNone}</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activityLabel(activity, lang, t)}
            </option>
          ))}
        </select>
        <p className={HINT}>{t.activityHint}</p>
      </div>

      {/* Where a participant box would have been. See the head of this page. */}
      <p className={NOTE}>{t.derivedNote}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`date-${uid}`}>
            {t.dateLabel}
          </label>
          {/* Sent and stored as 'YYYY-MM-DD' text. Nothing anywhere builds a
              Date from it — see the head of lib/stories.ts. */}
          <input
            id={`date-${uid}`}
            name="happenedOn"
            type="date"
            dir="ltr"
            defaultValue={story?.happenedOn ?? ''}
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.dateHint}</p>
        </div>

        <div>
          <label className={LABEL} htmlFor={`prec-${uid}`}>
            {t.precisionLabel}
          </label>
          <select
            id={`prec-${uid}`}
            name="happenedPrec"
            defaultValue={story?.happenedPrec ?? 'day'}
            className={FIELD}
          >
            <option value="day">{t.precision.day}</option>
            <option value="month">{t.precision.month}</option>
            <option value="year">{t.precision.year}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor={`descAr-${uid}`}>
          {t.descriptionArLabel}
        </label>
        <textarea
          id={`descAr-${uid}`}
          name="descriptionAr"
          rows={5}
          defaultValue={story?.descriptionAr ?? ''}
          className={`${FIELD} leading-relaxed`}
        />
        <p className={HINT}>{t.descriptionHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`descEn-${uid}`}>
          {t.descriptionEnLabel}
        </label>
        <textarea
          id={`descEn-${uid}`}
          name="descriptionEn"
          rows={5}
          dir="ltr"
          defaultValue={story?.descriptionEn ?? ''}
          className={`${FIELD} text-start leading-relaxed`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor={`impAr-${uid}`}>
          {t.impactArLabel}
        </label>
        <textarea
          id={`impAr-${uid}`}
          name="impactAr"
          rows={3}
          defaultValue={story?.impactAr ?? ''}
          className={`${FIELD} leading-relaxed`}
        />
        <p className={HINT}>{t.impactHint}</p>
      </div>

      <div>
        <label className={LABEL} htmlFor={`impEn-${uid}`}>
          {t.impactEnLabel}
        </label>
        <textarea
          id={`impEn-${uid}`}
          name="impactEn"
          rows={3}
          dir="ltr"
          defaultValue={story?.impactEn ?? ''}
          className={`${FIELD} text-start leading-relaxed`}
        />
      </div>

      {/* The one rule the platform cannot enforce for itself, said where the
          prose is written rather than in a policy nobody opens. */}
      <p className={NOTE}>{t.peopleNote}</p>

      <div>
        <label className={LABEL} htmlFor={`sort-${uid}`}>
          {t.sortLabel}
        </label>
        <input
          id={`sort-${uid}`}
          name="sortOrder"
          type="number"
          step={1}
          dir="ltr"
          defaultValue={String(story?.sortOrder ?? 0)}
          className={`${FIELD} text-start`}
        />
        <p className={HINT}>{t.sortHint}</p>
      </div>

      {/* Only on the add form. An edit must not carry is_published — see the
          head of lib/actions/stories.ts for why it has an action of its own.
          Unchecked by default here, matching the column: a story carries
          photographs of people, and silence must not publish them. */}
      {!editing && (
        <label className="flex items-start gap-3 text-[0.92rem]">
          <input
            type="checkbox"
            name="isPublished"
            className="mt-1 h-5 w-5 shrink-0 accent-brand-blue"
          />
          <span className="leading-relaxed text-ink-2">{t.publishCta}</span>
        </label>
      )}

      <button type="submit" className={SUBMIT}>
        {editing ? t.saveEdit : t.save}
      </button>
    </form>
  );
}

/** Why a story is being taken off the list. A reason is required twice. */
function ArchiveForm({ lang, card, t }: { lang: Locale; card: StoryCard; t: StoryStrings }) {
  return (
    <form action={archiveStoryAction}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="storyId" value={card.story.id} />

      <h4 className="text-[0.95rem] font-extrabold">{t.archiveHeading}</h4>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-2">{t.archiveNote}</p>

      <label
        className="mt-4 mb-1.5 block text-[0.88rem] font-bold"
        htmlFor={`why-${card.story.id}`}
      >
        {t.reasonLabel}
      </label>
      <input
        id={`why-${card.story.id}`}
        name="reason"
        type="text"
        required
        minLength={2}
        placeholder={t.reasonPlaceholder}
        className={FIELD}
      />
      <button
        type="submit"
        className="mt-3 min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
      >
        {t.archiveSubmit}
      </button>
    </form>
  );
}

/**
 * The three answers about a photograph, as radios.
 *
 * All three sentences visible, in the order they should be considered — the
 * one that publishes least first. Nothing is checked by default: the action
 * refuses an upload with no answer, and a pre-selected 'none' would be the
 * safeguarding gate quietly answering itself.
 */
function FacesChoice({ name, uid, t }: { name: string; uid: string; t: StoryStrings }) {
  const options = [
    { value: 'none', strings: t.faces.none },
    { value: 'adults', strings: t.faces.adults },
    { value: 'restricted', strings: t.faces.restricted },
  ];
  return (
    <fieldset>
      <legend className={LABEL}>{t.facesLabel}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-3 rounded-xl border border-line bg-ground p-3"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              required
              id={`${name}-${option.value}-${uid}`}
              className="mt-1 h-5 w-5 shrink-0 accent-brand-blue"
            />
            <span>
              <span className="block text-[0.9rem] font-bold">{option.strings.label}</span>
              <span className="mt-1 block text-[0.82rem] leading-relaxed text-ink-3">
                {option.strings.hint}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** One stored picture, what was said about it, and the two ways to change that. */
function PhotoRow({ lang, photo, isCover, t }: {
  lang: Locale;
  photo: StoryPhoto;
  isCover: boolean;
  t: StoryStrings;
}) {
  const caption = photoAlt(photo, lang);
  const restricted = photo.faces === 'restricted';

  return (
    <li className="rounded-xl border border-line bg-ground p-3 sm:p-4">
      <div className="flex flex-wrap gap-4">
        {/* /api/story-photo, not /api/public/story-photo: this screen may see a
            withheld picture, and the public route may not. See the head. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/story-photo/${photo.id}?v=${photo.version}`}
          alt={caption}
          loading="lazy"
          decoding="async"
          className="h-24 w-32 shrink-0 rounded-lg border border-line object-cover"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {restricted ? (
              <span className="rounded-full bg-warn/15 px-3 py-1 text-[0.78rem] font-extrabold text-warn-text">
                {t.restrictedBadge}
              </span>
            ) : (
              <Badge>{t.faces[photo.faces].label}</Badge>
            )}
            {isCover && <Badge>{t.coverBadge}</Badge>}
          </div>
          {caption && <p className="text-[0.88rem] leading-relaxed text-ink-2 break-words">{caption}</p>}
          <p className="text-[0.8rem] text-ink-3">
            {t.uploadedOn.replace('{date}', photo.uploadedOn)}
            {' · '}
            {t.photoSize.replace('{n}', String(Math.round(photo.byteSize / 1024)))}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <details>
          <summary className={PILL}>{t.facesChangeCta}</summary>
          <div className="mt-3 space-y-4 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.84rem] leading-relaxed text-ink-2">{t.facesChangeNote}</p>

            {/* Two separate forms, two separate actions. Moving a picture out of
                sight and moving it up the page are not the same decision, and
                one submit that did both would make the safeguarding answer a
                side effect of tidying. */}
            <form action={setStoryPhotoFacesAction} className="space-y-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="photoId" value={photo.id} />
              <FacesChoice name="faces" uid={photo.id} t={t} />
              <button type="submit" className={SECONDARY}>
                {t.facesSubmit}
              </button>
            </form>

            <form action={setStoryPhotoOrderAction} className="border-t border-line pt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="photoId" value={photo.id} />
              <label className={LABEL} htmlFor={`ord-${photo.id}`}>
                {t.photoOrderLabel}
              </label>
              <input
                id={`ord-${photo.id}`}
                name="sortOrder"
                type="number"
                step={1}
                dir="ltr"
                defaultValue={String(photo.sortOrder)}
                className={`${FIELD} text-start`}
              />
              <p className={HINT}>{t.photoOrderHint}</p>
              <button type="submit" className={`${SECONDARY} mt-3 w-full sm:w-auto`}>
                {t.facesSubmit}
              </button>
            </form>
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.removeCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.removeNote}</p>
            <form action={removeStoryPhotoAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="photoId" value={photo.id} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-full bg-danger px-6 text-[0.9rem] font-extrabold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                {t.removeCta}
              </button>
            </form>
          </div>
        </details>
      </div>
    </li>
  );
}

function PhotosPanel({
  lang,
  card,
  photos,
  t,
}: {
  lang: Locale;
  card: StoryCard;
  photos: StoryPhoto[];
  t: StoryStrings;
}) {
  const storyId = card.story.id;
  /* The card picture is whichever publishable one comes first, which is exactly
     what the LATERAL in publishedStories() picks. Computed the same way here so
     the badge cannot claim a different picture from the one the gallery draws. */
  const coverId = photos.find((photo) => photo.faces !== 'restricted')?.id ?? null;

  return (
    <div className="space-y-5">
      <h4 className="text-[0.95rem] font-extrabold">{t.photosHeading}</h4>
      <p className={NOTE}>{t.photoConsentNote}</p>

      {photos.length === 0 ? (
        <p className="text-[0.86rem] leading-relaxed text-ink-3">{t.photosEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {photos.map((photo) => (
            <PhotoRow
              key={photo.id}
              lang={lang}
              photo={photo}
              isCover={photo.id === coverId}
              t={t}
            />
          ))}
        </ul>
      )}

      <form
        action={addStoryPhotoAction}
        className="space-y-4 border-t border-line pt-5"
        encType="multipart/form-data"
      >
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="storyId" value={storyId} />

        <div>
          <label className={LABEL} htmlFor={`file-${storyId}`}>
            {t.fileLabel}
          </label>
          <input
            id={`file-${storyId}`}
            name="image"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.fileHint}</p>
        </div>

        <div>
          <label className={LABEL} htmlFor={`altAr-${storyId}`}>
            {t.altArLabel}
          </label>
          <input id={`altAr-${storyId}`} name="altAr" type="text" className={FIELD} />
        </div>

        <div>
          <label className={LABEL} htmlFor={`altEn-${storyId}`}>
            {t.altEnLabel}
          </label>
          <input
            id={`altEn-${storyId}`}
            name="altEn"
            type="text"
            dir="ltr"
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.altHint}</p>
        </div>

        <FacesChoice name="faces" uid={`new-${storyId}`} t={t} />

        <div>
          <label className={LABEL} htmlFor={`porder-${storyId}`}>
            {t.photoOrderLabel}
          </label>
          <input
            id={`porder-${storyId}`}
            name="sortOrder"
            type="number"
            step={1}
            dir="ltr"
            defaultValue="0"
            className={`${FIELD} text-start`}
          />
          <p className={HINT}>{t.photoOrderHint}</p>
        </div>

        <button type="submit" className={SUBMIT}>
          {t.uploadSubmit}
        </button>
      </form>
    </div>
  );
}

function StoryRow({
  lang,
  card,
  photos,
  projects,
  activities,
  t,
}: {
  lang: Locale;
  card: StoryCard;
  photos: StoryPhoto[];
  projects: ProjectChoice[];
  activities: ActivityChoice[];
  t: StoryStrings;
}) {
  const { story, project, figures } = card;
  const when = storyDate(card, lang);
  const where = storyLocation(story, lang);

  return (
    <li
      /* The start-side rule is the only thing separating a story that is on the
         public page from one that is not. `border-s-*` and not `border-l-*`, so
         it lands on the right in Arabic and the left in English. */
      className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 ${
        story.isPublished ? 'border-s-4 border-s-brand-orange' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <h3 className="text-[1.02rem] font-extrabold break-words">{storyTitle(story, lang)}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[0.78rem] font-extrabold ${
            story.isPublished
              ? 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
              : 'bg-surface-2 text-ink-3'
          }`}
        >
          {story.isPublished ? t.publishedBadge : t.unpublishedBadge}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Badge>
          {t.projectBadge}: {project ? projectNameOf(project, lang) : t.associationWide}
        </Badge>
        {when && <Badge>{when}</Badge>}
        {where && <Badge>{where}</Badge>}
        {/* Whatever the register currently says, printed rather than typed. */}
        {figures ? (
          <>
            <Badge>
              {formatNumber(figures.participants, lang)} {t.participantsBadge}
            </Badge>
            <Badge>{formatDuration(figures.volunteerMinutes, lang)}</Badge>
          </>
        ) : (
          <Badge>{t.noActivityBadge}</Badge>
        )}
        {photos.length > 0 && (
          <Badge>
            {formatNumber(photos.length, lang)} {t.photosBadge}
          </Badge>
        )}
      </div>

      {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. */}
      <p className="mt-3 text-[0.8rem] text-ink-3" dir="ltr">
        {t.recordedOn.replace('{date}', story.createdOn)}
      </p>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        <details>
          <summary className={PILL}>{t.editCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <h4 className="mb-4 text-[0.95rem] font-extrabold">{t.editHeading}</h4>
            <StoryForm
              lang={lang}
              card={card}
              projects={projects}
              activities={activities}
              t={t}
            />
          </div>
        </details>

        <details>
          <summary className={PILL}>
            {t.photosCta}
            {photos.length > 0 && ` (${photos.length})`}
          </summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <PhotosPanel lang={lang} card={card} photos={photos} t={t} />
          </div>
        </details>

        <details>
          <summary className={PILL}>
            {story.isPublished ? t.unpublishCta : t.publishCta}
          </summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{t.publishNote}</p>
            <form action={setStoryPublishedAction} className="mt-4">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="storyId" value={story.id} />
              {/* flag() reads 'true' as true and everything else as false, so an
                  explicit value is safer than omitting the field. */}
              <input
                type="hidden"
                name="published"
                value={story.isPublished ? 'false' : 'true'}
              />
              <button type="submit" className={`${SECONDARY} w-full sm:w-auto`}>
                {story.isPublished ? t.unpublishCta : t.publishCta}
              </button>
            </form>
          </div>
        </details>

        <details>
          <summary className={PILL}>{t.archiveCta}</summary>
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 sm:p-4">
            <ArchiveForm lang={lang} card={card} t={t} />
          </div>
        </details>

        {story.isPublished && (
          <Link
            href={`/${lang}/gallery/${story.slug}` as Parameters<typeof Link>[0]['href']}
            className="inline-block min-h-11 py-2.5 text-[0.9rem] font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.viewPublic} →
          </Link>
        )}
      </div>
    </li>
  );
}

export default async function StaffStoriesPage(props: PageProps<'/[lang]/staff/stories'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = stories(lang);

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  /* The same capability every action on this page asserts. A `can()` that
   * disagreed with them would produce a screen full of controls that could only
   * fail. Why it is challenges.manage and not members.manage is argued at the
   * head of lib/actions/stories.ts. */
  if (!can(user, 'challenges.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const params = await props.searchParams;
  const asked = String(params.error ?? '');
  // Read off a URL, so it is checked against the strings that answer to it
  // rather than rendered as whatever a stranger typed.
  const problem = isStoryError(asked) ? asked : null;

  const [all, projects, activities, photosBy] = await Promise.all([
    allStories({ includeArchived: true }),
    linkableProjects(),
    linkableActivities(),
    /* Every picture on every story in ONE query, restricted ones included —
     * this screen is where they are looked at and decided about. */
    photosByStory({ includeRestricted: true }),
  ]);

  const live = all.filter((card) => card.story.archivedOn === null);
  const archived = all.filter((card) => card.story.archivedOn !== null);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.staffTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.staffLede}</p>

        {problem && (
          <p
            role="status"
            className="mt-6 rounded-xl border-2 border-warn bg-warn/10 px-5 py-4 text-[0.93rem] leading-relaxed text-ink-2"
          >
            {t.errors[problem]}
          </p>
        )}

        <details className="mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-brand-orange px-5 text-[0.92rem] font-extrabold text-brand-orange-ink transition-colors hover:bg-brand-orange-dark">
            {t.addCta}
          </summary>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-4 text-[1rem] font-extrabold">{t.addHeading}</h2>
            <StoryForm lang={lang} projects={projects} activities={activities} t={t} />
          </div>
        </details>

        {live.length === 0 ? (
          <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {live.map((card) => (
              <StoryRow
                key={card.story.id}
                lang={lang}
                card={card}
                photos={photosBy.get(card.story.id) ?? []}
                projects={projects}
                activities={activities}
                t={t}
              />
            ))}
          </ul>
        )}

        {/*
         * Archived rows: kept, hidden by default. The database refuses a DELETE
         * on a story outright (trg_stories_no_delete), so nothing in this drawer
         * is ever the last copy of anything. The PICTURES are a different case
         * and are deletable on purpose — see the panel above and migration 060.
         */}
        {archived.length > 0 && (
          <details className="mt-8">
            <summary className={PILL}>
              {t.archivedShow.replace('{n}', String(archived.length))}
            </summary>
            <p className="mt-3 max-w-[62ch] text-[0.86rem] leading-relaxed text-ink-3">
              {t.archivedNote}
            </p>
            <ul className="mt-3 space-y-3">
              {archived.map((card) => (
                <li key={card.story.id} className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="text-[0.98rem] font-extrabold text-ink-2 break-words">
                    {storyTitle(card.story, lang)}
                  </p>
                  {/* archivedOn is already Beirut 'YYYY-MM-DD' text. */}
                  <p className="mt-1 text-[0.82rem] text-ink-3" dir="ltr">
                    {t.archivedOn.replace('{date}', card.story.archivedOn ?? '')}
                  </p>
                  {card.story.archiveReason && (
                    <p className="mt-2 text-[0.88rem] text-ink-2 break-words">
                      {t.archivedReason}: {card.story.archiveReason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-9 flex flex-wrap gap-5">
          <Link
            href={`/${lang}/staff`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            ← {dict.account.staff.dashboard.title}
          </Link>
          <Link
            href={`/${lang}/gallery`}
            className="inline-block min-h-11 py-2.5 font-bold text-brand-blue hover:underline dark:text-brand-orange"
          >
            {t.sectionTitle} →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
