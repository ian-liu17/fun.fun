/* Firebase rooms: host a game or join with a five-character code. */
'use strict';
function createOnlineSession(){
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 let room='',slot='p1',other='p2',sdk,db,mine,foodRef,roomRef,remote=null,food=null;
 let connected=false,ready=false,error='',generation=0,unsub=[],consumed=null,rotating=false,lastAlive=null,loading=null,busy=false,lastRound=null;
 const owner=crypto.randomUUID();
 const el=id=>document.getElementById(id);
 const api={role:null,firebase:false,init,host,join,begin,leave,restart(){if(slot==='p1')begin();},tick(){if(api.firebase&&player&&player.alive!==lastAlive){lastAlive=player.alive;publish();}},key(){return false;},pointer(){},action(){},reset:resetOnline,afterStep,replenish:()=>{pearls=food&&food.id!==consumed?[food]:[];},eat};
 const status=document.createElement('span');status.className='enemy-stat';status.setAttribute('role','status');status.hidden=true;
 function report(){
  const message=error||(!connected?'Connecting...':remote?'Player '+(other==='p1'?'1':'2')+' joined!':slot==='p1'?'Waiting for Player 2...':'Waiting for the host to start...');
  status.textContent='Room: '+room+' | You are Player '+(slot==='p1'?'1':'2')+' | '+message;
  el('roomStatus').textContent=api.firebase?'Room: '+room+' | '+message:error||'Host a game or enter your friend\'s code.';
  el('beginOnline').hidden=!api.firebase||slot!=='p1';el('beginOnline').disabled=!ready||!remote;
 }
 function fail(e){error=e?.message||String(e);report();}
 function validPoint(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=CONFIG.width&&p.y<=CONFIG.height;}
 function receive(snapshot){
  const value=snapshot.val();snakes=snakes.filter(s=>!s.remote);remote=null;
  if(value&&Array.isArray(value.body)&&value.body.length&&value.body.every(validPoint)&&Number.isFinite(value.score)){
   remote={...value,...value.body[0],parts:value.body,trail:value.body,isPlayer:true,remote:true,color:slot==='p1'?'#fd75aa':'#b3ff83',name:typeof value.name==='string'?value.name.slice(0,16):'Friend',size:value.body.length,alive:value.alive===true,angle:Number.isFinite(value.angle)?value.angle:0};snakes.push(remote);
   if(slot==='p1'&&value.consumedFood&&food?.id===value.consumedFood)spawnFood(food.id);
  }
  report();
 }
 async function spawnFood(expected){
  if(!ready||slot!=='p1'||rotating)return;rotating=true;const token=generation;
  try{
   let point;for(let n=0;n<100;n++){point={x:28+Math.random()*(CONFIG.width-56),y:28+Math.random()*(CONFIG.height-56)};if(!snakes.some(s=>s.alive&&s.parts.some(p=>distance(p,point)<snakeRadius(s)+16)))break;}
   const next={...point,hue:60,id:crypto.randomUUID()};
   await sdk.runTransaction(foodRef,current=>{if(token!==generation||!api.firebase)return;if(expected===null?current!==null:current?.id!==expected)return;return next;},{applyLocally:false});
  }catch(e){fail(e);}finally{rotating=false;}
 }
 function publish(){
  if(!ready||!connected||!player||!api.firebase)return;
  sdk.set(mine,{owner,body:player.parts.map(p=>({x:p.x,y:p.y})),score:player.score,name:player.name,alive:player.alive,angle:player.angle,consumedFood:consumed||null}).catch(fail);
 }
 function resetOnline(){
  if(!api.firebase)return;
  player.x=slot==='p1'?850:1150;player.y=640;player.color=slot==='p1'?'#b3ff83':'#fd75aa';
  player.trail=Array.from({length:40},(_,i)=>({x:player.x,y:player.y+i*2}));body(player);
  if(remote&&!snakes.includes(remote))snakes.push(remote);api.replenish();publish();
 }
 function eat(s){
  if(s!==player||!ready||!connected||!food||food.id===consumed)return;
  consumed=food.id;s.size+=CONFIG.pearlGrowth;s.score++;body(s);api.replenish();publish();if(slot==='p1')spawnFood(consumed);
 }
 function afterStep(){
  if(!api.firebase)return false;
  if(player.alive&&remote?.alive&&remote.parts.some(p=>distance(player,p)<=snakeRadius(player)+snakeRadius(remote))){player.alive=false;publish();updateHUD();finish(false,'Your head hit the other snake!');return true;}
  publish();return false;
 }
 async function load(){
  if(!loading)loading=(async()=>{
   const [app,database]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js')]);
   sdk=database;db=sdk.getDatabase(app.initializeApp({apiKey:'AIzaSyD75nl373k0a5Ppnng4_T524_Ki0WFQgyk',authDomain:'fun-fun-142e6.firebaseapp.com',databaseURL:'https://fun-fun-142e6-default-rtdb.firebaseio.com',projectId:'fun-fun-142e6',storageBucket:'fun-fun-142e6.firebasestorage.app',messagingSenderId:'393813989535',appId:'1:393813989535:web:cd16f395c312343a332aaa'}));
  })().catch(e=>{loading=null;throw e;});return loading;
 }
 function setBusy(value){busy=value;el('hostRoom').disabled=el('joinRoom').disabled=value||api.firebase;el('leaveRoom').disabled=value;}
 function makeCode(){const bytes=crypto.getRandomValues(new Uint8Array(5));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');}
 async function host(){
  if(busy||api.firebase)return;setBusy(true);error='';el('roomStatus').textContent='Creating your room...';
  try{
   await load();let claimed=false;
   for(let attempt=0;attempt<10&&!claimed;attempt++){
    room=makeCode();roomRef=sdk.ref(db,'rooms/'+room);
    const result=await sdk.runTransaction(roomRef,current=>current===null?{p1:{owner},createdAt:Date.now()}:undefined,{applyLocally:false});claimed=result.committed;
   }
   if(!claimed)throw new Error('Could not create a room. Please try again.');
   slot='p1';other='p2';await connect();
  }catch(e){fail(e);}finally{setBusy(false);}
 }
 async function join(){
  if(busy||api.firebase)return;const code=el('roomCode').value.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(code)){fail(new Error('Enter the five-character code from your friend.'));return;}
  setBusy(true);error='';el('roomStatus').textContent='Joining room...';
  try{
   await load();const candidate=sdk.ref(db,'rooms/'+code);let reason='Room not found. Check the code.';
   const result=await sdk.runTransaction(candidate,current=>{
    if(!current?.p1)return;
    if(current.p2){reason='This room is full. Only two players can join.';return;}
    if(current.round){reason='This game has already started.';return;}
    return {...current,p2:{owner}};
   },{applyLocally:false});
   if(!result.committed)throw new Error(reason);
   room=code;roomRef=candidate;slot='p2';other='p1';await connect();
  }catch(e){fail(e);}finally{setBusy(false);}
 }
 async function connect(){
  const token=++generation;api.firebase=true;api.role='host';status.hidden=false;lastRound=null;error='';
  mine=sdk.ref(db,'rooms/'+room+'/'+slot);foodRef=sdk.ref(db,'rooms/'+room+'/food');
  mode=1;names=[el('onlineName').value.trim().slice(0,16)|| (slot==='p1'?'Host':'Player 2')];ui.mode.value='1';ui.mode.disabled=true;ui.name1.value=names[0];ui.secondName.hidden=true;ui.name2.required=false;
  state='ready';reset();el('onlineButton').textContent='Online Room';el('roomDisplay').hidden=false;el('hostCode').textContent=room;el('joinFields').hidden=true;report();
  unsub.push(sdk.onValue(sdk.ref(db,'rooms/'+room+'/'+other),receive,fail));
  unsub.push(sdk.onValue(foodRef,snapshot=>{
   const value=snapshot.val();food=value&&validPoint(value)&&typeof value.id==='string'?value:null;api.replenish();
   if(slot==='p1'){if(!value)spawnFood(null);else if(value.id===consumed||value.id===remote?.consumedFood)spawnFood(value.id);}
  },fail));
  unsub.push(sdk.onValue(roomRef,snapshot=>{
   const value=snapshot.val();if(!value?.p1){leave(false);el('roomPanel').hidden=false;fail(new Error('The host closed the room. Host or join another game.'));return;}
   if(value.round&&value.round!==lastRound){lastRound=value.round;consumed=null;start();el('roomPanel').hidden=true;}
  },fail));
  unsub.push(sdk.onValue(sdk.ref(db,'.info/connected'),async snapshot=>{
   connected=false;ready=false;report();if(!snapshot.val())return;
   try{
    await sdk.onDisconnect(slot==='p1'?roomRef:mine).remove();if(token!==generation)return;
    connected=true;ready=true;report();publish();if(slot==='p1'&&!food)spawnFood(null);
   }catch(e){fail(e);}
  },fail));
 }
 async function begin(){
  if(!api.firebase||slot!=='p1'||!ready||!remote)return;
  try{await sdk.set(sdk.ref(db,'rooms/'+room+'/round'),crypto.randomUUID());}catch(e){fail(e);}
 }
 function leave(remove=true){
  generation++;unsub.forEach(stop=>stop());unsub=[];
  if(remove&&mine&&sdk){const target=slot==='p1'?roomRef:mine;sdk.remove(target).then(()=>sdk.onDisconnect(target).cancel()).catch(fail);}
  ready=connected=false;api.firebase=false;api.role=null;remote=food=null;consumed=null;lastRound=null;status.hidden=true;
  el('onlineButton').textContent='Play Online';el('roomPanel').hidden=true;el('roomDisplay').hidden=true;el('joinFields').hidden=false;el('beginOnline').hidden=true;error='';
  ui.mode.disabled=false;mode=1;reset();setupScreen();setBusy(false);
 }
 function init(){
  document.querySelector('.stats').append(status);
  el('onlineButton').onclick=()=>{if(state==='playing')pause();el('roomPanel').hidden=false;report();};
  el('hostRoom').onclick=host;el('joinRoom').onclick=join;el('beginOnline').onclick=begin;el('leaveRoom').onclick=()=>api.firebase?leave():el('roomPanel').hidden=true;
  el('roomCode').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);});
  el('roomCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();join();}});
  el('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room);el('roomStatus').textContent='Code copied! Send '+room+' to your friend.';}catch{el('roomStatus').textContent='Your room code is '+room+'.';}};
 }
 return api;
}
