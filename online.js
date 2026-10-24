/* Direct WebRTC multiplayer with manual signaling. No database or game server. */
'use strict';
function createOnlineSession(){
 const VERSION=3,CHUNK=12000,LIMIT=2000000;
 let pc=null,dc=null,epoch=0,busy=false,started=false,friend='',lastSent=0,lastHeard=0;
 let timer=null,connectTimer=null,dropTimer=null,parts=null,serial=0,lastInput=-Infinity,lastRender=0,remote=false,localXP=0,localShop=null;
 const el=id=>document.getElementById(id),panel=()=>el('roomPanel'),status=m=>el('roomStatus').textContent=m;
 const name=v=>typeof v==='string'?v.trim().slice(0,16):'';
 const api={role:null,init,tick,key,pointer,action:(action,id)=>send({t:'action',action,id}),leave,host,join,useCode,begin,get connected(){return dc?.readyState==='open';}};
 function controls(){
  const guest=api.role==='guest';
  ui.pause.disabled=guest||!['playing','paused'].includes(state);
  ui.start.disabled=guest;ui.restart.disabled=false;
  ui.revive.disabled=guest||xp<5;ui.skipRevive.disabled=guest;
  ui.restart.textContent=api.role?'Leave online game':'Change Players';
  ui.controlHint.textContent=api.role?'Your snake: WASD / arrows / pointer / touch':'WASD / arrows / pointer / touch';
  if(guest)ui.start.textContent='Waiting for host';
 }
 function send(m){
  if(!api.connected)return false;
  const raw=JSON.stringify(m);
  if(raw.length>LIMIT||dc.bufferedAmount>256000)return false;
  try{
   if(raw.length<=CHUNK)dc.send(raw);
   else{const id=++serial,n=Math.ceil(raw.length/CHUNK);for(let i=0;i<n;i++)dc.send(JSON.stringify({t:'chunk',id,i,n,data:raw.slice(i*CHUNK,(i+1)*CHUNK)}));}
   return true;
  }catch{return false;}
 }
 function close(){
  epoch++;started=false;remote=false;parts=null;
  clearInterval(timer);clearTimeout(connectTimer);clearTimeout(dropTimer);
  if(dc){dc.onopen=dc.onmessage=dc.onclose=dc.onerror=null;dc.close();}
  if(pc){pc.onconnectionstatechange=pc.ondatachannel=null;pc.close();}
  pc=dc=null;friend='';el('beginOnline').hidden=true;
 }
 function restoreWallet(){if(api.role!=='guest')return;xp=localXP;shopProfile=localShop;try{const saved=Number(localStorage.getItem(XP_KEY));if(Number.isSafeInteger(saved)&&saved>=0)xp=saved;}catch{}}
 function leave(){
  send({t:'leave'});restoreWallet();close();api.role=null;busy=false;
  el('hostRoom').disabled=el('joinRoom').disabled=el('useCode').disabled=false;
  panel().hidden=true;el('codeFields').hidden=true;el('outCode').value=el('inCode').value='';
  el('onlineButton').textContent='Play Online';mode=1;names=['Player 1','Player 2'];
  ui.mode.value='1';ui.secondName.hidden=true;ui.name2.required=false;
  reset();setupScreen();controls();
 }
 function fail(m){
  if(!api.role)return;
  const active=started;close();busy=false;
  el('hostRoom').disabled=el('joinRoom').disabled=el('useCode').disabled=false;
  el('codeFields').hidden=true;el('outCode').value='';panel().hidden=false;
  status(m+' Choose Host or Join to retry, or return to local play.');
  if(active){state='paused';ui.pause.disabled=true;ui.overlay.hidden=false;ui.setup.hidden=true;ui.gameActions.hidden=true;ui.heading.textContent='Connection ended';ui.message.textContent=m;}
 }
 function attach(channel){
  if(dc&&dc!==channel){channel.close();return;}
  dc=channel;
  dc.onopen=()=>{
   clearTimeout(connectTimer);lastHeard=Date.now();
   el('codeFields').hidden=true;el('outCode').value=el('inCode').value='';
   status(api.role==='host'?'Connected! Waiting for your friend.':'Connected! Waiting for the host to start.');
   if(api.role==='guest')send({t:'hello',v:VERSION,name:name(el('onlineName').value)});
   timer=setInterval(()=>{
    if(!api.connected)return;send({t:'ping'});
    if(api.role==='host'&&started)broadcast();
    if(Date.now()-lastHeard>20000)fail('Your friend stopped responding.');
   },1000);
  };
  dc.onmessage=e=>{
   if(typeof e.data!=='string'||e.data.length>LIMIT)return;
   lastHeard=Date.now();
   try{
    let m=JSON.parse(e.data);
    if(m.t==='chunk'){
     if(!Number.isInteger(m.id)||!Number.isInteger(m.n)||m.n<1||m.n>Math.ceil(LIMIT/CHUNK)||!Number.isInteger(m.i)||m.i<0||m.i>=m.n||typeof m.data!=='string'||m.data.length>CHUNK)return;
     if(!parts||parts.id!==m.id)parts={id:m.id,n:m.n,data:[],size:0};
     if(parts.n!==m.n||parts.data[m.i]!==undefined)return;
     parts.data[m.i]=m.data;parts.size+=m.data.length;
     if(parts.size>LIMIT){parts=null;return;}
     if(parts.data.filter(x=>x!==undefined).length!==m.n)return;
     m=JSON.parse(parts.data.join(''));parts=null;
    }
    receive(m);
   }catch{/* Ignore invalid peer packets. */}
  };
  dc.onclose=()=>fail('Your friend disconnected.');
  dc.onerror=()=>fail('The peer connection failed.');
 }
 function peer(role){
  restoreWallet();localXP=xp;localShop=JSON.parse(JSON.stringify(shopProfile));close();api.role=role;state='ready';lastSent=0;lastInput=-Infinity;
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]});
  pc.ondatachannel=e=>{if(role==='guest'&&e.channel.label==='snake-arena-v1')attach(e.channel);else e.channel.close();};
  pc.onconnectionstatechange=()=>{
   if(pc?.connectionState==='failed')fail('A direct connection could not be made. Try another network.');
   else if(pc?.connectionState==='disconnected'){
    if(api.role==='host'&&state==='playing')pause();
    status('Connection interrupted. Trying to reconnect...');
    clearTimeout(dropTimer);dropTimer=setTimeout(()=>fail('The connection was interrupted.'),12000);
   }else if(pc?.connectionState==='connected')clearTimeout(dropTimer);
  };
  el('codeFields').hidden=false;el('outCode').value=el('inCode').value='';
  el('onlineButton').textContent=role==='host'?'Online - Host':'Online - Guest';
  if(role==='host')attach(pc.createDataChannel('snake-arena-v1',{ordered:true}));
  controls();return pc;
 }
 async function ice(p){
  if(p.iceGatheringState==='complete')return;
  await new Promise((resolve,reject)=>{
   const done=()=>{clearTimeout(timeout);p.removeEventListener('icegatheringstatechange',changed);};
   const changed=()=>{if(p.iceGatheringState==='complete'){done();resolve();}};
   const timeout=setTimeout(()=>{done();if(p.localDescription?.sdp.includes('a=candidate:'))resolve();else reject(Error('Could not gather network addresses. Try another network.'));},12000);
   p.addEventListener('icegatheringstatechange',changed);changed();
  });
 }
 function encode(d){
  const bytes=new TextEncoder().encode(JSON.stringify({v:VERSION,type:d.type,sdp:d.sdp}));let binary='';
  for(const b of bytes)binary+=String.fromCharCode(b);
  return 'SNAKE1.'+btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 }
 function decode(code){
  code=code.trim();
  if(code.length>40000||!code.startsWith('SNAKE1.'))throw Error('Paste the complete Snake Arena connection code.');
  let d;
  try{const b=atob(code.slice(7).replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/'));d=JSON.parse(new TextDecoder().decode(Uint8Array.from(b,c=>c.charCodeAt(0))));}
  catch{throw Error('That code is incomplete or invalid. Copy it again.');}
  if(d.v!==VERSION||!['offer','answer'].includes(d.type)||typeof d.sdp!=='string'||d.sdp.length>30000||!d.sdp.startsWith('v=0'))throw Error('Unsupported code. Refresh both games and create new codes.');
  return {type:d.type,sdp:d.sdp};
 }
 async function action(f){
  if(busy)return;
  if(!name(el('onlineName').value)){status('Enter your name first.');el('onlineName').focus();return;}
  busy=true;el('hostRoom').disabled=el('joinRoom').disabled=el('useCode').disabled=true;
  try{await f();}catch(e){status(e.message||'Connection setup failed. Try again.');}
  finally{busy=false;el('hostRoom').disabled=el('joinRoom').disabled=el('useCode').disabled=false;}
 }
 async function host(){
  return action(async()=>{
   const p=peer('host'),token=epoch;status('Creating your host code...');
   await p.setLocalDescription(await p.createOffer());await ice(p);if(token!==epoch)return;
   el('outCode').value=encode(p.localDescription);el('outCodeLabel').textContent='1. Send this host code to your friend';
   el('inCodeLabel').firstChild.textContent='2. Paste the reply code from your friend';
   el('useCode').textContent='Connect friend';
   status('Send your host code. Your friend chooses Join and sends a reply code back.');
  });
 }
 async function join(){
  return action(async()=>{
   peer('guest');el('outCodeLabel').textContent='Your reply code will appear here';
   el('inCodeLabel').firstChild.textContent='1. Paste the host code';el('useCode').textContent='Create reply code';
   status('Paste the host code below and choose Create reply code.');
  });
 }
 async function useCode(){
  return action(async()=>{
   if(!pc||!api.role)throw Error('Choose Host or Join first.');
   const d=decode(el('inCode').value),p=pc,token=epoch;
   if(api.role==='host'){
    if(d.type!=='answer')throw Error('The host needs the reply code, not a host code.');
    if(p.signalingState!=='have-local-offer')throw Error('Create a new host code first.');
    status('Connecting directly to your friend...');await p.setRemoteDescription(d);
   }else{
    if(d.type!=='offer')throw Error('Join using the host code, not a reply code.');
    if(p.signalingState!=='stable'||p.remoteDescription)throw Error('Choose Join again to use a new code.');
    status('Creating your reply code...');await p.setRemoteDescription(d);
    await p.setLocalDescription(await p.createAnswer());await ice(p);if(token!==epoch)return;
    el('outCode').value=encode(p.localDescription);el('outCodeLabel').textContent='2. Send this reply code back to the host';
    status('Send your reply code to the host. Keep this page open while the host connects.');
   }
   if(token===epoch&&!api.connected)connectTimer=setTimeout(()=>{if(!api.connected)fail('Connection timed out. Try fresh codes or another network.');},90000);
  });
 }
 function begin(){
  if(api.role!=='host'||!api.connected||!friend)return;
  names=[name(el('onlineName').value)||'Host',friend];mode=2;panel().hidden=true;started=true;
  start();controls();broadcast();
 }
 function snapshot(){
  return {t:'state',v:VERSION,state,elapsed,coveredTiles,respawnProgress,xp,highScore,shop:shopProfile,
   notice:elapsed<noticeUntil?ui.spawnNotice.textContent:'',heading:ui.heading.textContent,message:ui.message.textContent,
   snakes:snakes.map((s,i)=>({id:s.isPlayer?'player-'+players.indexOf(s):s.id||'ai-'+i,x:Math.round(s.x*10)/10,y:Math.round(s.y*10)/10,
    angelUntil:s.angelUntil||0,angelReady:s.angelReady||0,skin:s.skin||'default',boostUntil:s.boostUntil||0,boostReady:s.boostReady||0,invisibleUntil:s.invisibleUntil||0,invisibleReady:s.invisibleReady||0,devilUsed:s.devilUsed||0,devilWindow:s.devilWindow||0,devilArmed:!!s.devilArmed,size:s.size,color:s.color,angle:s.angle,isPlayer:s.isPlayer,alive:s.alive,name:s.name,score:s.score||0,kills:s.kills||0,shield:s.shield||0,
    parts:s.parts.flatMap(p=>[Math.round(p.x*10)/10,Math.round(p.y*10)/10])})),
   pearls:pearls.map(p=>[Math.round(p.x*10)/10,Math.round(p.y*10)/10,Math.round(p.hue),pearlValue(p)])};
 }
 function broadcast(){if(api.role==='host'&&started)send(snapshot());}
 function receive(m){
  if(!m||typeof m!=='object')return;
  if(m.t==='ping'){send({t:'pong'});return;}if(m.t==='pong')return;
  if(m.t==='leave'){fail('Your friend left the game.');return;}
  if(api.role==='host'){
   if(m.t==='hello'){
    if(m.v!==VERSION){fail('Different game versions. Refresh both pages.');return;}
    friend=name(m.name)||'Friend';el('beginOnline').hidden=false;
    status(friend+' is connected! Choose Start together when ready.');
   }else if(m.t==='action'&&started){if(m.action==='skin')purchaseSkin(1,m.id);else if(['boost','invisible','devil','angel'].includes(m.action))usePower(players[1],m.action);
   }else if(m.t==='input'&&started&&state==='playing'&&players[1]?.alive&&Number.isFinite(m.angle))
    players[1].target=Math.atan2(Math.sin(m.angle),Math.cos(m.angle));
   return;
  }
  if(api.role!=='guest'||m.t!=='state'||m.v!==VERSION)return;
  if(!['playing','paused','won','lost','reviving'].includes(m.state)||!Array.isArray(m.snakes)||m.snakes.length>10000||!Array.isArray(m.pearls)||m.pearls.length>1000)return;
  if(!m.snakes.every(s=>typeof s.id==='string'&&typeof s.name==='string'&&s.name.length<=32&&/^#[0-9a-f]{6}$/i.test(s.color)&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&Number.isFinite(s.angle)&&Number.isInteger(s.size)&&s.size>=1&&Array.isArray(s.parts)&&s.parts.length===s.size*2&&s.parts.every(Number.isFinite)))return;
  if(!m.pearls.every(p=>Array.isArray(p)&&p.length===4&&p.every(Number.isFinite)&&[1,5,10].includes(p[3])))return;
  if(!Number.isFinite(m.elapsed)||!Number.isInteger(m.coveredTiles)||m.coveredTiles<0||m.coveredTiles>COVERAGE_TOTAL||!Number.isInteger(m.respawnProgress)||m.respawnProgress<0||m.respawnProgress>=CONFIG.respawnEvery||!Number.isSafeInteger(m.xp)||m.xp<0)return;
  if(!m.shop||!Array.isArray(m.shop.owned)||m.shop.owned.length>SKINS.length||!m.shop.owned.every(id=>SKINS.some(k=>k.id===id))||!Array.isArray(m.shop.equipped)||m.shop.equipped.length!==2||!m.shop.equipped.every(id=>m.shop.owned.includes(id)))return;
  if(!m.snakes.every(s=>SKINS.some(k=>k.id===s.skin)&&['angelUntil','angelReady','boostUntil','boostReady','invisibleUntil','invisibleReady','devilUsed','devilWindow'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&Number.isInteger(s.devilUsed)&&s.devilUsed<=5&&Number.isInteger(s.devilWindow)&&typeof s.devilArmed==='boolean'))return;
  const humans=m.snakes.filter(s=>s.isPlayer);if(humans.length!==2||humans[0].id!=='player-0'||humans[1].id!=='player-1')return;
  const changed=state!==m.state||!started;started=true;remote=true;panel().hidden=true;ui.setup.hidden=true;
  const previous=new Map(snakes.map(s=>[s.id,s]));
  snakes=m.snakes.map(s=>{
   const prior=previous.get(s.id),points=[];
   for(let i=0;i<s.parts.length;i+=2)points.push({x:s.parts[i],y:s.parts[i+1]});
   return {...s,parts:prior?.parts.length===points.length?prior.parts:points,x:prior?.x??s.x,y:prior?.y??s.y,
    goal:s.angle,target:s.angle,trail:[],remote:{x:s.x,y:s.y,parts:points}};
  });
  players=snakes.filter(s=>s.isPlayer);player=players[1];mode=2;names=players.map(s=>s.name);
  pearls=m.pearls.map(p=>({x:p[0],y:p[1],hue:p[2],value:p[3]}));elapsed=m.elapsed;coveredTiles=m.coveredTiles;
  respawnProgress=m.respawnProgress;xp=m.xp;state=m.state;shopProfile={owned:[...m.shop.owned],equipped:[...m.shop.equipped]};
  if(m.highScore&&Number.isSafeInteger(m.highScore.score)&&typeof m.highScore.name==='string')ui.highScore.textContent='Host best: '+m.highScore.score+' pearls';
  if(m.notice){ui.spawnNotice.textContent=String(m.notice).slice(0,100);noticeUntil=elapsed+1;}else noticeUntil=0;
  updateHUD();
  if(state==='playing'){ui.overlay.hidden=true;if(changed)canvas.focus({preventScroll:true});}
  else{
   ui.overlay.hidden=false;ui.details.hidden=false;ui.gameActions.hidden=false;
   ui.heading.textContent=typeof m.heading==='string'?m.heading.slice(0,100):'Waiting for host';
   ui.message.textContent=(typeof m.message==='string'?m.message.slice(0,500):'')+' The host controls pauses, restarts, and revives.';
   ui.details.textContent=players.map(s=>s.name+': '+(s.alive?'size '+s.size:'out')).join('\n');
   ui.revive.hidden=true;ui.skipRevive.hidden=true;
  }
  controls();
 }
 function tick(time){
  if(api.role==='host'&&started&&time-lastSent>=50){lastSent=time;broadcast();}
  if(api.role==='guest'&&remote){
   const alpha=1-Math.exp(-Math.min(.1,(time-lastRender)/1000||.016)*25);
   for(const s of snakes)if(s.remote){
    s.x+=(s.remote.x-s.x)*alpha;s.y+=(s.remote.y-s.y)*alpha;
    for(let i=0;i<s.parts.length;i++){s.parts[i].x+=(s.remote.parts[i].x-s.parts[i].x)*alpha;s.parts[i].y+=(s.remote.parts[i].y-s.parts[i].y)*alpha;}
   }
  }
  lastRender=time;
 }
 function input(angle){
  if(api.role!=='guest'||state!=='playing'||!player?.alive)return;
  const now=performance.now();if(now-lastInput<25)return;lastInput=now;send({t:'input',angle});
 }
 function key(e){
  if(api.role!=='guest'||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement)return false;
  const k=e.key.toLowerCase();
  if(k in directions){e.preventDefault();lastInput=-Infinity;input(directions[k]);return true;}
  if(k==='p'||k==='escape'){e.preventDefault();return true;}return false;
 }
 function pointer(e){
  if(state!=='playing'||!player?.alive)return;
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width+cameraX,y=(e.clientY-r.top)*canvas.height/r.height+cameraY;
  input(Math.atan2(y-player.y,x-player.x));
 }
 function init(){
  el('onlineButton').addEventListener('click',()=>{
   panel().hidden=false;
   if(!window.RTCPeerConnection){status('Online play needs a browser with WebRTC support.');return;}
   if(state==='playing')pause();
   el('onlineName').value=el('onlineName').value||ui.name1.value;el('onlineName').focus();
   if(!api.role)status('One player hosts. The friend joins with the host code, then sends a reply code back.');
  });
  el('hostRoom').addEventListener('click',host);el('joinRoom').addEventListener('click',join);
  el('useCode').addEventListener('click',useCode);el('beginOnline').addEventListener('click',begin);el('leaveRoom').addEventListener('click',leave);
  el('copyCode').addEventListener('click',async()=>{
   const output=el('outCode');if(!output.value){status('Create a code first.');return;}
   try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText(output.value);status('Code copied. Send the whole code to your friend.');}
   catch{output.focus();output.select();status('Code selected. Press Ctrl+C or use Copy, then send it to your friend.');}
  });
  window.addEventListener('pagehide',()=>{send({t:'leave'});close();});
 }
 return api;
}


