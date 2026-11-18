import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mine-skill-'));
const script=path.resolve('../.agents/skills/minecraft-encyclopedia/scripts/generate.mjs'),validator=path.resolve('../.agents/skills/minecraft-encyclopedia/scripts/validate.mjs');
const run=(script,args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8',windowsHide:true});
try{
 const blocks=JSON.parse(fs.readFileSync('data/blocks.json','utf8'));const stone=blocks.find(b=>b.id==='minecraft:stone');stone.description='MINE-CUSTOM-RESEARCH: <script>text remains inert</script> & exact data export.';const custom=path.join(temp,'custom.json');fs.writeFileSync(custom,JSON.stringify(blocks));const dest=path.join(temp,'guide');
 let result=run(script,[dest,'--data',custom,'--chapter','stone']);assert.equal(result.status,0,result.stderr);console.log('PASS skill generates a chapter-focused encyclopedia from supplied canonical data');
 result=run(validator,[dest]);assert.equal(result.status,0,result.stderr);console.log('PASS exported registry, schema, images, recipes and embedded HTML agree');
 const html=fs.readFileSync(path.join(dest,'index.html'),'utf8');assert.ok(html.includes('MINE-CUSTOM-RESEARCH'));assert.ok(html.includes('\\u003cscript>'));assert.ok(fs.existsSync(path.join(dest,'chapters/stone.md')));assert.ok(fs.existsSync(path.join(dest,'missing-block-data.json')));
 result=run(script,[dest]);assert.notEqual(result.status,0);console.log('PASS exporter refuses to overwrite existing output');
 fs.writeFileSync(custom,JSON.stringify(blocks.slice(1)));const failed=path.join(temp,'failed');result=run(script,[failed,'--data',custom]);assert.notEqual(result.status,0);assert.ok(!fs.existsSync(failed));console.log('PASS incomplete registries are rejected before writing output');
 const imagePath=stone.image.path;stone.image.path='../unpackaged.svg';fs.writeFileSync(custom,JSON.stringify(blocks));const unsafe=path.join(temp,'unsafe');result=run(script,[unsafe,'--data',custom]);assert.notEqual(result.status,0);assert.ok(!fs.existsSync(unsafe));stone.image.path=imagePath;console.log('PASS unpackaged or unsafe image paths are rejected before writing output');
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});try{const context=await browser.newContext();const page=await context.newPage();await page.goto(pathToFileURL(path.join(dest,'index.html')).href);await page.getByRole('textbox',{name:'Search blocks'}).fill('minecraft:stone');await page.getByRole('button',{name:'Explore Stone',exact:true}).click();assert.match(await page.locator('.block-dialog .detail-header p').innerText(),/MINE-CUSTOM-RESEARCH/);assert.equal(await page.locator('.block-dialog .detail-header script').count(),0);console.log('PASS generated offline website renders the edited record safely');}finally{await browser.close();}
 blocks[0].description='Deliberately out of sync';fs.writeFileSync(path.join(dest,'blocks.json'),JSON.stringify(blocks));result=run(validator,[dest]);assert.notEqual(result.status,0);console.log('PASS validator detects a stale website after a data-only edit');
 console.log('All 7 reusable skill checks passed.');
}finally{assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(temp,{recursive:true,force:true});}
