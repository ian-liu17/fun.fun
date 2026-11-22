import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.min.js';
import {worldClock,formatCountdown,CYCLE_SECONDS} from '../mine-world-rules.js';
import {createMobs} from '../mine-mobs.js';
test('First sunset is 3:00 and first night is 3:30 of active world time',()=>{assert.equal(worldClock(0).phase,'day');assert.equal(worldClock(0).untilNight,210);assert.equal(worldClock(179.9).phase,'day');assert.equal(worldClock(180).phase,'sunset');assert.equal(worldClock(209.9).phase,'sunset');assert.equal(worldClock(210).phase,'night');assert.equal(formatCountdown(210),'3:30');});
test('Night lasts two minutes and sunrise restores daylight on the next cycle',()=>{assert.equal(worldClock(210).untilSunrise,120);assert.equal(worldClock(329.9).isNight,true);assert.equal(worldClock(330).phase,'sunrise');assert.equal(worldClock(345).daylight,.5);assert.equal(worldClock(CYCLE_SECONDS).day,2);assert.equal(worldClock(CYCLE_SECONDS).daylight,1);});
test('Clock is deterministic across saved days and invalid values',()=>{assert.deepEqual(worldClock(570),{...worldClock(210),day:2,nextNight:930,nextMorning:720});assert.equal(worldClock(-1).seconds,0);assert.equal(worldClock(NaN).seconds,0);assert.equal(formatCountdown(-2),'0:00');});
function makeWorld(loaded){const scene=new THREE.Scene(),damage=[],messages=[],at=(x,y,z)=>x<0||z<0||x>=48||z>=48||y<=3?3:0;const mobs=createMobs({scene,at,size:48,height:28,damage:()=>damage.push(1),toast:s=>messages.push(s),loaded});return {mobs,scene,at,damage,messages,player:{x:12,y:4,z:33}};}
test('All four peaceful animal species spawn on terrain near camp',()=>{const {mobs}=makeWorld();assert.equal(mobs.list.length,8);assert.deepEqual(new Set(mobs.list.map(m=>m.type)),new Set(['sheep','cow','pig','chicken']));assert.ok(mobs.list.every(m=>m.y===4&&!m.hostile));});
test('Night creates hostile mobs once per night and morning removes them',()=>{const {mobs,player}=makeWorld();mobs.update(0,worldClock(210),player,210);assert.equal(mobs.list.filter(m=>m.hostile).length,6);assert.deepEqual(new Set(mobs.list.filter(m=>m.hostile).map(m=>m.type)),new Set(['zombie','slime','skeleton','enderman','spider','creeper']));mobs.update(0,worldClock(211),player,211);assert.equal(mobs.list.filter(m=>m.hostile).length,6);mobs.update(0,worldClock(360),player,360);assert.equal(mobs.list.filter(m=>m.hostile).length,0);assert.equal(mobs.list.filter(m=>!m.hostile).length,8);mobs.update(0,worldClock(570),player,570);assert.equal(mobs.list.filter(m=>m.hostile).length,6);});
test('Mob saves restore species, positions and the night spawn marker',()=>{const first=makeWorld();first.mobs.update(0,worldClock(210),first.player,210);const saved=first.mobs.snapshot(),second=makeWorld(saved);assert.deepEqual(second.mobs.snapshot(),saved);second.mobs.update(0,worldClock(210),second.player,210);assert.equal(second.mobs.list.length,14);});
test('Malformed mob snapshots fall back to the default animals',()=>{const {mobs}=makeWorld({mobs:[{type:'dragon',x:2,y:4,z:2},{type:'pig',x:NaN,y:4,z:2}]});assert.equal(mobs.list.length,8);});
test('Peaceful animals never cause contact damage',()=>{const {mobs,damage}=makeWorld(),sheep=mobs.list[0];mobs.update(.1,worldClock(0),{x:sheep.x,y:4,z:sheep.z},0);assert.equal(damage.length,0);});
test('Aimed peaceful animals can be greeted without taking damage',()=>{const {mobs,scene,messages}=makeWorld(),sheep=mobs.list[0],camera=new THREE.PerspectiveCamera(75,1,.05,100);camera.position.set(sheep.x,sheep.y+1,sheep.z+3);camera.lookAt(sheep.x,sheep.y+.7,sheep.z);camera.updateMatrixWorld();scene.updateMatrixWorld(true);const hit=mobs.aimed(camera);assert.ok(hit);assert.equal(mobs.interact(hit,false,1),true);assert.match(messages.at(-1),/Baa/);assert.equal(mobs.list[0].hp,sheep.hp);});
test('Aimed zombies take combat damage and are removed when defeated',()=>{const {mobs,scene,player}=makeWorld();mobs.update(0,worldClock(210),player,210);const zombie=mobs.list.find(m=>m.type==='zombie'),camera=new THREE.PerspectiveCamera(75,1,.05,100);camera.position.set(zombie.x,zombie.y+1.5,zombie.z+3);camera.lookAt(zombie.x,zombie.y+1.3,zombie.z);camera.updateMatrixWorld();scene.updateMatrixWorld(true);const hit=mobs.aimed(camera);assert.equal(hit?.mob.type,'zombie');mobs.interact(hit,true,211);assert.equal(mobs.list.find(m=>m.id===zombie.id).hp,1);mobs.interact(hit,true,212);assert.ok(!mobs.list.some(m=>m.id===zombie.id));});
test('Hostile mobs cannot walk through a solid wall',()=>{const scene=new THREE.Scene(),at=(x,y,z)=>y<=3||x===20&&y<8?3:0;const mobs=createMobs({scene,at,size:48,height:28,damage:()=>{},toast:()=>{},loaded:{lastNight:1,mobs:[{type:'sheep',x:10,y:4,z:30,angle:0,hp:2},{type:'zombie',x:18,y:4,z:30,angle:0,hp:3}]}});const player={x:23,y:4,z:30};for(let i=0;i<200;i++)mobs.update(.05,worldClock(220),player,220+i*.05);assert.ok(mobs.list.find(m=>m.type==='zombie').x<19.7);});

test('Animal wandering is consistent across frame rates instead of spinning per frame',()=>{
 const simulate=rate=>{const w=makeWorld({populationVersion:3,lastNight:0,mobs:[{type:'pig',x:20,y:4,z:25,angle:0,hp:2}]});for(let i=0;i<rate*5;i++)w.mobs.update(1/rate,worldClock(0),{x:1,y:4,z:1},i/rate);return w.mobs.snapshot().mobs[0];};
 const slow=simulate(30),fast=simulate(144);assert.ok(Math.abs(slow.angle-fast.angle)<.01);assert.ok(Math.hypot(slow.x-fast.x,slow.z-fast.z)<.05);
});
test('Skeleton arrows are visible projectiles that cause damage when they hit',()=>{
 const w=makeWorld({populationVersion:3,lastNight:1,mobs:[{type:'sheep',x:4,y:4,z:4,angle:0,hp:2},{type:'skeleton',x:10,y:4,z:30,angle:0,hp:3}]}),p={x:17,y:4,z:30};
 w.mobs.update(.01,worldClock(220),p,220);assert.equal(w.mobs.projectiles.length,1);
 for(let i=1;i<35;i++)w.mobs.update(.05,worldClock(220),p,220+i*.05);assert.ok(w.damage.length>0);
});
test('A zombie in contact really calls the damage handler',()=>{
 const w=makeWorld({populationVersion:3,lastNight:1,mobs:[{type:'sheep',x:4,y:4,z:4,angle:0,hp:2},{type:'zombie',x:10,y:4,z:30,angle:0,hp:3}]});w.mobs.update(.01,worldClock(220),{x:10.7,y:4,z:30},220);assert.equal(w.damage.length,1);
});
test('Animal hunting drops meat, while greeting leaves the animal alive',()=>{
 const scene=new THREE.Scene(),drops=[],mobs=createMobs({scene,size:48,height:28,at:(x,y,z)=>y<=3?3:0,damage:()=>{},toast:()=>{},drop:(type,count)=>drops.push({type,count})});
 const sheep=mobs.list[0],camera=new THREE.PerspectiveCamera(75,1,.05,100);camera.position.set(sheep.x,5,sheep.z+3);camera.lookAt(sheep.x,4.7,sheep.z);camera.updateMatrixWorld();scene.updateMatrixWorld(true);const hit=mobs.aimed(camera);
 mobs.interact(hit,3,1,false);assert.equal(drops.length,0);mobs.interact(hit,3,2,true);assert.deepEqual(drops,[{type:'sheep',count:2}]);assert.ok(!mobs.list.some(m=>m.id===sheep.id));
});
test('Night replacements appear after a delay at another position',()=>{
 const w=makeWorld();w.mobs.update(0,worldClock(220),w.player,220);const victim=w.mobs.list.find(m=>m.hostile),camera=new THREE.PerspectiveCamera(75,1,.05,100);camera.position.set(victim.x,victim.y+1.5,victim.z+3);camera.lookAt(victim.x,victim.y+1.1,victim.z);camera.updateMatrixWorld();w.scene.updateMatrixWorld(true);const hit=w.mobs.aimed(camera);assert.ok(hit);w.mobs.interact(hit,100,220,true);const count=w.mobs.list.filter(m=>m.hostile).length;w.mobs.update(0,worldClock(220),w.player,225);assert.equal(w.mobs.list.filter(m=>m.hostile).length,count);w.mobs.update(0,worldClock(220),w.player,227);assert.equal(w.mobs.list.filter(m=>m.hostile).length,count+1);assert.ok(w.mobs.list.some(m=>m.hostile&&m.id>victim.id&&Math.hypot(m.x-victim.x,m.z-victim.z)>5));
});
test('Nether has piglins, blazes, magma cubes and ghasts even during Overworld daytime',()=>{
 const w=makeWorld();w.mobs.setDimension('nether');w.mobs.update(0,worldClock(0),w.player,0);assert.deepEqual(new Set(w.mobs.list.map(m=>m.type)),new Set(['piglin','blaze','magma','ghast']));
});
