import test from 'node:test';
import assert from 'node:assert/strict';
import {freshInventory,craftRecipe,eatFood,tickHunger} from '../mine-survival.js';
import {terrainHeight} from '../mine-terrain.js';
import {dimensionTerrain} from '../mine-worlds.js';
import {appleModel} from '../mine-items.js';
test('A log becomes planks; a table must be placed before crafting a sword',()=>{
 const inv=freshInventory();inv[4]=4;
 for(let i=0;i<4;i++)assert.equal(craftRecipe('planks',inv).ok,true);
 assert.equal(inv[7],16);assert.equal(craftRecipe('table',inv).ok,true);assert.equal(craftRecipe('sticks',inv).ok,true);
 const before={...inv};assert.equal(craftRecipe('sword',inv).ok,false);assert.deepEqual(inv,before);
 assert.equal(craftRecipe('sword',inv,{nearStation:id=>id===11}).ok,true);assert.equal(inv.sword,1);assert.equal(inv.sticks,3);assert.equal(inv[7],8);
});
test('Stone tools, furnace and cooking consume the right ingredients and require stations',()=>{
 const inv=freshInventory();inv[3]=11;inv.sticks=2;inv[7]=1;inv.meat=1;
 const options={nearStation:id=>id===11};assert.equal(craftRecipe('pickaxe',inv,options).tool,true);assert.equal(craftRecipe('furnace',inv,options).ok,true);assert.equal(inv[3],0);
 assert.equal(craftRecipe('cook',inv,options).ok,false);assert.equal(craftRecipe('cook',inv,{nearStation:id=>id===12}).ok,true);assert.equal(inv.meat,0);assert.equal(inv[7],0);assert.equal(inv.cookedMeat,1);
});
test('Food restores hunger, full players do not waste food, Creative crafting uses no resources',()=>{
 const inv=freshInventory();inv.apples=2;assert.equal(eatFood(inv,20).ok,false);assert.equal(inv.apples,2);assert.equal(eatFood(inv,10).hunger,14);inv.cookedMeat=1;assert.equal(eatFood(inv,14).hunger,20);
 const before={...inv};assert.equal(craftRecipe('furnace',inv,{creative:true}).ok,true);assert.equal(inv[3],before[3]);assert.equal(inv[12],1);
});
test('Hunger drains faster when sprinting, regenerates health, and starves only in Survival',()=>{
 const state={hunger:20,regen:0,starve:0},walk=tickHunger(state,5,{moving:true}),run=tickHunger(state,5,{moving:true,sprinting:true});assert.ok(run.hunger<walk.hunger);
 assert.equal(tickHunger({...state,regen:7.9},.2).heal,true);assert.equal(tickHunger({hunger:0,regen:0,starve:9.9},.2).harm,true);assert.equal(tickHunger(state,100,{creative:true}).hunger,20);
});
test('Pearls and Nether blaze rods produce eyes; custom portal and bow recipes are explicit',()=>{
 const inv=freshInventory();inv.blazeRod=6;inv.enderPearl=12;
 for(let i=0;i<6;i++)assert.equal(craftRecipe('powder',inv).ok,true);
 for(let i=0;i<12;i++)assert.equal(craftRecipe('eye',inv).ok,true);
 assert.equal(inv.eye,12);assert.equal(inv.blazePowder,0);assert.equal(inv.enderPearl,0);
});
test('Mountains have stepped slopes instead of the old five-block rectangular cliff',()=>{
 for(let z=16;z<=29;z++)for(let x=21;x<=39;x++)assert.ok(Math.abs(terrainHeight(x,z)-terrainHeight(x+1,z))<=3);
 assert.ok(terrainHeight(30,21)>terrainHeight(20,21));
});
test('Nether and End have distinct terrain, lava and tower materials',()=>{
 const nether=dimensionTerrain('nether',80,36),end=dimensionTerrain('end',80,36);assert.ok(nether.includes(14)&&nether.includes(19)&&nether.includes(15));assert.ok(end.includes(17)&&end.includes(13));assert.equal(end[0],0);assert.equal(nether.length,80*80*36);
});
test('Apples have rounded lobes, a stem and a leaf rather than a block model',()=>{
 const apple=appleModel();assert.equal(apple.children.filter(c=>c.geometry.type==='SphereGeometry').length,3);assert.ok(apple.children.some(c=>c.geometry.type==='CylinderGeometry'));assert.ok(!apple.children.some(c=>c.geometry.type==='BoxGeometry'));
});
