import { notFound, permanentRedirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n';

/**
 * Folded into the path map.
 *
 * There were three pages showing a progression, and they were not three
 * progressions. Two of them — this one and /account/map — were both views of
 * the academy: the same levels, the same courses, the same lock reasons, one
 * written as prose and one drawn. The third, /account/journey, is a different
 * thing entirely: the six stages the association awards a volunteer, which
 * move on hours, attendance and a supervisor's signature rather than on
 * courses.
 *
 * So the two academy views became one and the volunteer journey stayed where
 * it was. Merging all three under a single heading — which was the original
 * brief — would have put the academy's levels beside the association's stages
 * and taught every volunteer that passing courses is what moves them through
 * the ranks. It is not, and that misunderstanding would have been expensive to
 * undo later.
 *
 * A permanent redirect rather than a deletion: this path already exists in
 * sent notifications, in the map's own breadcrumb, and in whatever anybody
 * bookmarked. Nothing that was here is lost — the map shows all of it, plus
 * the skill map, the badges and the next certificate.
 */
export default async function PathPage(props: PageProps<'/[lang]/account/path'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  permanentRedirect(`/${lang}/account/map`);
}
