import {MODE} from './config.mjs';
import {applyCommand,createTeam,publicTeam} from './authority.mjs';
import {check} from './domain.mjs';
import {faults} from './storage.mjs';
export class Transport{
 constructor(store){this.store=store;}
 async api(path,body,token){check(!faults.offline,'Связь отключена для проверки','transport');let response;try{response=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000)});}catch{check(false,'Нет связи с сервером','transport');}const data=await response.json();check(response.ok,data.error||'Ошибка сервера',data.code||'transport');return data;}
 async create(input){if(MODE==='server')return this.api('/api/teams',input);check(!faults.offline,'Нет связи','transport');const c=await createTeam(input);await this.store.put('team:'+c.state.id,c.state);return {team:publicTeam(c.state),adminToken:c.adminToken,umpireToken:c.umpireToken};}
 async get(id){if(MODE==='server')return this.api('/api/teams/'+id);check(!faults.offline,'Связь отключена для проверки','transport');const r=await this.store.read('team:'+id);check(r,'Встреча не найдена в этом браузере','not_found');return publicTeam(r.value);}
 async command(id,cmd,token){let result;if(MODE==='server')result=await this.api('/api/teams/'+id+'/commands',cmd,token);else{check(!faults.offline,'Связь отключена для проверки','transport');for(let i=0;i<30;i++){const r=await this.store.read('team:'+id);check(r,'Нет встречи');const a=await applyCommand(r.value,cmd,token);if(!a.changed||await this.store.cas('team:'+id,r.version,a.state)){result={team:publicTeam(a.state),outcome:a.outcome};break;}}check(result,'Конкурирующие изменения','transport');}
 if(cmd.type==='accept'&&faults.dropAccept){faults.dropAccept=false;check(false,'Подтверждение потеряно для проверки. Повторите передачу.','transport');}return result;
 }
}
