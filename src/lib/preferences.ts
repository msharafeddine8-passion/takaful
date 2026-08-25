/**
 * What a volunteer may switch off, and what switching it off actually does.
 *
 * WHY SUBJECTS AND NOT KINDS
 *
 * notification_preferences.muted_kinds already exists, already works, and is
 * the wrong thing to show a person. It stores notification kinds —
 * 'badge.earned', 'activity.reminder' — which are names this codebase gives
 * itself and renames whenever a feature is split in two. A preference stored
 * against a kind stops applying the day that kind is renamed, silently, and
 * the person starts receiving something they asked not to.
 *
 * A subject does not have that problem. Somebody switches off «الشارات», and
 * TOPIC_KINDS below says which kinds that covers today. A kind added next
 * month joins its subject in one edit here, and every stored preference
 * already covers it.
 *
 * muted_kinds is left exactly as it was. It is still read, still honoured, and
 * still the finer instrument — this sits alongside it rather than replacing
 * it, because rewriting stored consent to a new shape is how consent gets
 * lost.
 *
 * ABOUT 'ranking'
 *
 * It maps to no notification kind, and that is the honest state of the
 * platform rather than an omission. Nothing notifies anybody about a
 * leaderboard position: migration 032 gives the reason and it is a good one —
 * a place that moves every time somebody else logs an hour is not news, it is
 * noise with a name attached.
 *
 * It is not therefore a dead switch. `hidesPanel(topics, 'ranking')` is the
 * question a ranking surface has to ask before it shows somebody where they
 * stand, and it is the reason this subject is stored ahead of the page that
 * needs it — the same order migration 033 put consent in, and for the same
 * reason: a ranking must not be able to ship without having asked.
 *
 * PURE. The NotificationKind import is type-only and therefore erased, so a
 * client component may import this file without dragging 'server-only' into
 * the browser bundle.
 */

import type { NotificationKind } from './notify';

/** The four, in the order the settings page lists them. */
export const NOTIFICATION_TOPICS = ['ranking', 'badges', 'challenges', 'birthdays'] as const;

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];

export function isNotificationTopic(value: unknown): value is NotificationTopic {
  return typeof value === 'string' && (NOTIFICATION_TOPICS as readonly string[]).includes(value);
}

/**
 * Which notification kinds each subject covers.
 *
 * Two subjects are empty today and both are meant to be. Nothing announces a
 * ranking, for the reason above; a shared challenge is a panel on the account
 * page rather than a message, because a goal the whole association is working
 * towards should not arrive as forty separate congratulations. Both switches
 * still do something — see `hidesPanel` — and both are ready for the kinds
 * their features will add.
 *
 * 'milestone.reached' is deliberately under no subject. A milestone is a
 * private sentence about something this person did, sent once in their life,
 * and there is no version of "too many of these" — grouping it under badges
 * would let somebody who dislikes badges lose the note thanking them for their
 * first year.
 */
export const TOPIC_KINDS: Record<NotificationTopic, readonly NotificationKind[]> = {
  ranking: [],
  badges: ['badge.earned'],
  challenges: [],
  birthdays: ['birthday.greeting'],
};

/** Reads whatever the column gave us as a clean set of subjects. */
export function topicsFrom(stored: readonly string[] | null | undefined): NotificationTopic[] {
  if (!Array.isArray(stored)) return [];
  return NOTIFICATION_TOPICS.filter((topic) => stored.includes(topic));
}

/**
 * Whether this person has switched off anything that would stop `kind`.
 *
 * Takes both columns because both are real. muted_kinds is the older, finer
 * setting and a person may hold one from before this page existed; ignoring it
 * here would quietly re-enable something they had already turned off.
 *
 * Says nothing about the kinds that are never muted — notify.ts holds that
 * list, because "you were told your application was decided" is not a
 * preference and must not be reachable through one.
 */
export function mutes(
  mutedKinds: readonly string[] | null | undefined,
  mutedTopics: readonly string[] | null | undefined,
  kind: NotificationKind,
): boolean {
  if (Array.isArray(mutedKinds) && mutedKinds.includes(kind)) return true;
  return topicsFrom(mutedTopics).some((topic) => TOPIC_KINDS[topic].includes(kind));
}

/**
 * Whether a panel belonging to `topic` should be left off this person's
 * account page.
 *
 * The two subjects with no notification kinds reach people through the page
 * instead, and a switch that visibly does nothing is worse than no switch: it
 * teaches somebody that their preferences are decorative. Turning off
 * challenges takes the shared-goal panel away; turning off birthdays takes
 * away the banner about other people's.
 *
 * Deliberately not applied to anything that is a person's own record. Opting
 * out of a ranking is not opting out of knowing your own hours — visibility.ts
 * makes the same point about consent, and it holds here too.
 */
export function hidesPanel(
  mutedTopics: readonly string[] | null | undefined,
  topic: NotificationTopic,
): boolean {
  return topicsFrom(mutedTopics).includes(topic);
}
