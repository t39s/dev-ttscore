export const VERSION='0.1.0-rc.1';
export const clone=x=>structuredClone(x);
export const id=()=>crypto.randomUUID();
export function check(ok,message,code='invalid'){if(!ok){const e=new Error(message);e.code=code;throw e;}}
export function canonical(x){if(x===null||typeof x!=='object')return JSON.stringify(x);if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';}
export async function hash(x){const b=new TextEncoder().encode(typeof x==='string'?x:canonical(x));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export const PHASES={waiting_players:'Ожидание спортсменов',prepare_first_game:'Подготовка первой партии',game:'Игра',game_break:'Перерыв между партиями',prepare_next_game:'Подготовка следующей партии',match_over:'Игра окончена · оформление',released:'Счётчик освобождён'};
export function points(g){const p=[0,0];for(const w of g.rallies)p[w]++;return p;}
export function gameWinner(g){const p=points(g);return Math.max(...p)>=11&&Math.abs(p[0]-p[1])>=2?(p[0]>p[1]?0:1):null;}
export function gamesWon(s){const n=[0,0];for(const g of s.games){const w=gameWinner(g);if(w!==null)n[w]++;}return n;}
export function result(s){const n=gamesWon(s),win=(s.bestOf+1)/2;return n.includes(win)?{gamesA:n[0],gamesB:n[1],winner:n[0]===win?0:1}:null;}
export function server(s){const g=s.games.at(-1),p=points(g),n=p[0]+p[1];return (g.firstServer+(p[0]>=10&&p[1]>=10?n:Math.floor(n/2)))%2;}
export function makeSession(team,{firstServer=0,left=0,sessionId=id(),attemptId=id(),writerId}){
 const m=team.matches.find(m=>m.status==='current');check(m,'Нет текущей встречи');
 return {sessionId,attemptId,writerId,teamMatchId:team.id,individualMatchId:m.id,assignmentGeneration:team.generation,bestOf:team.bestOf,names:[...m.names],binding:null,phase:'waiting_players',games:[],firstServer,left,localRevision:0,sportRevision:0,confirmed:false,previous:null,applied:[],completion:null,delivery:null};
}
export function counterView(s){
 const blank=['waiting_players','released'].includes(s.phase),n=gamesWon(s),hold=['game_break','match_over'].includes(s.phase);
 if(hold){const w=gameWinner(s.games.at(-1));if(w!==null)n[w]--;}
 return {phase:s.phase,names:s.names,left:s.left,gamePoints:['game','game_break','match_over'].includes(s.phase)?points(s.games.at(-1)):null,gamesWon:blank?null:n,server:s.phase==='game'?server(s):null};
}
function snapshot(s){const c=clone(s);c.previous=null;c.applied=[];return c;}
export function counterCommand(s,command){
 check(command&&typeof command.id==='string','Нет ID команды');if(s.applied.includes(command.id))return clone(s);
 const x=clone(s),prev=snapshot(s);let sport=false;
 if(command.type==='release'){check(['match_over','released'].includes(x.phase),'Сначала закончите игру');if(x.phase==='released')return x;x.phase='released';}
 else{check(!x.confirmed,'Завершение уже подтверждено','frozen');switch(command.type){
 case 'arrived':check(x.phase==='waiting_players','Неверная фаза');x.phase='prepare_first_game';break;
 case 'start':check(['prepare_first_game','prepare_next_game'].includes(x.phase),'Партия уже начата или не подготовлена');x.games.push({firstServer:(x.firstServer+x.games.length)%2,rallies:[]});x.phase='game';sport=true;break;
 case 'point':check(x.phase==='game','Сначала начните партию');check(command.side===0||command.side===1,'Неверный спортсмен');x.games.at(-1).rallies.push(command.side);sport=true;if(gameWinner(x.games.at(-1))!==null)x.phase=result(x)?'match_over':'game_break';break;
 case 'next':check(x.phase==='game_break','Нет следующей партии');x.phase='prepare_next_game';x.left=1-x.left;break;
 case 'swap':check(x.phase==='game','Смена сторон доступна во время игры');x.left=1-x.left;break;
 case 'undo':check(x.previous,'Нет сохранённого шага Undo');{const restored=clone(x.previous);restored.localRevision=s.localRevision+1;restored.sportRevision=s.sportRevision+1;restored.binding=s.binding;restored.applied=[...s.applied,command.id];restored.previous=null;return restored;}
 default:check(false,'Неизвестная команда');}}
 x.localRevision++;if(sport)x.sportRevision++;if(!x.confirmed)x.previous=prev;x.applied.push(command.id);return x;
}
export function sportReport(s){return {formatVersion:1,teamMatchId:s.teamMatchId,individualMatchId:s.individualMatchId,attemptId:s.attemptId,sessionId:s.sessionId,bestOf:s.bestOf,names:s.names,games:s.games,result:result(s)};}
export function validateReport(r){
 check(r&&r.formatVersion===1&&[3,5,7].includes(r.bestOf),'Неверный формат отчёта');check(Array.isArray(r.names)&&r.names.length===2&&r.names.every(n=>typeof n==='string'&&n.length<=100),'Неверные имена');
 check(Array.isArray(r.games)&&r.games.length<=r.bestOf&&r.games.length>0,'Неверное число партий');let n=[0,0];
 for(let i=0;i<r.games.length;i++){const g=r.games[i];check(!n.includes((r.bestOf+1)/2),'Лишняя партия после финала');check([0,1].includes(g.firstServer)&&Array.isArray(g.rallies)&&g.rallies.length<=2000,'Неверная партия');const p=[0,0];for(const w of g.rallies){check(!(Math.max(...p)>=11&&Math.abs(p[0]-p[1])>=2),'Лишний розыгрыш после конца партии');check(w===0||w===1,'Неверный победитель розыгрыша');p[w]++;}const w=gameWinner(g);check(w!==null,'Незаконченная партия');n[w]++;}
 const got=result(r);check(got&&canonical(got)===canonical(r.result),'Итог не соответствует розыгрышам');return got;
}
export async function freezeCompletion(s){
 check(!s.confirmed&&s.binding,'Нет регистрации или уже подтверждено');check(['match_over','released'].includes(s.phase)&&result(s),'Нет окончательного итога');
 const report=sportReport(s);validateReport(report);const reportBytes=canonical(report),e={finalizationId:id(),commandId:id(),binding:clone(s.binding),sessionId:s.sessionId,sportRevision:s.sportRevision,result:result(s),reportBytes,reportHash:await hash(reportBytes)};
 e.payloadHash=await hash(e);const x=clone(s);x.confirmed=true;x.completion=e;x.delivery='backup_pending';x.previous=null;x.localRevision++;return x;
}
export const terminal=s=>['accepted','accepted_then_undone','resolved_without_acceptance'].includes(s?.delivery);
