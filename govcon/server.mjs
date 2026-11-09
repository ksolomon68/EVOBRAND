import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { db, authenticate, issue, session, hash, transaction, write } from './store.mjs';
import { validate } from './model.mjs';
import { render, login } from './view.mjs';

const port = Number(process.env.PORT || 4173);
const bindHost = process.env.HOST || '127.0.0.1';
// PUBLIC_ORIGIN is the address users actually reach this at (e.g. behind a
// reverse proxy on a real domain). Defaults to the plain local address so
// nothing changes for the local, single-machine setup described in README.md.
const origin = process.env.PUBLIC_ORIGIN || 'http://127.0.0.1:'+port;
const originHost = new URL(origin).host;
const secure = origin.startsWith('https://');
const get = id => db.prepare('SELECT * FROM records WHERE id=?').get(id);
const css = readFileSync(new URL('./style.css',import.meta.url));
const attempts = new Map();
const cookie = (token,seconds) => 'capture='+token+'; Path=/; HttpOnly; SameSite=Strict'+(secure?'; Secure':'')+'; Max-Age='+seconds;
function send(res,status,body,type='text/html; charset=utf-8') {
 res.writeHead(status,{'Content-Type':type});
 res.end(body);
}
function redirect(res,path) { res.writeHead(303,{Location:path}); res.end(); }
async function body(req) {
 const chunks=[];
 let size=0;
 for await(const chunk of req) {
  size+=chunk.length;
  if(size>512000) throw Error('Request exceeds 500 KB.');
  chunks.push(chunk);
 }
 return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString()));
}
createServer(async (req,res)=>{
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 if(req.headers.host!==originHost) return send(res,403,'Invalid host. Use '+origin,'text/plain');
 const url=new URL(req.url,origin), path=url.pathname;
 const token=req.headers.cookie?.match(/(?:^|; )capture=([a-f0-9]{64})(?:;|$)/)?.[1]||'';
 if(req.method==='GET' && path==='/style.css') return send(res,200,css,'text/css');
 const user=session(token);
 if(req.method==='POST' && req.headers.origin!==origin) return send(res,403,'Invalid request origin.','text/plain');
 try {
  if(req.method==='POST' && path==='/login'){
   const form=await body(req);
   const time=Date.now(), key=req.socket.remoteAddress;
   const recent=(attempts.get(key)||[]).filter(t=>time-t<60000);
   if(recent.length>=8) return send(res,429,login('Too many attempts. Try again in a minute.'));
   recent.push(time); attempts.set(key,recent);
   const email=(form.email||'').trim().toLowerCase();
   if(email.length>254 || !form.password || form.password.length>256 || !authenticate(email,form.password)) return send(res,401,login('Email or password is incorrect.'));
   if(token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
   res.setHeader('Set-Cookie',cookie(issue(email),28800));
   return redirect(res,'/');
  }
  if(!user) return send(res,200,login());
  if(req.method==='POST' && path==='/logout'){
   db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
   res.setHeader('Set-Cookie',cookie('',0));
   return redirect(res,'/');
  }
  if(req.method==='POST'){
   if(user.role==='viewer' || (path==='/import' && user.role!=='admin')) return send(res,403,'This role cannot perform that action.','text/plain');
   const form=await body(req);
   if(path==='/save'){
    const id=transaction(()=>{
     const existing=form.id?get(form.id):null;
     if(form.id && (!existing || existing.kind!==form.kind || existing.updated!==form.version)) throw Error('Record changed. Reload and try again.');
     const record=validate(form.kind,form,get);
     return write({...record,id:existing?.id},user.email,existing?'Updated':'Created');
    });
    return redirect(res,'/record?id='+id);
   }
   if(path==='/import'){
    const rows=JSON.parse(form.rows);
    if(!Array.isArray(rows)||!rows.length||rows.length>250) throw Error('Provide an array of 1–250 records.');
    transaction(()=>{
     for(const [index,input] of rows.entries()){
      try { write(validate(input.kind,input,get),user.email,'Imported'); }
      catch(error){ throw Error('Row '+(index+1)+': '+(error.code?.startsWith('SQLITE')?'Duplicate or invalid record.':error.message)); }
     }
    });
    return redirect(res,'/import?count='+rows.length);
   }
   return send(res,404,'Page not found.','text/plain');
  }
  if(req.method!=='GET') return send(res,405,'Method not allowed.','text/plain');
  const rows=db.prepare('SELECT * FROM records ORDER BY updated DESC').all().map(r=>({...r,data:JSON.parse(r.data)}));
  const history=db.prepare('SELECT activity.*, records.title FROM activity JOIN records ON records.id=record_id ORDER BY activity.id DESC').all();
  const page=render(url,user,rows,history);
  return send(res,page?200:404,page||'Page not found.');
 } catch(error){
  const message=error.code==='ERR_SQLITE_ERROR'?'Database rejected the change. Check for an existing record with the same source and external ID.':error.message;
  return send(res,400,render(url,user,[],[],message));
 }
}).listen(port,bindHost,()=>console.log('EVOBRAND Capture Desk '+origin));
