import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Service} from './service.mjs';
import {SqliteRepository,RtdbRepository} from './repository.mjs';
export function startServer({port=Number(process.env.PORT||8787),repo}={}){
 const root=fileURLToPath(new URL('../public/',import.meta.url)),repository=repo??(process.env.TTS_BACKEND==='rtdb'?new RtdbRepository():new SqliteRepository(process.env.TTS_DATA||'data/prototype.sqlite')),service=new Service(repository);
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const send=(code,obj)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname.startsWith('/api/')){
    let input=null;if(req.method==='POST'){const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host){send(403,{error:'Чужой origin'});return;}if(!req.headers['content-type']?.startsWith('application/json')){send(415,{error:'Требуется JSON'});return;}let size=0,chunks=[];for await(const c of req){size+=c.length;if(size>650000){send(413,{error:'Слишком большой пакет'});return;}chunks.push(c);}input=JSON.parse(Buffer.concat(chunks).toString());}
    if(url.pathname==='/api/teams'&&req.method==='POST'){send(201,await service.create(input));return;}
    const m=url.pathname.match(/^\/api\/teams\/([a-f0-9-]{36})(\/commands)?$/);if(!m){send(404,{error:'Не найдено'});return;}
    if(req.method==='GET'&&!m[2]){send(200,await service.get(m[1]));return;}
    if(req.method==='POST'&&m[2]){const token=req.headers.authorization?.replace(/^Bearer /,'')??'';send(200,await service.command(m[1],input,token));return;}send(405,{error:'Метод не разрешён'});return;
   }
   if(req.method!=='GET'){send(405,{error:'Метод не разрешён'});return;}
   if(url.pathname==='/config.mjs'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end("export const MODE='server';");return;}
   const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(root,'.'+relative);if(!file.startsWith(root)){send(403,{error:'Нет доступа'});return;}
   const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(bytes);
  }catch(e){if(res.headersSent){res.end();return;}send(({forbidden:403,conflict:409,not_found:404,transport:503})[e.code]||400,{error:e.message,code:e.code||'invalid'});}
 });server.listen(port,'127.0.0.1');server.on('close',()=>repository.close());return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){startServer();console.log(`ttScore prototype: http://127.0.0.1:${process.env.PORT||8787} (${process.env.TTS_BACKEND||'sqlite'})`);}
