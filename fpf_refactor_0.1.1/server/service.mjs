import {applyCommand,createTeam,publicTeam} from '../public/authority.mjs';
import {check} from '../public/domain.mjs';
export class Service{
 constructor(repo){this.repo=repo;}
 async create(input){const c=await createTeam(input);const {etag}=await this.repo.read(c.state.id);check(await this.repo.cas(c.state.id,etag,c.state),'Creation conflict');return {team:publicTeam(c.state),adminToken:c.adminToken,umpireToken:c.umpireToken};}
 async get(id){const {value}=await this.repo.read(id);check(value,'Встреча не найдена','not_found');return publicTeam(value);}
 async command(id,cmd,token){for(let i=0;i<30;i++){const {value,etag}=await this.repo.read(id);check(value,'Встреча не найдена','not_found');const r=await applyCommand(value,cmd,token);if(!r.changed||await this.repo.cas(id,etag,r.state))return {outcome:r.outcome,team:publicTeam(r.state)};}check(false,'Конкурирующие изменения: повторите ту же команду','transport');}
}
