/*
 * Who the association recognises without a person looking, and who it does not.
 *
 * Recognising a returning volunteer on the spot removes a step that was pure
 * friction: an administrator pressing a button that says nothing more than
 * "yes, that is them" about somebody the association vouched for years ago.
 * The risk it introduces is the opposite one — handing a stranger somebody
 * else's membership number, seniority and volunteer standing, with nobody in
 * the loop to notice.
 *
 * So the line matters more than the feature does, and this holds it: two
 * independent facts agreeing is enough, a phone number on its own is not. The
 * case that keeps `phone-only` out is a household sharing one number, which in
 * Lebanon is not an edge case.
 *
 * A PURE probe: the matcher and the rule are both pure, so no database is
 * touched and nothing here can be affected by what happens to be in one.
 */

import {
  foldName, formatMemberNumber, namesAgree, normaliseStoredTail, phoneTail,
} from '../src/lib/roster-match.ts';
import type { MatchStrength } from '../src/lib/roster-match.ts';

let ok = 0;
const holes: string[] = [];

function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

const eq = (what: string, got: unknown, want: unknown) =>
  check(what, Object.is(got, want), got === want ? '' : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);

/* ------------------------------------------------------------------ *
 * 1. The rule itself
 * ------------------------------------------------------------------ */
console.log('\n1. what is recognised without a human');

/* Read out of the action source rather than imported: roster.ts carries
 * 'use server', so importing it from a plain script pulls in the whole server
 * runtime. Reading the file is blunt, but it checks what actually ships. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(`${ROOT}src/lib/actions/roster.ts`, 'utf8');

const declared = /const SELF_EVIDENT:[^=]*=\s*\[([^\]]*)\]/.exec(source);
check('the auto-approval list is declared where it can be found', declared !== null);

const listed = (declared?.[1] ?? '')
  .split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

const ALL: MatchStrength[] = ['phone-and-name', 'phone-only', 'number-and-name'];
eq('a phone and a name that agree is enough', listed.includes('phone-and-name'), true);
eq('a membership number and a name that agree is enough', listed.includes('number-and-name'), true);
eq('a phone alone is NOT enough — households share numbers', listed.includes('phone-only'), false);
eq('nothing else has been added to the list', listed.length, 2);
check(
  'every listed strength is one the matcher can actually return',
  listed.every((s) => (ALL as string[]).includes(s)),
  listed.join(', '),
);

/* The other half of the rule: the automatic path must not sign itself. */
check(
  'an automatic recognition records no human reviewer',
  /reviewer:\s*null/.test(source),
  'reviewer: null is what keeps approved_by and granted_by honest',
);
check(
  'the automatic and staff paths share one implementation',
  (source.match(/await recogniseFromRoster\(/g) ?? []).length === 2,
  'two call sites, one function — so the two can never drift',
);
check(
  'an automatic recognition is logged under its own action',
  source.includes("'roster.auto_approved'"),
  'so a rule and a person can be told apart later',
);

/* ------------------------------------------------------------------ *
 * 2. The name comparison the rule leans on
 * ------------------------------------------------------------------ */
console.log('\n2. names agree across the spellings Arabic actually uses');

check('the same name written the same way agrees', namesAgree('محمد شرف الدين', 'محمد شرف الدين'));
check('alif with and without hamza agree', namesAgree('احمد ابراهيم', 'أحمد إبراهيم'));
check('taa marbuta and haa agree', namesAgree('فاطمة زهره', 'فاطمه زهرة'));
check('alif maqsura and yaa agree', namesAgree('مصطفى حسن', 'مصطفي حسن'));
check('diacritics are ignored', namesAgree('حُسَين عَلي', 'حسين علي'));
check('tatweel is ignored', namesAgree('محـــمد حسن', 'محمد حسن'));
check('doubled spaces are ignored', namesAgree('علي   حسن', 'علي حسن'));
check('a longer name meets the shorter form of itself', namesAgree('محمد علي حسن', 'محمد حسن'));

/* The important half: names that must NOT agree, because agreeing here is how
 * one person is handed another person's record with nobody watching. */
check('a different person does not agree', !namesAgree('محمد شرف الدين', 'سارة الخطيب'));
check('one shared word is not enough', !namesAgree('محمد خليل', 'محمد الخطيب'));
check('a single-word name is never enough on its own', !namesAgree('مصطفى', 'مصطفى'),
  'one word cannot reach two, so these go to staff rather than through');
check('an empty roster name agrees with nothing', !namesAgree('', 'محمد حسن'));
check('an empty account name agrees with nothing', !namesAgree('محمد حسن', ''));

/* Word order is not significant — two shared words is two shared words. Stated
 * because it is a real property somebody will otherwise rediscover as a bug. */
check('word order does not matter', namesAgree('علي حسن', 'حسن علي'));

console.log('\n3. folding is stable');
eq('folding is idempotent', foldName(foldName('أحمــد إبراهيم')), foldName('أحمــد إبراهيم'));
eq('folding collapses the alif variants to one form', foldName('أحمد'), foldName('احمد'));
eq('folding collapses taa marbuta', foldName('فاطمة'), foldName('فاطمه'));
eq('folding collapses alif maqsura', foldName('مصطفى'), foldName('مصطفي'));

/* ------------------------------------------------------------------ *
 * 4. The identifiers either side of the rule
 * ------------------------------------------------------------------ */
console.log('\n4. phone numbers and membership numbers');

/* The whole point: one line, however it is written. An 03 number is the case
 * the old last-eight-digits rule got wrong, so it leads. */
eq('a local 03 number reduces to its national digits', phoneTail('03 123 456'), '3123456');
eq('written with +961 it is the same number', phoneTail('+961 3 123 456'), '3123456');
eq('written with 00961 it is the same number', phoneTail('00961 3 123 456'), '3123456');
eq('punctuation and spacing are ignored', phoneTail('03-123-456'), phoneTail('03123456'));

/* The prefixes that were always fine must stay fine. */
eq('an 81 mobile keeps its prefix', phoneTail('81 123 456'), '81123456');
eq('the same 81 mobile with a country code matches it', phoneTail('+961 81 123 456'), '81123456');
eq('a 70 mobile matches across both spellings', phoneTail('+96170123456'), phoneTail('70123456'));
eq('a 76 mobile matches across both spellings', phoneTail('0096176123456'), phoneTail('76123456'));

/* A landline, which had the same trunk-zero problem as 03. */
eq('a Beirut landline reduces to its national digits', phoneTail('01 234 567'), '1234567');
eq('the same landline with a country code matches it', phoneTail('+961 1 234 567'), '1234567');

/* Two different lines must never collide. */
check('two different numbers do not reduce to one key', phoneTail('03 123 456') !== phoneTail('03 123 457'));
check('a mobile and a landline do not collide', phoneTail('81 123 456') !== phoneTail('01 234 567'));

eq('too short is not a phone number', phoneTail('1234'), null);
eq('nothing is not a phone number', phoneTail(''), null);
eq('a country code with nothing after it is not a phone number', phoneTail('+961'), null);

/* The roster was imported under the old key and only the key was kept, so the
 * two sides have to be reduced to a common form. Getting this wrong silently
 * un-finds the eleven people the corrected rule was meant to find — and being
 * un-found now means being told to fill in an application. */
console.log('\n5. numbers imported under the old key are still found');

/* Every shape the roster actually holds, against every shape a volunteer might
 * type. Each pair must meet. */
const IMPORTED_AND_TYPED: Array<[stored: string, typed: string, what: string]> = [
  ['03998877', '03 998 877', 'an 03 number typed the way it was imported'],
  ['03998877', '+961 3 998 877', 'the same 03 number typed with a country code'],
  ['03998877', '00961 3 998 877', 'the same 03 number dialled internationally'],
  ['01234567', '+961 1 234 567', 'a landline typed with a country code'],
  ['81123456', '81 123 456', 'an 81 mobile, which never had the problem'],
  ['81123456', '+961 81 123 456', 'an 81 mobile with a country code'],
  ['76123456', '0096176123456', 'a 76 mobile dialled internationally'],
];
for (const [stored, typed, what] of IMPORTED_AND_TYPED) {
  eq(what, phoneTail(typed), normaliseStoredTail(stored));
}

/* And the pairs that must NOT meet, since this comparison is now what decides
 * whether somebody is handed a stranger's membership number. */
check('two different stored lines stay different',
  normaliseStoredTail('03998877') !== normaliseStoredTail('03998878'));
check('a stored mobile does not meet a different typed number',
  phoneTail('03 998 878') !== normaliseStoredTail('03998877'));
check('normalising takes off one zero, not every zero',
  normaliseStoredTail('00123456') === '0123456');

/* The database repeats this expression in SQL. If one side is ever changed
 * without the other, everybody with an 03 number silently stops being found. */
const sql = readFileSync(`${ROOT}src/lib/roster.ts`, 'utf8');
check('findRosterMatch normalises the stored key the same way',
  /regexp_replace\(phone_tail,\s*'\^0',\s*''\)/.test(sql),
  "the SQL half of normaliseStoredTail");

eq('a membership number keeps its T and its padding', formatMemberNumber(14), 'T014');
eq('a three-digit number is not padded further', formatMemberNumber(474), 'T474');
eq('a four-digit number is not truncated', formatMemberNumber(1024), 'T1024');

/* ------------------------------------------------------------------ */

if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}

console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
