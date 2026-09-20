import test from 'node:test';import {SqliteRepository} from '../server/repository.mjs';import {Service} from '../server/service.mjs';import {boundarySuite} from './boundary-suite.mjs';
boundarySuite(test,()=>{const repo=new SqliteRepository(':memory:');return {service:new Service(repo),close:()=>repo.close()};});
