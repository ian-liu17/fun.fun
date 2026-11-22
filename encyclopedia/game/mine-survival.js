// Original MINE!!! survival rules. Recipe counts follow the basic wood/stone progression.
export const ITEMS={2:'Dirt',3:'Stone',4:'Wood',5:'Leaves',6:'Crystal',7:'Planks',8:'Beacon',11:'Crafting table',12:'Furnace',13:'Obsidian',14:'Netherrack',15:'Glowstone',16:'Soul sand',17:'End stone',19:'Lava',21:'End frame',sticks:'Sticks',woodPickaxe:'Wooden pickaxe',sword:'Wooden sword',meat:'Raw meat',cookedMeat:'Cooked meat',apples:'Apples',enderPearl:'Ender pearl',blazeRod:'Blaze rod',blazePowder:'Blaze powder',eye:'Eye of Ender',bow:'Crystal bow',string:'String',feather:'Feather'};
export const RECIPES=[
 {id:'planks',name:'4 planks',cost:{4:1},give:7,n:4,grid:[4,0,0,0],size:2},
 {id:'sticks',name:'4 sticks',cost:{7:2},give:'sticks',n:4,grid:[7,0,7,0],size:2},
 {id:'table',name:'Crafting table',cost:{7:4},give:11,n:1,grid:[7,7,7,7],size:2},
 {id:'wood-pickaxe',name:'Wooden pickaxe',cost:{7:3,sticks:2},give:'woodPickaxe',n:1,station:11,unique:true,grid:[7,7,7,0,'sticks',0,0,'sticks',0],size:3},
 {id:'sword',name:'Wooden sword',cost:{7:2,sticks:1},give:'sword',n:1,station:11,unique:true,grid:[0,7,0,0,7,0,0,'sticks',0],size:3},
 {id:'pickaxe',name:'Stone pickaxe',cost:{3:3,sticks:2},tool:true,station:11,grid:[3,3,3,0,'sticks',0,0,'sticks',0],size:3},
 {id:'furnace',name:'Furnace',cost:{3:8},give:12,n:1,station:11,grid:[3,3,3,3,0,3,3,3,3],size:3},
 {id:'cook',name:'Cooked meat',cost:{meat:1,7:1},give:'cookedMeat',n:1,station:12,grid:['meat',7],size:1},
 {id:'beacon',name:'Valley beacon',cost:{4:4,3:8,6:3},give:8,n:1,station:11,custom:true},
 {id:'obsidian',name:'4 obsidian',cost:{3:4,6:1},give:13,n:4,station:11,custom:true},
 {id:'powder',name:'2 blaze powder',cost:{blazeRod:1},give:'blazePowder',n:2,size:2,grid:['blazeRod',0,0,0]},
 {id:'eye',name:'Eye of Ender',cost:{blazePowder:1,enderPearl:1},give:'eye',n:1,size:2,grid:['blazePowder','enderPearl',0,0]},
 {id:'bow',name:'Crystal bow',cost:{7:3,sticks:2,6:1},give:'bow',n:1,station:11,unique:true,custom:true}
];
export function freshInventory(){return {2:8,3:0,4:0,5:0,6:0,7:0,8:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,19:0,21:0,sticks:0,woodPickaxe:0,sword:0,meat:0,cookedMeat:0,apples:0,enderPearl:0,blazeRod:0,blazePowder:0,eye:0,bow:0,string:0,feather:0};}
export function recipeProblem(recipe,inventory,{creative=false,tool=false,nearStation=()=>false}={}){
 if(!recipe)return 'Unknown recipe';
 if(recipe.tool&&tool||recipe.unique&&inventory[recipe.give]>0)return 'Already equipped';
 if(creative)return '';
 if(recipe.station&&!nearStation(recipe.station))return 'Place a '+ITEMS[recipe.station].toLowerCase()+' and stand within 4 blocks';
 const missing=Object.entries(recipe.cost).filter(([id,n])=>(inventory[id]||0)<n);
 return missing.length?'Need '+missing.map(([id,n])=>`${n-(inventory[id]||0)} ${ITEMS[id].toLowerCase()}`).join(', '):'';
}
export function craftRecipe(id,inventory,options={}){
 const recipe=RECIPES.find(r=>r.id===id),reason=recipeProblem(recipe,inventory,options);
 if(reason)return {ok:false,reason};
 if(!options.creative)for(const [item,count]of Object.entries(recipe.cost))inventory[item]-=count;
 if(recipe.give)inventory[recipe.give]=(inventory[recipe.give]||0)+recipe.n;
 return {ok:true,tool:!!recipe.tool,recipe};
}
export function tickHunger(state,dt,{creative=false,moving=false,sprinting=false}={}){
 if(creative)return {hunger:state.hunger,regen:0,starve:0,heal:false,harm:false};
 const hunger=Math.max(0,Math.min(20,state.hunger-dt*(sprinting?.055:moving?.018:.004)));
 const regen=hunger>=18?state.regen+dt:0,starve=hunger===0?state.starve+dt:0;
 return {hunger,regen:regen>=8?0:regen,starve:starve>=10?0:starve,heal:regen>=8,harm:starve>=10};
}
export function eatFood(inventory,hunger){
 if(hunger>=20)return {ok:false,reason:'Your hunger bar is full.'};
 const item=inventory.cookedMeat>0?'cookedMeat':inventory.apples>0?'apples':inventory.meat>0?'meat':null;
 if(!item)return {ok:false,reason:'No food yet. Hunt an animal; cook its meat in a furnace.'};
 inventory[item]--;return {ok:true,hunger:Math.min(20,hunger+(item==='cookedMeat'?8:item==='apples'?4:3)),item};
}
