import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeReports} from './report.mjs';
import {validateExportData} from './validate.mjs';
const args=process.argv.slice(2),target=args.shift();
if(!target)throw Error('Usage: node generate.mjs <new-output-directory> [--data blocks.json] [--chapter chapter-id]');
let dataPath,chapter;while(args.length){const flag=args.shift();if(!['--data','--chapter'].includes(flag)||!args.length)throw Error('Unknown or incomplete option: '+flag);if(flag==='--data')dataPath=args.shift();else chapter=args.shift();}
const dest=path.resolve(target),template=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/encyclopedia');
if(fs.existsSync(dest))throw Error('Output already exists; choose a new directory.');
const blocks=JSON.parse(fs.readFileSync(dataPath?path.resolve(dataPath):path.join(template,'blocks.json'),'utf8'));
const chapters=JSON.parse(fs.readFileSync(path.join(template,'chapters.json'),'utf8'));
const registry=JSON.parse(fs.readFileSync(path.join(template,'registry.json'),'utf8'));
const errors=validateExportData(blocks,registry);if(errors.length)throw Error(errors.join('\n'));
for(const b of blocks){const image=path.resolve(template,b.image.path);if(!image.startsWith(template+path.sep)||!fs.existsSync(image)||!fs.statSync(image).isFile())throw Error('Image is not a packaged local asset: '+b.id);}
if(chapter&&!chapters.some(c=>c.id===chapter))throw Error('Unknown chapter '+chapter);
const sourceHtml=fs.readFileSync(path.join(template,'index.html'),'utf8');
if(!sourceHtml.includes('id="mine-catalog"'))throw Error('Template is outdated; rebuild the application.');
// Validate before creating any output, and embed the same records offered for download.
fs.cpSync(template,dest,{recursive:true,errorOnExist:true,force:false});
fs.writeFileSync(path.join(dest,'blocks.json'),JSON.stringify(blocks,null,2));
const json=JSON.stringify(blocks).replaceAll('<','\\u003c');
let html=sourceHtml.replace(/(<script type="application\/json" id="mine-catalog">)[\s\S]*?(<\/script>)/,()=>`<script type="application/json" id="mine-catalog">${json}</script>`);
if(chapter)html=html.replace('<body>','<body><script>if(!location.hash)location.hash="chapters='+chapter+'";</script>');
fs.writeFileSync(path.join(dest,'index.html'),html);
const report=writeReports(dest,blocks,chapters,registry);
console.log(`Generated MINE!!! in ${dest}: ${report.covered}/${report.registry_total} IDs. Unverified fields and images are itemized in the QA reports.`);
