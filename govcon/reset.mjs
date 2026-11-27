import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { db, hash, transaction, passwordSecret } from './store.mjs';

db.exec(`
 CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES users(email),
  password_version TEXT NOT NULL, expires INTEGER NOT NULL
 );
 CREATE TABLE IF NOT EXISTS reset_limits (
  key TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL
 );
`);
export const resetNotice = 'If an account matches that email, a password-reset link will be sent. Check your inbox and spam folder.';
export function mailConfigured() {
 return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(process.env.RESET_FROM || '');
}
function allow(key, max) {
 const time = Date.now();
 db.prepare('DELETE FROM reset_limits WHERE window<=?').run(time - 3600000);
 const current = db.prepare('SELECT count FROM reset_limits WHERE key=?').get(key);
 if (current && current.count >= max) return false;
 db.prepare('INSERT INTO reset_limits VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,time);
 return true;
}
export function resetAccount(token) {
 if (!/^[a-f0-9]{64}$/.test(token || '')) return undefined;
 return db.prepare(`SELECT users.email, users.role FROM password_resets
  JOIN users USING(email) WHERE token=? AND expires>? AND password_version=users.password`).get(hash(token),Date.now());
}
export function completeReset(token, password, confirmation) {
 if (password !== confirmation) throw Error('The passwords do not match.');
 if (typeof password !== 'string' || password.length < 16 || password.length > 256)
  throw Error('Use a password between 16 and 256 characters.');
 transaction(() => {
  const user = resetAccount(token);
  if (!user) throw Error('This reset link has expired or already been used. Request a new link.');
  provisionReset(user,password);
 });
}
function provisionReset(user,password) {
 const secret = passwordSecret(password);
 db.prepare('UPDATE users SET password=? WHERE email=?').run(secret,user.email);
 db.prepare('DELETE FROM sessions WHERE email=?').run(user.email);
 db.prepare('DELETE FROM password_resets WHERE email=?').run(user.email);
}
export async function requestReset(email, origin) {
 if (!mailConfigured()) throw Error('Password-reset email is awaiting setup. Contact the dashboard administrator.');
 const normalized = String(email || '').trim().toLowerCase();
 if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return;
 const request = transaction(() => {
  if (!allow('global',30) || !allow(hash(normalized),3)) return;
  db.prepare('DELETE FROM password_resets WHERE expires<=?').run(Date.now());
  const user = db.prepare('SELECT password FROM users WHERE email=?').get(normalized);
  if (!user) return;
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM password_resets WHERE email=?').run(normalized);
  db.prepare('INSERT INTO password_resets VALUES (?,?,?,?)').run(hash(token),normalized,user.password,Date.now()+1800000);
  return { token, email:normalized };
 });
 if (!request) return;
 try {
  const link = new URL('/reset-password',origin);
  link.searchParams.set('token',request.token);
  await deliver(request.email,link.href);
 } catch {
  db.prepare('DELETE FROM password_resets WHERE token=?').run(hash(request.token));
  // Delivery failures must not disclose whether a submitted account exists.
  console.error('GovCon password-reset email could not be delivered. Check the server mail service.');
 }
}
function deliver(email, link) {
 return new Promise((resolve,reject) => {
  const child = spawn(process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',['-t','-i'],{stdio:['pipe','ignore','ignore']});
  const timer = setTimeout(() => { child.kill(); reject(Error('Mail timeout')); },10000);
  child.on('error',error => { clearTimeout(timer); reject(error); });
  child.stdin.on('error',error => { clearTimeout(timer); reject(error); });
  child.on('close',code => { clearTimeout(timer); code===0 ? resolve() : reject(Error('Mail failed')); });
  child.stdin.end('From: '+process.env.RESET_FROM+'\nTo: '+email+'\nSubject: Reset your EVOBRAND GovCon password\nMIME-Version: 1.0\nContent-Type: text/plain; charset=UTF-8\n\n'+
   'Use this link to choose a new password. It expires in 30 minutes and can be used once.\n\n'+link+'\n\nIf you did not request this, you can ignore this email.\n');
 });
}
