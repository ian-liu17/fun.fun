/* The host simulates the shared arena; each browser steers its own player. */
'use strict';
function createSharedArena(session){
 let foodState=[],latestWorld=null,worldRound=null,life=crypto.randomUUID(),paused=false,outcome=null;
 let lastTick=0,lastWorldSend=0,foodDirty=true,coverageDirty=true,worldSending=false;
 const pendingClaims=new Set(),processedClaims=new Set(),processedEvents=new Set(),deadLives=new Set(),spentBites=new Set();
 const baseColors=['#b3ff83','#fd75aa','#67c7ff','#ffc568','#b79aff','#5be0ca'];
 const api={tick,step,eat,replenish,receive,resetPlayer,decodePlayer,serializePlayer,revived,changed,requestPause,clear,get running(){return !!session.round&&!paused&&!outcome;}};
 function path(suffix){return session.sdk.ref(session.db,'rooms/'+session.room+'/'+suffix);}
 function send(p,value){session.sdk.set(path(p),value).catch(session.fail);}
 function decorateLocal(){if(player?.skin==='default')player.color=baseColors[Number(session.slot.slice(1))-1];}
 function serializePlayer(){decorateLocal();return {owner:session.owner,life,body:player.parts.map(p=>({x:p.x,y:p.y})),score:player.score,kills:player.kills||0,name:player.name,alive:player.alive,angle:player.angle,skin:player.skin||'default',shield:player.shield||0,invisibleUntil:player.invisibleUntil||0,angelUntil:player.angelUntil||0,boostUntil:player.boostUntil||0,devilArmed:!!player.devilArmed,devilUsed:player.devilUsed||0,devilWindow:player.devilWindow||0};}
 function decodePlayer(data,id){
  const skin=SKINS.find(k=>k.id===data.skin)||SKINS[0];
  return {...data,...data.body[0],parts:data.body,trail:data.body,isPlayer:true,remote:true,slot:id,skin:skin.id,color:skin.id==='default'?baseColors[Number(id.slice(1))-1]:skin.color,name:typeof data.name==='string'?data.name.slice(0,16):'Player '+id.slice(1),size:data.body.length,alive:data.alive===true,angle:Number.isFinite(data.angle)?data.angle:0,shield:Math.max(0,Number(data.shield)||0)};
 }

 function replenish(){pearls=foodState;}
 function refill(){pearls=foodState;replenishLocal();for(const p of pearls)if(!p.id)p.id=crypto.randomUUID();foodState=pearls;foodDirty=true;}
 function resetPlayer(){
  life=crypto.randomUUID();player.life=life;player.owner=session.owner;pendingClaims.clear();decorateLocal();snakes=snakes.filter(s=>s.isPlayer);
  if(session.isHost&&worldRound!==session.round){
   worldRound=session.round;paused=false;outcome=null;processedClaims.clear();processedEvents.clear();deadLives.clear();spentBites.clear();foodState=[];refill();foodDirty=coverageDirty=true;lastWorldSend=0;
  }else if(!session.isHost){if(worldRound!==session.round){worldRound=session.round;paused=false;outcome=null;processedEvents.clear();}applyWorld(latestWorld);}
  replenish();
 }
 function revived(){life=crypto.randomUUID();player.life=life;session.publish(true);}
 function changed(){decorateLocal();session.publish(true);}
 function die(reason){
  if(!player.alive)return;player.alive=false;session.publish(true);deathReason=reason;reviveQueue=[player];nextRevive();
 }
 function grant(s,growth,score=0,kills=0){
  if(s===player){player.size+=growth;player.score+=score;player.kills+=kills;body(player);session.publish(true);return;}
  s.size+=growth;s.score+=score;s.kills=(s.kills||0)+kills;
  send('events/'+s.slot+'/'+crypto.randomUUID(),{round:session.round,life:s.life,type:'grow',growth,score,kills});
 }
 function consume(s,p){
  const index=foodState.findIndex(f=>f.id===p.id);if(index<0||!s.alive)return;
  const value=pearlValue(p);if(s.isPlayer)grant(s,value*CONFIG.pearlGrowth,value);else{s.size+=value*CONFIG.pearlGrowth;body(s);}
  pearls=foodState;
  if(value>1){relocatePearl(p);p.id=crypto.randomUUID();}else pearls.splice(index,1);
  foodState=pearls;refill();
 }
 function eat(s,index){
  const p=pearls[index];if(!p||!session.ready||pendingClaims.has(p.id))return;
  if(session.isHost){consume(s,p);return;}
  if(s!==player)return;pendingClaims.add(p.id);
  session.sdk.runTransaction(path('claims/'+p.id),current=>current===null?{by:session.slot,owner:session.owner,life,round:session.round,foodId:p.id}:undefined,{applyLocally:false}).catch(e=>{pendingClaims.delete(p.id);session.fail(e);});
 }
 function applyWorld(world){
  if(!world||(world.round||null)!==session.round)return;
  latestWorld=world;
  if(Array.isArray(world.food))foodState=world.food.filter(p=>p&&session.validPoint(p)&&typeof p.id==='string'&&[1,5,10].includes(pearlValue(p)));
  snakes=snakes.filter(s=>s.isPlayer);
  if(Number.isFinite(world.elapsed))elapsed=Math.max(elapsed,world.elapsed);
  if(Array.isArray(world.coverage)){coverageMap.fill(0);for(const index of world.coverage)if(Number.isInteger(index)&&index>=0&&index<COVERAGE_TOTAL)coverageMap[index]=1;coveredTiles=coverageMap.reduce((a,b)=>a+b,0);}
  if(Number.isInteger(world.respawnProgress))respawnProgress=world.respawnProgress;
  if(typeof world.notice==='string'){ui.spawnNotice.textContent=world.notice;noticeUntil=Number(world.noticeUntil)||0;}
  replenish();
 }
 function receive(value){
  paused=value.control?.round===session.round&&value.control.paused===true;
  if(paused&&state==='playing')pause(true);else if(!paused&&state==='paused')play(true);
  if(!session.isHost)applyWorld(value.world);
  const events=value.events?.[session.slot]||{};
  for(const [id,event] of Object.entries(events)){
   if(processedEvents.has(id))continue;processedEvents.add(id);
   if(event.round===session.round&&event.life===life){
    if(event.type==='grow'&&Number.isFinite(event.growth)&&event.growth>=0){player.size+=event.growth;player.score+=event.score||0;player.kills+=event.kills||0;body(player);session.publish(true);}
    if(event.type==='devil'){spendDevil(player);session.publish(true);}
    if(event.type==='death')die(event.reason||'A rival gobbled your snake.');
   }
   session.sdk.remove(path('events/'+session.slot+'/'+id)).catch(session.fail);
  }
  if(session.isHost&&session.ready){
   for(const [id,claim] of Object.entries(value.claims||{})){
    if(processedClaims.has(id))continue;processedClaims.add(id);
    const s=claim.by===session.slot?player:session.remotes.find(p=>p.slot===claim.by);
    const p=foodState.find(p=>p.id===claim.foodId);
    if(claim.round===session.round&&s&&p&&s.owner===claim.owner&&s.life===claim.life)consume(s,p);
    session.sdk.remove(path('claims/'+id)).catch(session.fail);
   }
  }
  if(value.result?.round===session.round&&!outcome){outcome=value.result.type;if(outcome==='won')finish(true,'You explored every tile together!');}
  updateHUD();
 }
 function requestPause(value){if(session.ready&&session.round)send('control',{round:session.round,paused:!!value});}
 function killHuman(victim,reason){
  const key=victim.owner+':'+victim.life;if(deadLives.has(key))return;deadLives.add(key);
  if(victim===player)die(reason);else{victim.alive=false;send('events/'+victim.slot+'/'+crypto.randomUUID(),{round:session.round,life:victim.life,type:'death',reason});}
 }
 function bite(winner,victim){
  if(devilCanEat(winner)){
   if(winner===player)spendDevil(winner);
   else{spentBites.add(winner.owner+':'+winner.life+':'+winner.devilWindow+':'+winner.devilUsed);winner.devilArmed=false;send('events/'+winner.slot+'/'+crypto.randomUUID(),{round:session.round,life:winner.life,type:'devil'});}
  }
  grant(winner,victim.size,0,1);killHuman(victim,victim.name+' was gobbled by '+winner.name+'.');
 }
 function worldStep(dt){
  elapsed+=dt;const humans=[player,...session.remotes];
  for(const s of humans){
   if(s.remote&&spentBites.has(s.owner+':'+s.life+':'+s.devilWindow+':'+s.devilUsed))s.devilArmed=false;
   if(s.alive)markCoverage(s);
  }
  for(let i=0;i<humans.length;i++)for(let j=i+1;j<humans.length;j++){
   const a=humans[i],b=humans[j];
   if(!a.alive||!b.alive||a.shield>0||b.shield>0||deadLives.has(a.owner+':'+a.life)||deadLives.has(b.owner+':'+b.life))continue;
   const r=snakeRadius(a)+snakeRadius(b),aHit=b.parts.some(p=>distance(a,p)<=r),bHit=a.parts.some(p=>distance(b,p)<=r);
   if(aHit&&empoweredCanEat(a)&&!empoweredCanEat(b)){bite(a,b);continue;}
   if(bHit&&empoweredCanEat(b)&&!empoweredCanEat(a)){bite(b,a);continue;}
   if(aHit)killHuman(a,a.name+' hit '+b.name+'\'s snake.');
   if(bHit)killHuman(b,b.name+' hit '+a.name+'\'s snake.');
  }
  if(coveredTiles>=COVERAGE_TOTAL&&!outcome){outcome='won';send('result',{round:session.round,type:'won'});finish(true,'You explored every tile together!');}
 }
 function tick(time){
  const dt=Math.min(Math.max((time-lastTick)/1000||0,0),.1);lastTick=time;
  if(session.isHost&&api.running){worldStep(dt);coverageDirty=true;}
  if(session.isHost&&session.ready&&(!lastWorldSend||time-lastWorldSend>=100))publishWorld(time);
 }
 function publishWorld(time){
  if(worldSending)return;worldSending=true;lastWorldSend=time;
  const data={round:session.round,elapsed,respawnProgress,notice:ui.spawnNotice.textContent,noticeUntil};
  if(foodDirty){data.food=foodState.map(p=>({...p}));foodDirty=false;}
  if(coverageDirty){data.coverage=Array.from(coverageMap.entries()).filter(([,v])=>v).map(([i])=>i);coverageDirty=false;}
  session.sdk.update(path('world'),data).catch(e=>{foodDirty=coverageDirty=true;session.fail(e);}).finally(()=>{worldSending=false;});
 }
 function step(dt){
  if(paused||outcome)return;
  if(!session.isHost)elapsed+=dt;
  player.shield=Math.max(0,(player.shield||0)-dt);
  move(player,dt);
  for(let i=pearls.length-1;i>=0;i--)if(distance(player,pearls[i])<=snakeRadius(player)+CONFIG.pearlRadius)eat(player,i);
  if(player.parts.some(p=>p.x<=snakeRadius(player)||p.y<=snakeRadius(player)||p.x>=CONFIG.width-snakeRadius(player)||p.y>=CONFIG.height-snakeRadius(player))){die(player.name+' bumped the border. Keep your whole snake inside!');return;}
  session.publish();awardKing();updateHUD();
 }
 function clear(){foodState=[];latestWorld=null;worldRound=null;paused=false;outcome=null;lastTick=lastWorldSend=0;processedClaims.clear();pendingClaims.clear();processedEvents.clear();deadLives.clear();spentBites.clear();}
 return api;
}
