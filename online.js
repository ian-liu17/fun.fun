/* Firebase multiplayer: 2–6 players, five-character room codes. */
'use strict';
function createOnlineSession(){
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',slots=Array.from({length:6},(_,i)=>'p'+(i+1));
 const colors=['#b3ff83','#fd75aa','#67c7ff','#ffc568','#b79aff','#5be0ca'];
 let room='',slot='p1',sdk,db,mine,foodRef,roomRef,food=null,remotes=[],members=[];
 let connected=false,ready=false,error='',generation=0,unsub=[],consumed=null,rotating=false,lastAlive=null,loading=null,busy=false,lastRound=null;
 const owner=crypto.randomUUID(),el=id=>document.getElementById(id);
 const api={role:null,firebase:false,init,host,join,begin,leave,restart(){if(slot==='p1')begin();},tick(){if(api.firebase&&player&&player.alive!==lastAlive){lastAlive=player.alive;publish();}},key(){return false;},pointer(){},action(){},reset:resetOnline,afterStep,replenish:()=>{pearls=food&&food.id!==consumed?[food]:[];},eat};
 const status=document.createElement('span');status.className='enemy-stat';status.setAttribute('role','status');status.hidden=true;
 function report(){
  const message=error||(!connected?'Connecting...':members.length<2?'Waiting for friends...':lastRound?'Game in progress':slot==='p1'?'Ready to start!':'Waiting for the host to start...');
  status.textContent='Room: '+room+' | Player '+slot.slice(1)+' | '+members.length+'/6 players | '+message;
  el('roomStatus').textContent=api.firebase?'Room: '+room+' | '+members.length+'/6 players | '+message:error||'Host a game or enter your friend\'s five-character code.';
  el('beginOnline').hidden=!api.firebase||slot!=='p1';el('beginOnline').disabled=!ready||members.length<2;
  el('roomPlayers').replaceChildren(...members.map(member=>{const li=document.createElement('li');li.textContent=member.name+(member.slot==='p1'?' (Host)':'')+(member.slot===slot?' (You)':'');li.style.color=colors[Number(member.slot.slice(1))-1];return li;}));
 }
 function fail(e){const message=e?.message||String(e);error=/permission.denied/i.test(message)?'Firebase blocked room access. Check this project\'s Realtime Database rules.':message;report();}
 function validPoint(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<=CONFIG.width&&p.y<=CONFIG.height;}
 function receiveRoom(snapshot){
  const value=snapshot.val();if(!api.firebase)return;
  if(!value?.p1){leave(false);el('roomPanel').hidden=false;fail(new Error('The host closed the room. Host or join another game.'));return;}
  members=slots.filter(id=>value[id]).map(id=>({slot:id,name:typeof value[id].name==='string'?value[id].name.slice(0,16):'Player '+id.slice(1)}));
  remotes=[];snakes=snakes.filter(s=>!s.remote);
  for(const id of slots){
   const data=value[id];if(id===slot||!data||!Array.isArray(data.body)||!data.body.length||!data.body.every(validPoint)||!Number.isFinite(data.score))continue;
   const snake={...data,...data.body[0],parts:data.body,trail:data.body,isPlayer:true,remote:true,color:colors[Number(id.slice(1))-1],name:typeof data.name==='string'?data.name.slice(0,16):'Player '+id.slice(1),size:data.body.length,alive:data.alive===true,angle:Number.isFinite(data.angle)?data.angle:0};remotes.push(snake);snakes.push(snake);
  }
  food=value.food&&validPoint(value.food)&&typeof value.food.id==='string'?value.food:null;api.replenish();
  if(slot==='p1'&&ready){if(!food)spawnFood(null);else if(food.id===consumed||slots.some(id=>value[id]?.consumedFood===food.id))spawnFood(food.id);}
  if(value.round&&value.round!==lastRound){lastRound=value.round;consumed=null;start();el('roomPanel').hidden=true;}
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
  if(!api.firebase)return;const index=Number(slot.slice(1))-1;
  player.x=600+(index%3)*400;player.y=index<3?520:800;player.color=colors[index];
  player.trail=Array.from({length:40},(_,i)=>({x:player.x,y:player.y+i*2}));body(player);
  for(const remote of remotes)if(!snakes.includes(remote))snakes.push(remote);api.replenish();publish();
 }
 function eat(s){
  if(s!==player||!ready||!connected||!food||food.id===consumed)return;
  consumed=food.id;s.size+=CONFIG.pearlGrowth;s.score++;body(s);api.replenish();publish();if(slot==='p1')spawnFood(consumed);
 }
 function afterStep(){
  if(!api.firebase)return false;
  if(player.alive&&remotes.some(remote=>remote.alive&&remote.parts.some(p=>distance(player,p)<=snakeRadius(player)+snakeRadius(remote)))){player.alive=false;publish();updateHUD();finish(false,'Your head hit another player\'s snake!');return true;}
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
 function playerName(){return el('onlineName').value.trim().slice(0,16)||'Player';}
 async function host(){
  if(busy||api.firebase)return;setBusy(true);error='';el('roomStatus').textContent='Creating your room on Firebase...';
  try{
   await load();let claimed=false;
   for(let attempt=0;attempt<10&&!claimed;attempt++){
    room=makeCode();roomRef=sdk.ref(db,'rooms/'+room);
    const result=await sdk.runTransaction(roomRef,current=>current===null?{p1:{owner,name:playerName()},createdAt:Date.now(),capacity:6}:undefined,{applyLocally:false});claimed=result.committed;
   }
   if(!claimed)throw new Error('Could not create a room. Please try again.');
   slot='p1';await connect();
  }catch(e){fail(e);}finally{setBusy(false);}
 }
 async function join(){
  if(busy||api.firebase)return;const code=el('roomCode').value.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(code)){fail(new Error('Enter the five-character code from your friend.'));return;}
  setBusy(true);error='';el('roomStatus').textContent='Looking up room on Firebase...';
  try{
   await load();const candidate=sdk.ref(db,'rooms/'+code);
   // A new computer starts with an empty local cache. Read the server first.
   const existing=await sdk.get(candidate);
   if(!existing.val()?.p1)throw new Error('Room not found. Check the code and keep the host\'s tab open.');
   let reason='Room no longer available. Ask the host for a new code.';
   const result=await sdk.runTransaction(candidate,current=>{
    // Returning null instead of aborting lets Firebase fetch and retry when its
    // transaction cache is empty, even after a successful server read.
    if(current===null)return null;
    if(!current.p1)return;
    if(current.round){reason='This game has already started. Ask the host for a new room.';return;}
    const free=slots.slice(1).find(id=>!current[id]);
    if(!free){reason='This room is full (6/6 players).';return;}
    return {...current,[free]:{owner,name:playerName()}};
   },{applyLocally:false});
   const assigned=result.committed&&slots.slice(1).find(id=>result.snapshot.val()?.[id]?.owner===owner);
   if(!assigned)throw new Error(reason);
   room=code;roomRef=candidate;slot=assigned;await connect();
  }catch(e){fail(e);}finally{setBusy(false);}
 }
 async function connect(){
  const token=++generation;api.firebase=true;api.role='host';status.hidden=false;lastRound=null;error='';
  mine=sdk.ref(db,'rooms/'+room+'/'+slot);foodRef=sdk.ref(db,'rooms/'+room+'/food');
  mode=1;names=[playerName()];ui.mode.value='1';ui.mode.disabled=true;ui.name1.value=names[0];ui.secondName.hidden=true;ui.name2.required=false;
  state='ready';reset();el('onlineButton').textContent='Online Room';el('roomDisplay').hidden=false;el('hostCode').textContent=room;el('joinFields').hidden=true;report();
  unsub.push(sdk.onValue(roomRef,receiveRoom,fail));
  unsub.push(sdk.onValue(sdk.ref(db,'.info/connected'),async snapshot=>{
   connected=false;ready=false;report();if(!snapshot.val())return;
   try{
    await sdk.onDisconnect(slot==='p1'?roomRef:mine).remove();if(token!==generation)return;
    const current=await sdk.get(roomRef);if(token!==generation)return;
    if(current.val()?.[slot]?.owner!==owner){leave(false);el('roomPanel').hidden=false;fail(new Error('Your room connection expired. Host or join a new room.'));return;}
    connected=true;ready=true;report();publish();if(slot==='p1'&&!food)spawnFood(null);
   }catch(e){fail(e);}
  },fail));
 }
 async function begin(){
  if(!api.firebase||slot!=='p1'||!ready||members.length<2)return;
  try{await sdk.set(sdk.ref(db,'rooms/'+room+'/round'),crypto.randomUUID());}catch(e){fail(e);}
 }
 function leave(remove=true){
  generation++;unsub.forEach(stop=>stop());unsub=[];
  if(remove&&mine&&sdk){const target=slot==='p1'?roomRef:mine;sdk.remove(target).then(()=>sdk.onDisconnect(target).cancel()).catch(fail);}
  ready=connected=false;api.firebase=false;api.role=null;remotes=[];members=[];food=null;consumed=null;lastRound=null;status.hidden=true;
  el('onlineButton').textContent='Play Online';el('roomPanel').hidden=true;el('roomDisplay').hidden=true;el('joinFields').hidden=false;el('beginOnline').hidden=true;error='';
  ui.mode.disabled=false;mode=1;reset();setupScreen();setBusy(false);report();
 }
 function init(){
  document.querySelector('.stats').append(status);
  el('onlineButton').onclick=()=>{if(state==='playing')pause();el('roomPanel').hidden=false;report();};
  el('hostRoom').onclick=host;el('joinRoom').onclick=join;el('beginOnline').onclick=begin;el('leaveRoom').onclick=()=>api.firebase?leave():el('roomPanel').hidden=true;
  el('roomCode').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);});
  el('roomCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();join();}});
  el('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room);el('roomStatus').textContent='Code copied! Send '+room+' to your friends.';}catch{el('roomStatus').textContent='Your room code is '+room+'.';}};
 }
 return api;
}
