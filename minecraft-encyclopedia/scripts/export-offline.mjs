import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
const dest='out/offline';fs.mkdirSync(dest,{recursive:true});
const result=await build({absWorkingDir:process.cwd(),entryPoints:[path.resolve('scripts/offline-entry.tsx')],bundle:true,write:false,minify:true,platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},tsconfig:path.resolve('tsconfig.json')});
const css=fs.readdirSync('out/_next/static/css').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join('out/_next/static/css',f),'utf8')).join('\n');
const catalog=fs.readFileSync('public/blocks.json','utf8').replaceAll('<','\\u003c');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="MINE!!! illustrated Java 1.21.4 registry, recipes and field guide"><title>MINE!!! — Illustrated Encyclopedia</title><style>${css}</style></head><body><div id="root"></div><script type="application/json" id="mine-catalog">${catalog}</script><script>${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body></html>`;
fs.writeFileSync(dest+'/index.html',html);
fs.cpSync('public/assets',dest+'/assets',{recursive:true});
for(const f of ['blocks.json','encyclopedia.md','qa-report.md','qa-report.json','missing-block-data.json','missing-images.json','asset-attribution.json','version-diff.json'])fs.copyFileSync('public/'+f,dest+'/'+f);
fs.copyFileSync('data/chapters.json',dest+'/chapters.json');
fs.writeFileSync(dest+'/registry.json',JSON.stringify(JSON.parse(fs.readFileSync('data/upstream/blocks.json','utf8')).map(b=>`minecraft:${b.name}`)));
fs.cpSync('public/chapters',dest+'/chapters',{recursive:true});
fs.cpSync('public/game',dest+'/game',{recursive:true});
// Preserve all permalink routes in the file-openable export as tiny local redirects.
const blocks=JSON.parse(fs.readFileSync('data/blocks.json','utf8'));
const chapters=JSON.parse(fs.readFileSync('data/chapters.json','utf8'));
for(const [kind,rows] of [['blocks',blocks],['chapters',chapters]])for(const row of rows){const id=row.id.split(':').at(-1);const dir=`${dest}/${kind}/${id}`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><title>Block Atlas</title><meta http-equiv="refresh" content="0;url=../../index.html#${kind}=${id}"><a href="../../index.html#${kind}=${id}">Open ${row.name||row.title}</a></html>`);}
const skill='../.agents/skills/minecraft-encyclopedia/assets/encyclopedia';
fs.mkdirSync(skill,{recursive:true});fs.cpSync(dest,skill,{recursive:true});
// The root arcade opens the exact same encyclopedia as an in-game field guide.
fs.mkdirSync('../encyclopedia',{recursive:true});fs.cpSync(dest,'../encyclopedia',{recursive:true});
console.log('Offline export: out/offline/index.html. Skill export template updated.');
