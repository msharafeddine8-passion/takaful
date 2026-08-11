/**
 * Issues a certificate and checks what a holder and a verifier actually get,
 * including the QR that goes on the printed page.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import QRCode from 'qrcode';
import { findByCode, certificatesFor, generateCode, normaliseCode } from '../src/lib/certificates.ts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}

const MARK = `cert-${Date.now()}`;
let u = '';

try {
  u = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [u, `${MARK}@example.test`, 'x']);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [u, 'محمد شرف الدين']);

  const code = generateCode();
  const snapshot = {
    fullName: 'محمد شرف الدين',
    titleAr: 'شهادة إتمام — العمل ضمن فريق',
    titleEn: 'Certificate of completion — Teamwork',
  };
  await c.query(
    `INSERT INTO certificates (id, code, user_id, kind, course_slug, snapshot)
     VALUES ($1, $2, $3, 'course', 'teamwork', $4)`,
    [randomUUID(), code, u, JSON.stringify(snapshot)]);

  console.log('\n--- what the holder gets ---');
  const mine = await certificatesFor(u);
  check('the certificate appears in their list', mine.length === 1);
  check('the Arabic title survived storage', mine[0]?.snapshot.titleAr === snapshot.titleAr,
    mine[0]?.snapshot.titleAr);
  check('the holder name is frozen in the snapshot',
    mine[0]?.snapshot.fullName === 'محمد شرف الدين');

  console.log('\n--- the snapshot does not follow a profile edit ---');
  await c.query(`UPDATE profiles SET full_name = 'اسم مختلف' WHERE user_id = $1`, [u]);
  const after = await findByCode(code);
  check('the certificate still says the original name',
    after?.snapshot.fullName === 'محمد شرف الدين', after?.snapshot.fullName);

  console.log('\n--- what a verifier gets ---');
  const found = await findByCode(code);
  check('lookup by exact code works', found !== null);
  const lower = await findByCode(code.toLowerCase());
  check('lookup works from a lowercase code read off paper', lower !== null);
  const spaced = await findByCode(code.replace(/-/g, ' '));
  check('lookup works when the dashes were typed as spaces', spaced !== null,
    normaliseCode(code.replace(/-/g, ' ')));
  const wrong = await findByCode('TKF-ZZZZ-ZZZZ');
  check('an unknown code returns nothing rather than something', wrong === null);

  console.log('\n--- the QR that goes on the printed page ---');
  const url = `https://www.takafullb.com/ar/verify?code=${code}`;
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
  check('a QR is produced', svg.startsWith('<svg'), `${svg.length} chars`);
  check('it is inline SVG, so it prints with no network request',
    !svg.includes('http://') || svg.indexOf('http://www.w3.org') === svg.indexOf('http://'));
  check('it is not a raster image that would print blurry', svg.includes('<path'));

  console.log('\n--- revocation ---');
  await c.query(
    `UPDATE certificates SET revoked_at = now(), revoke_reason = 'probe' WHERE code = $1`, [code]);
  const revoked = await findByCode(code);
  check('a revoked certificate still resolves, so the page can say why',
    revoked !== null && revoked.revoked_at !== null);
  check('and carries the reason', revoked?.revoke_reason === 'probe');

} finally {
  await c.query('DELETE FROM certificates WHERE user_id = $1', [u]);
  await c.query('DELETE FROM profiles WHERE user_id = $1', [u]);
  await c.query('DELETE FROM users WHERE id = $1', [u]);
  const left = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}%`])).rows[0].n;
  console.log(`\ncleanup: ${left} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
