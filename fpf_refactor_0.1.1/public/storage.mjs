import {check,clone} from './domain.mjs';
export const faults={offline:false,failSave:false,dropAccept:false};
export function openStore(){return new Promise((resolve,reject)=>{const r=indexedDB.open('ttscore-prototype-0.1.0',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onerror=()=>reject(r.error);r.onsuccess=()=>resolve(new Store(r.result));});}
class Store{
 constructor(db){this.db=db;}
 async read(key){return new Promise((resolve,reject)=>{const t=this.db.transaction('records','readonly'),r=t.objectStore('records').get(key);r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);});}
 async cas(key,expected,value,{local=false}={}){return new Promise((resolve,reject)=>{const t=this.db.transaction('records','readwrite'),o=t.objectStore('records');let ok=false;t.oncomplete=()=>resolve(ok);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Запись не сохранена'));const r=o.get(key);r.onsuccess=()=>{if((r.result?.version??-1)!==expected)return;if(local&&faults.failSave){faults.failSave=false;t.abort();return;}o.put({version:expected+1,value:clone(value)},key);ok=true;};});}
 async saveSession(s,expected){check(await this.cas('session',expected,s,{local:true}),'Сессия изменилась в другой вкладке','conflict');return expected+1;}
 async put(key,value){for(let i=0;i<20;i++){const r=await this.read(key);if(await this.cas(key,r?.version??-1,value))return;}check(false,'Конфликт сохранения');}
}
