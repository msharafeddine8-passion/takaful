'use client';

import { useActionState, useMemo, useState } from 'react';
import { saveAttendanceAction, type SaveAttendanceState } from '@/lib/actions/attendance';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * The attendance sheet for one activity.
 *
 * It is one form for everybody, saved once. The page it replaces saved a
 * person per button press and then refused to hear any more, so a duration
 * typed wrongly stayed wrong, and anything entered for the others was thrown
 * away on every reload.
 *
 * Nobody counts as present until «حفظ الحضور» is pressed, and if anyone is
 * still undecided the form says so before it lets that happen — a blank is far
 * more often an oversight than a decision.
 */

type T = Dictionary['account']['activities'];
type Att = Dictionary['account']['attendance'];

export type SheetPerson = {
  user_id: string;
  full_name: string;
  member_number: number | null;
  email: string;
  registration_status: string;
  attended: boolean | null;
  attended_minutes: number | null;
  note: string | null;
};

type Mark = 'attended' | 'absent' | 'unset';

const empty: SaveAttendanceState = {};

export function AttendanceSheet({
  lang,
  activityId,
  people,
  scheduledMinutes,
  t,
  att,
}: {
  lang: Locale;
  activityId: string;
  people: SheetPerson[];
  scheduledMinutes: number | null;
  t: T;
  att: Att;
}) {
  const [state, formAction, pending] = useActionState(saveAttendanceAction, empty);

  const [marks, setMarks] = useState<Record<string, Mark>>(() =>
    Object.fromEntries(
      people.map((p) => [p.user_id, p.attended === null ? 'unset' : p.attended ? 'attended' : 'absent']),
    ),
  );
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'attended' | 'absent' | 'unset'>('all');
  const [confirming, setConfirming] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (filter !== 'all' && marks[p.user_id] !== filter) return false;
      if (!q) return true;
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        String(p.member_number ?? '').includes(q)
      );
    });
  }, [people, marks, filter, query]);

  const counts = useMemo(() => {
    let attended = 0, absent = 0, unset = 0;
    for (const p of people) {
      const m = marks[p.user_id];
      if (m === 'attended') attended++;
      else if (m === 'absent') absent++;
      else unset++;
    }
    return { attended, absent, unset, total: people.length };
  }, [people, marks]);

  /* Someone whose attendance is already recorded is being corrected, not
   * recorded — and a correction moves hours that a volunteer may already have
   * been told about, so it is confirmed rather than done silently. */
  const editingSaved = people.some((p) => p.attended !== null);
  const needsConfirm = counts.unset > 0 || editingSaved;

  const setAll = (mark: Mark) =>
    setMarks(Object.fromEntries(people.map((p) => [p.user_id, mark])));

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (needsConfirm && !confirming) {
          e.preventDefault();
          setConfirming(true);
        }
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="activityId" value={activityId} />

      {/* Where the sheet stands, before it is saved. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={att.registered} value={counts.total} />
        <Stat label={att.attendedCount} value={counts.attended} tone="ok" />
        <Stat label={att.absentCount} value={counts.absent} tone="bad" />
        <Stat label={att.unsetCount} value={counts.unset} tone="warn" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={att.searchPlaceholder}
          aria-label={att.searchPlaceholder}
          className="min-h-11 w-full rounded-xl border border-line bg-ground px-4 text-[0.95rem] sm:w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'attended', 'absent', 'unset'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-11 rounded-full px-4 text-[0.88rem] font-bold transition-colors ${
                filter === f ? 'bg-brand-blue text-white' : 'border border-line hover:bg-surface-2'
              }`}
            >
              {att.filters[f]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAll('attended')}
          className="min-h-11 rounded-full border border-line px-4 text-[0.88rem] font-bold hover:bg-surface-2"
        >
          {att.markAllPresent}
        </button>
      </div>

      <ul className="mt-5 space-y-3">
        {visible.map((p) => {
          const mark = marks[p.user_id];
          const initial = p.attended_minutes ?? scheduledMinutes ?? 60;
          return (
            <li key={p.user_id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.05rem] font-extrabold">{p.full_name}</span>
                {/* Enough to tell two volunteers of the same name apart. */}
                <span className="text-[0.85rem] text-ink-3" dir="ltr">
                  {p.member_number ? `T${String(p.member_number).padStart(3, '0')}` : p.email}
                </span>
                {p.registration_status === 'waitlisted' && (
                  <span className="text-[0.82rem] font-bold text-ink-3">{t.waitlist}</span>
                )}
                {p.attended !== null && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.78rem] font-bold text-ink-2">
                    {att.alreadySaved}
                  </span>
                )}
              </div>

              {/* Radios, so present and absent can never both be chosen. */}
              <fieldset className="mt-3">
                <legend className="sr-only">{att.statusLegend.replace('{name}', p.full_name)}</legend>
                <div className="flex flex-wrap gap-2">
                  {(['attended', 'absent'] as const).map((value) => (
                    <label
                      key={value}
                      className={`min-h-11 cursor-pointer rounded-full border-2 px-5 py-2.5 text-[0.9rem] font-bold transition-colors ${
                        mark === value
                          ? value === 'attended'
                            ? 'border-ok bg-ok/15 text-ok-text dark:text-ok'
                            : 'border-bad bg-bad/10 text-bad-text dark:text-bad'
                          : 'border-line hover:bg-surface-2'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mark.${p.user_id}`}
                        value={value}
                        checked={mark === value}
                        onChange={() => setMarks((m) => ({ ...m, [p.user_id]: value }))}
                        className="sr-only"
                      />
                      {value === 'attended' ? att.present : att.absent}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Duration only matters for someone who came. */}
              {mark === 'attended' && (
                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[0.85rem] font-bold">{att.hoursField}</span>
                    <input
                      name={`hours.${p.user_id}`}
                      type="number"
                      min="0"
                      max="24"
                      defaultValue={Math.floor(initial / 60)}
                      dir="ltr"
                      className="w-20 rounded-xl border border-line bg-ground px-3 py-2 text-[0.95rem]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[0.85rem] font-bold">{att.minutesField}</span>
                    <input
                      name={`minutes.${p.user_id}`}
                      type="number"
                      min="0"
                      max="59"
                      defaultValue={initial % 60}
                      dir="ltr"
                      className="w-20 rounded-xl border border-line bg-ground px-3 py-2 text-[0.95rem]"
                    />
                  </label>
                  {scheduledMinutes && (
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[0.9rem] font-bold">
                      <input type="checkbox" name={`full.${p.user_id}`} className="size-5" />
                      {att.wholeActivity}
                    </label>
                  )}
                </div>
              )}

              <label className="mt-3 block">
                <span className="mb-1.5 block text-[0.85rem] font-bold text-ink-2">{att.noteField}</span>
                <input
                  name={`note.${p.user_id}`}
                  defaultValue={p.note ?? ''}
                  className="min-h-11 w-full rounded-xl border border-line bg-ground px-4 text-[0.92rem]"
                />
              </label>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <p className="mt-5 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {att.noMatches}
        </p>
      )}

      <div className="sticky bottom-0 mt-8 border-t border-line bg-ground/95 py-4 backdrop-blur">
        {confirming && (
          <p role="alert" className="mb-3 rounded-xl border-2 border-brand-orange bg-brand-orange/10 p-4 text-[0.95rem] font-bold">
            {counts.unset > 0
              ? att.warnUnset.replace('{n}', String(counts.unset))
              : att.warnEditing}
          </p>
        )}
        {state.ok && (
          <p role="status" className="mb-3 rounded-xl border-2 border-ok bg-ok/10 p-4 text-[0.95rem] font-bold">
            {att.saved.replace('{n}', String(state.saved ?? 0))}
            {state.error === 'overLong' ? ` — ${att.cappedToActivity}` : ''}
          </p>
        )}
        {state.error && !state.ok && (
          <p role="alert" className="mb-3 rounded-xl border-2 border-bad bg-bad/10 p-4 text-[0.95rem] font-bold">
            {att.errors[state.error] ?? att.errors.unavailable}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-brand-orange px-7 py-3 text-[0.98rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
        >
          {pending ? att.saving : confirming ? att.confirmSave : att.save}
        </button>
      </div>
    </form>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'bad' | 'warn' }) {
  const colour =
    tone === 'ok' ? 'text-ok-text dark:text-ok'
      : tone === 'bad' ? 'text-bad-text dark:text-bad'
        : tone === 'warn' ? 'text-brand-orange-text dark:text-brand-orange'
          : '';
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[0.82rem] font-bold text-ink-2">{label}</p>
      <p className={`mt-1 text-[1.5rem] font-black ${colour}`} dir="ltr">{value}</p>
    </div>
  );
}
