import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100}});const page=await context.newPage();await page.goto(pathToFileURL(path.resolve('out/offline/index.html')).href);await page.getByRole('button',{name:'Explore Stone',exact:true}).waitFor();await page.screenshot({path:'test-results/desktop-preview.png',fullPage:true});
 for(const state of ['light','dark','dialog']){
  if(state==='dark')await page.getByRole('button',{name:'Use dark theme'}).click();
  if(state==='dialog')await page.getByRole('button',{name:'Explore Stone',exact:true}).click();
  const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();fs.writeFileSync(`test-results/axe-preview-${state}.json`,JSON.stringify(r.violations,null,2));console.log(state,r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));assert.equal(r.violations.length,0);
 }
}finally{await browser.close();}
