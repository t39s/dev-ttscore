import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {check} from '../public/domain.mjs';
export class SqliteRepository{
 constructor(path='data/prototype.sqlite'){mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, version INTEGER NOT NULL, body TEXT NOT NULL)');}
 async read(id){const r=this.db.prepare('SELECT version,body FROM teams WHERE id=?').get(id);return r?{value:JSON.parse(r.body),etag:r.version}:{value:null,etag:-1};}
 async cas(id,etag,value){if(etag===-1){return this.db.prepare('INSERT OR IGNORE INTO teams VALUES (?,0,?)').run(id,JSON.stringify(value)).changes===1;}return this.db.prepare('UPDATE teams SET body=?,version=version+1 WHERE id=? AND version=?').run(JSON.stringify(value),id,etag).changes===1;}
 close(){this.db.close();}
}
export class RtdbRepository{
 constructor(base='http://127.0.0.1:19000',namespace='demo-ttscore-next-default-rtdb'){
 const u=new URL(base);check(u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname),'Этот адаптер разрешает только локальный эмулятор');check(/^demo-[a-z0-9-]+$/.test(namespace),'Только demo namespace');this.base=base;this.namespace=namespace;
 }
 url(id){return `${this.base}/prototype/teams/${encodeURIComponent(id)}.json?ns=${this.namespace}`;}
 async read(id){const r=await fetch(this.url(id),{headers:{Authorization:'Bearer owner','X-Firebase-ETag':'true'},signal:AbortSignal.timeout(8000)});check(r.ok,'RTDB read failed','transport');const data=await r.json();return {value:data?JSON.parse(data.body):null,etag:r.headers.get('etag')};}
 async cas(id,etag,value){const r=await fetch(this.url(id),{method:'PUT',headers:{Authorization:'Bearer owner','Content-Type':'application/json','if-match':etag},body:JSON.stringify({body:JSON.stringify(value)}),signal:AbortSignal.timeout(8000)});if(r.status===412)return false;check(r.ok,'RTDB write failed','transport');return true;}
 close(){}
}
