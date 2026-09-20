import {check,clone,canonical,hash,id,validateReport,PHASES} from './domain.mjs';
const token=()=>id()+id();
function identity(s,b){return b&&b.teamMatchId===s.id&&b.individualMatchId===s.currentId&&b.assignmentGeneration===s.generation&&canonical(b)===canonical(s.registration?.binding);}
function current(s){return s.matches.find(m=>m.id===s.currentId);}
function advance(s){s.generation++;s.registration=null;s.live=null;let a=0,b=0;for(const m of s.matches)if(m.result){m.result.value.winner===0?a++:b++;}const finish=a>=3||b>=3||s.matches.every(m=>m.result);const next=finish?null:s.matches.find(m=>!m.result);s.currentId=next?.id??null;s.matches.forEach(m=>m.status=m.result?'finished':m.id===s.currentId?'current':'planned');}
export function publicTeam(s){return {id:s.id,revision:s.revision,generation:s.generation,teamNames:s.teamNames,bestOf:s.bestOf,currentId:s.currentId,matches:s.matches.map(m=>({id:m.id,names:m.names,status:!s.currentId&&!m.result?'not_required':m.status,result:m.result?{id:m.result.id,...m.result.value,source:m.result.source}:null})),score:[s.matches.filter(m=>m.result?.value.winner===0).length,s.matches.filter(m=>m.result?.value.winner===1).length],live:s.live,registered:!!s.registration};}
export async function createTeam(input){
 check(input&&Array.isArray(input.teamNames)&&input.teamNames.length===2&&input.teamNames.every(x=>typeof x==='string'&&x.trim().length>0&&x.length<=100),'Неверные названия команд');check(Array.isArray(input.athletes)&&input.athletes.length===2&&input.athletes.every(x=>Array.isArray(x)&&x.length===2&&x.every(n=>typeof n==='string'&&n.trim()&&n.length<=100)),'Нужны два спортсмена в каждой команде');check([3,5,7].includes(input.bestOf),'Неверный формат');
 const adminToken=token(),umpireToken=token(),matches=[[0,0],[1,1],[0,1],[1,0]].map((p,i)=>({id:'m'+(i+1),names:[input.athletes[0][p[0]],input.athletes[1][p[1]]],status:i?'planned':'current',result:null}));
 const state={id:id(),revision:0,generation:1,teamNames:input.teamNames,bestOf:input.bestOf,matches,currentId:'m1',registration:null,attemptEpoch:0,writerEpoch:0,live:null,receipts:{},reports:{},history:{},adminHash:await hash(adminToken),umpireHash:await hash(umpireToken)};
 return {state,adminToken,umpireToken};
}
export async function applyCommand(old,cmd,credential){
 check(cmd&&/^[a-z0-9-]{1,80}$/i.test(cmd.id??''),'Неверный ID команды');const auth=await hash(credential??''),isAdmin=auth===old.adminHash,isUmpire=auth===old.umpireHash;check(isAdmin||isUmpire,'Нет права на эту встречу','forbidden');
 const adminTypes=['manual','undo','revoke'];check(adminTypes.includes(cmd.type)?isAdmin:isUmpire,'Нет права на действие','forbidden');
 const payloadHash=await hash(cmd),prior=old.receipts[cmd.id];
 if(prior){check(prior.payloadHash===payloadHash,'Другой пакет под прежним ID','conflict');check(prior.auth===auth,'Квитанция принадлежит другому автору','forbidden');let outcome=clone(prior.outcome);if(outcome.acceptedResultId&&old.history[outcome.acceptedResultId]?.undone)outcome.state='accepted_then_undone';return {state:old,outcome,changed:false};}
 const s=clone(old);let outcome={state:'ok'};
 if(cmd.type==='register'){
  check(s.currentId&&cmd.individualMatchId===s.currentId&&cmd.generation===s.generation,'Назначение изменилось','conflict');check(typeof cmd.attemptId==='string'&&typeof cmd.writerId==='string','Нет identity');
  if(s.registration){check(s.registration.binding.attemptId===cmd.attemptId&&s.registration.writerId===cmd.writerId,'Встречу ведёт другой счётчик','conflict');}
  else{s.attemptEpoch++;s.writerEpoch++;s.registration={writerId:cmd.writerId,binding:{teamMatchId:s.id,individualMatchId:s.currentId,assignmentGeneration:s.generation,attemptId:cmd.attemptId,attemptEpoch:s.attemptEpoch,writerEpoch:s.writerEpoch}};}
  outcome={state:'admitted',binding:s.registration.binding};
 }else if(cmd.type==='backup'){
  const e=cmd.envelope;check(e&&identity(s,e.binding),'Допуск отозван','conflict');
  check(typeof e.reportBytes==='string'&&e.reportBytes.length<500000,'Неверный отчёт');const {payloadHash:eh,...base}=e;check(await hash(base)===eh&&await hash(e.reportBytes)===e.reportHash,'Хеш не совпадает');
  const report=JSON.parse(e.reportBytes);const rr=validateReport(report);check(canonical(report)===e.reportBytes,'Отчёт не канонический');
  check(report.teamMatchId===s.id&&report.individualMatchId===s.currentId&&report.attemptId===e.binding.attemptId&&report.sessionId===e.sessionId&&report.bestOf===s.bestOf&&canonical(report.names)===canonical(current(s).names)&&canonical(rr)===canonical(e.result),'Отчёт другой встречи');
  check(/^[a-z0-9-]{1,80}$/i.test(e.finalizationId),'Неверный ID отчёта');if(s.reports[e.finalizationId])check(canonical(s.reports[e.finalizationId])===canonical(e),'Отчёт уже существует с другими байтами','conflict');else s.reports[e.finalizationId]=clone(e);outcome={state:'backup_saved'};
 }else if(cmd.type==='accept'){
  check(identity(s,cmd.binding),'Назначение изменилось','conflict');const e=s.reports[cmd.finalizationId];check(e&&e.payloadHash===cmd.envelopeHash&&canonical(e.binding)===canonical(cmd.binding)&&e.commandId===cmd.id,'Нет подтверждённого пакета');
  const record={id:cmd.id,value:e.result,source:'automatic',finalizationId:e.finalizationId};current(s).result=record;s.history[record.id]={individualMatchId:s.currentId,record,undone:false};advance(s);outcome={state:'accepted',acceptedResultId:record.id};
 }else if(cmd.type==='manual'){
  check(cmd.generation===s.generation&&cmd.individualMatchId===s.currentId&&s.currentId,'Назначение изменилось','conflict');const {gamesA:a,gamesB:b}=cmd.result??{},w=(s.bestOf+1)/2;check(Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&((a===w&&b<w)||(b===w&&a<w)),'Недопустимый итог');const record={id:cmd.id,value:{gamesA:a,gamesB:b,winner:a===w?0:1},source:'manual'};current(s).result=record;s.history[record.id]={individualMatchId:s.currentId,record,undone:false};advance(s);outcome={state:'accepted',acceptedResultId:record.id};
 }else if(cmd.type==='undo'){
  const m=s.matches.filter(m=>m.result).at(-1);check(m&&m.result.id===cmd.expectedResultId&&s.revision===cmd.expectedRevision,'Результат или редакция изменились','conflict');s.history[m.result.id].undone=true;m.result=null;advance(s);outcome={state:'undone'};
 }else if(cmd.type==='revoke'){
  check(cmd.generation===s.generation&&s.currentId,'Назначение изменилось','conflict');s.generation++;s.registration=null;s.live=null;outcome={state:'revoked'};
 }else if(cmd.type==='live'){
  check(identity(s,cmd.binding),'Допуск отозван','conflict');check(Number.isSafeInteger(cmd.localRevision)&&cmd.localRevision>=0,'Неверная ревизия');check(cmd.view&&PHASES[cmd.view.phase]&&canonical(cmd.view.names)===canonical(current(s).names),'Неверные показания');
  for(const a of [cmd.view.gamePoints,cmd.view.gamesWon])check(a===null||(Array.isArray(a)&&a.length===2&&a.every(n=>Number.isInteger(n)&&n>=0&&n<=2000)),'Неверные цифры');
  check([0,1].includes(cmd.view.left)&&[null,0,1].includes(cmd.view.server),'Неверная ориентация');
  if(!s.live||cmd.localRevision>s.live.localRevision)s.live={binding:cmd.binding,localRevision:cmd.localRevision,view:cmd.view,receivedAt:Date.now()};else if(cmd.localRevision===s.live.localRevision)check(canonical(cmd.view)===canonical(s.live.view),'Разные показания одной редакции','conflict');
  // Live uses revision fencing, not an unbounded per-point receipt history.
  s.revision++;return {state:s,outcome,changed:true};
 }else check(false,'Неизвестная команда');
 s.revision++;s.receipts[cmd.id]={payloadHash,auth,outcome:clone(outcome)};return {state:s,outcome,changed:true};
}
