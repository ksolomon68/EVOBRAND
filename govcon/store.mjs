import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

const data = new URL('./data/', import.meta.url);
mkdirSync(data, { recursive: true });
export const db = new DatabaseSync(new URL('capture.sqlite', data));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
export const hash = value => createHash('sha256').update(value).digest('hex');
const derive = (password, salt) => scryptSync(password, salt, 64);
export const now = () => new Date().toISOString();
export function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function provision(email, role, password) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['admin','editor','viewer'].includes(role) || password.length < 16 || password.length > 256)
    throw new Error('Use an email, admin/editor/viewer role, and a 16–256 character password.');
  const salt = randomBytes(16).toString('hex');
  const secret = salt + ':' + derive(password, salt).toString('hex');
  transaction(() => {
    db.prepare('INSERT INTO users VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET password=excluded.password,role=excluded.role').run(email, secret, role);
    db.prepare('DELETE FROM sessions WHERE email=?').run(email);
    db.prepare("INSERT OR IGNORE INTO records VALUES ('codered','partners','CodeRed Business Solutions',NULL,NULL,NULL,?,?,?)")
      .run(JSON.stringify({status:'Prospective',notes:'Developing relationship in the capture plan. Confirm roles and workshare per pursuit.'}),now(),now());
  });
}
export function authenticate(email, password) {
  const user = db.prepare('SELECT password FROM users WHERE email=?').get(email);
  const [salt, digest] = (user?.password ?? '00000000000000000000000000000000:' + '00'.repeat(64)).split(':');
  return timingSafeEqual(derive(password,salt),Buffer.from(digest,'hex')) && !!user;
}
export function issue(email) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token),email,Date.now()+28800000);
  return token;
}
export function session(token) {
  return db.prepare('SELECT users.email, role FROM sessions JOIN users USING(email) WHERE token=? AND expires>?').get(hash(token),Date.now());
}
export function write(record, actor, action) {
  const id = record.id || randomUUID();
  const at = now();
  db.prepare('INSERT INTO records VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,source=excluded.source,external_id=excluded.external_id,parent=excluded.parent,data=excluded.data,updated=excluded.updated')
    .run(id,record.kind,record.title,record.source,record.externalId,record.parent,JSON.stringify(record.data),at,at);
  db.prepare('INSERT INTO activity(record_id,actor,action,snapshot,at) VALUES (?,?,?,?,?)')
    .run(id,actor,action,JSON.stringify({...record,id}),at);
  return id;
}
