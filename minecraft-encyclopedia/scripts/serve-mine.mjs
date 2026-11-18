import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),port=Number(process.env.PORT||8810);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}if(name==='/')name='/mine.html';if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});}).listen(port,'127.0.0.1',()=>console.log(`MINE!!! game: http://127.0.0.1:${port}/mine.html\nIllustrated encyclopedia: http://127.0.0.1:${port}/encyclopedia/index.html`));
