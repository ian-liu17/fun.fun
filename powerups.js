'use strict';
// Each device keeps its own wallet, unlocks, and player power controls.
const SKINS=[
 {id:'default',name:'Classic',cost:0,color:'#b3ff83'},
 ...[['red','#ff5555'],['blue','#459bff'],['purple','#ae65ff'],['pink','#ff79b8'],['orange','#ffa347'],['yellow','#ffee55'],['green','#43d987'],['cyan','#4fe4ee'],['white','#ffffff']].map(([id,color])=>({id,name:id[0].toUpperCase()+id.slice(1),cost:10,color})),
 {id:'gold',name:'Gold',cost:20,color:'#ffd466'},
 {id:'silver',name:'Silver',cost:20,color:'#d4dfeb'},
 {id:'stripes',name:'Tiger stripes',cost:20,color:'#ffab46'},
 {id:'spots',name:'Polka dots',cost:20,color:'#83edca'},
 {id:'rainbow',name:'Rainbow',cost:20,color:'#ff79bc'},
 {id:'invisible',name:'Invisible snake',cost:70,color:'#ff79bc'},
 {id:'devil',name:'Devil snake',cost:50,color:'#ff4444'},
 {id:'angel',name:'Angel snake',cost:100,color:'#fff3bd'}
];
const SHOP_KEY='myArcade.snakeArena.shop';
let shopProfile={owned:['default'],equipped:['default','default']};
try{const saved=JSON.parse(localStorage.getItem(SHOP_KEY));if(saved&&Array.isArray(saved.owned)&&Array.isArray(saved.equipped)){
 shopProfile.owned=[...new Set(['default',...saved.owned.filter(id=>SKINS.some(s=>s.id===id))])];
 shopProfile.equipped=[0,1].map(i=>shopProfile.owned.includes(saved.equipped[i])?saved.equipped[i]:'default');
}}catch{}
let shopOpen=false,shopPaused=false,shopSignature='',powerSignature='';
const powerStyle=document.createElement('style');
powerStyle.textContent='.power-controls{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.power-controls button{font-size:12px;padding:6px 10px}.shop-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.shop-item{border:1px solid #526258;border-radius:12px;padding:12px;background:#21382a}.shop-item b{display:block;margin:7px 0}.skin-swatch{height:18px;border-radius:20px;display:block}.shop-item button{width:100%;font-size:12px;padding:6px}.shop-wallet{color:#ffc568}#skinShop{z-index:12}.power-help{font-size:12px;color:#c2d7c9}';
document.head.append(powerStyle);
const powerBar=document.createElement('div');powerBar.className='power-controls';
powerBar.innerHTML='<button id="shopButton">Shop</button><span id="powerButtons"></span>';
document.querySelector('.controls').prepend(powerBar);
const shopPanel=document.createElement('section');shopPanel.id='skinShop';shopPanel.className='room-panel';shopPanel.hidden=true;
shopPanel.setAttribute('role','dialog');shopPanel.setAttribute('aria-modal','true');shopPanel.setAttribute('aria-label','Snake skin shop');
shopPanel.innerHTML='<h2>Snake skin shop</h2><p class="shop-wallet" id="shopWallet"></p><label>Equip for<select id="shopPlayer"></select></label><p class="power-help">Colors: 10 XP. Metals and patterns: 20 XP. Devil: 50 XP. Invisible: 70 XP. Angel: 100 XP. Buy once, equip anytime. In online play, your wallet and unlocks stay on this device. Online play continues while you shop.</p><p class="power-help">↑ Boost: twice as fast for 5 seconds; 30-second cooldown from activation. ★ Invisible: hidden from other snakes for 30 seconds, then a 30-second wait. You can still be eaten. 😈 Devil: arm one bite to eat an opponent of any size; five bites per 20 minutes of game time. Angel: 10% faster, 30-second invisibility followed by a 30-second cooldown, and a 10-second Angel Curse that eats any size opponent, followed by a 30-second cooldown.</p><div id="shopItems" class="shop-grid"></div><p id="shopStatus" role="status" aria-live="polite"></p><div class="actions"><button id="closeShop">Back to game</button></div>';
document.body.append(shopPanel);
const shopEl=id=>document.getElementById(id);
function saveShop(){if(net.role==='guest')return;try{localStorage.setItem(SHOP_KEY,JSON.stringify(shopProfile));}catch{}}
function equippedSkin(s){return SKINS.find(k=>k.id===s.skin)||SKINS[0];}
function applySkin(s,id){s.skin=id;s.color=equippedSkin(s).color;if(id!=='devil')s.devilArmed=false;if(!['invisible','angel'].includes(id))s.invisibleUntil=0;if(id!=='angel')s.angelUntil=0;}
function resetPowers(){for(let i=0;i<players.length;i++){
 const s=players[i];Object.assign(s,{angelUntil:0,angelReady:0,boostUntil:0,boostReady:0,invisibleUntil:0,invisibleReady:0,devilUsed:0,devilWindow:0,devilArmed:false});applySkin(s,shopProfile.equipped[i]||'default');
}shopPanel.hidden=true;shopOpen=false;shopPaused=false;}
function invisible(s){return s.invisibleUntil>elapsed;}
function devilRemaining(s){return Math.max(0,5-(s.devilWindow===Math.floor(elapsed/1200)?s.devilUsed||0:0));}
function usePower(s,action){
 if(state!=='playing'||!s?.alive)return false;
 if(action==='boost'&&elapsed>=(s.boostReady||0)){s.boostUntil=elapsed+5;s.boostReady=elapsed+30;return true;}
 if(action==='invisible'&&['invisible','angel'].includes(s.skin)&&elapsed>=(s.invisibleReady||0)){s.invisibleUntil=elapsed+30;s.invisibleReady=elapsed+60;return true;}
 if(action==='angel'&&s.skin==='angel'&&elapsed>=(s.angelReady||0)){s.angelUntil=elapsed+10;s.angelReady=elapsed+40;return true;}
 if(action==='devil'&&s.skin==='devil'&&devilRemaining(s)>0){s.devilArmed=!s.devilArmed;return true;}
 return false;
}
function spendDevil(s){const windowIndex=Math.floor(elapsed/1200);if(s.devilWindow!==windowIndex){s.devilWindow=windowIndex;s.devilUsed=0;}s.devilUsed=(s.devilUsed||0)+1;s.devilArmed=false;}
function angelCanEat(s){return s.skin==='angel'&&s.angelUntil>elapsed;}
function empoweredCanEat(s){return angelCanEat(s)||devilCanEat(s);}
function devilCanEat(s){return s.skin==='devil'&&s.devilArmed&&devilRemaining(s)>0;}
function purchaseSkin(index,id){
 if(!Number.isInteger(index)||index<0||index>1)return false;
 const skin=SKINS.find(k=>k.id===id);if(!skin)return false;
 if(!shopProfile.owned.includes(id)){if(xp<skin.cost)return false;xp-=skin.cost;shopProfile.owned.push(id);saveXP();}
 shopProfile.equipped[index]=id;if(players[index])applySkin(players[index],id);saveShop();return true;
}
function powerRequest(index,action,id){
 if(net.role==='guest'){net.action(action,id);return;}
 if(action==='skin')purchaseSkin(index,id);else usePower(players[index],action);
 if(net.firebase)net.changed();renderShop();renderPowerButtons();
}
function renderPowerButtons(){
 const indices=net.role==='guest'?[1]:net.role==='host'?[0]:players.map((_,i)=>i);
 const html=indices.map(i=>{const s=players[i];if(!s)return '';const disabled=state!=='playing'||!s.alive;
 const boost=Math.max(0,Math.ceil((s.boostReady||0)-elapsed));
 let result='<button data-player="'+i+'" data-power="boost" '+(disabled||boost?'disabled':'')+' aria-label="Speed boost for '+escapeHTML(s.name)+'">↑ '+(players.length>1?escapeHTML(s.name)+' ':'')+(s.boostUntil>elapsed?'Boosting!':boost?boost+'s':'Boost')+'</button>';
 if(['invisible','angel'].includes(s.skin)){const wait=Math.max(0,Math.ceil((s.invisibleReady||0)-elapsed));result+='<button data-player="'+i+'" data-power="invisible" '+(disabled||wait?'disabled':'')+'>★ '+(invisible(s)?'Invisible '+Math.ceil(s.invisibleUntil-elapsed)+'s':wait?'Wait '+wait+'s':'Invisible')+'</button>';}
 if(s.skin==='angel'){const wait=Math.max(0,Math.ceil((s.angelReady||0)-elapsed));result+='<button data-player="'+i+'" data-power="angel" '+(disabled||wait?'disabled':'')+'>&#128124; '+(angelCanEat(s)?'Angel Curse '+Math.ceil(s.angelUntil-elapsed)+'s':wait?'Curse wait '+wait+'s':'Angel Curse')+'</button>';}
 if(s.skin==='devil')result+='<button data-player="'+i+'" data-power="devil" '+(disabled||!devilRemaining(s)?'disabled':'')+'>😈 '+(s.devilArmed?'Bite armed':'Devil bite')+' · '+devilRemaining(s)+'/5</button>';
 return result;
 }).join('');if(powerSignature!==html){powerSignature=html;shopEl('powerButtons').innerHTML=html;}
}
function renderShop(){
 if(!shopOpen)return;
 const index=Number(shopEl('shopPlayer').value)||0;
 shopEl('shopWallet').textContent='Wallet: '+xp+' XP';
 const signature=JSON.stringify([index,xp,shopProfile]);if(signature===shopSignature)return;shopSignature=signature;
 const featured=['angel','invisible','devil'];
 const shopSkins=[...featured.map(id=>SKINS.find(k=>k.id===id)),...SKINS.filter(k=>!featured.includes(k.id))];
 shopEl('shopItems').innerHTML=shopSkins.map(k=>{const owned=shopProfile.owned.includes(k.id),active=shopProfile.equipped[index]===k.id;
 const paint=['rainbow','invisible'].includes(k.id)?'linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,violet)':k.id==='stripes'?'repeating-linear-gradient(90deg,#ffab46 0 12px,#302018 12px 18px)':k.id==='spots'?'radial-gradient(circle,#23392c 25%,transparent 30%) 0 0/14px 14px #83edca':k.color;
 return '<div class="shop-item"><span class="skin-swatch" style="background:'+paint+'"></span><b>'+k.name+'</b><button data-skin="'+k.id+'" '+(active||!owned&&xp<k.cost?'disabled':'')+'>'+(active?'Equipped':owned?'Equip':xp<k.cost?'Need '+k.cost+' XP ('+(k.cost-xp)+' more)':'Buy · '+k.cost+' XP')+'</button></div>';
 }).join('');
}
shopEl('shopButton').onclick=()=>{
 shopOpen=true;shopSignature='';shopPaused=!net.role&&state==='playing';if(shopPaused)pause();
 const indices=net.role==='guest'?[1]:net.role==='host'?[0]:[0,...(mode===2?[1]:[])];
 shopEl('shopPlayer').innerHTML=indices.map(i=>'<option value="'+i+'">'+escapeHTML(players[i]?.name||'Player '+(i+1))+'</option>').join('');
 shopPanel.hidden=false;renderShop();shopEl('closeShop').focus();
};
function closeShop(){shopOpen=false;shopPanel.hidden=true;if(shopPaused&&state==='paused')play();shopPaused=false;shopEl('shopButton').focus();}
shopEl('closeShop').onclick=closeShop;shopEl('shopPlayer').onchange=()=>{shopSignature='';renderShop();};
shopEl('shopItems').onclick=e=>{const button=e.target.closest('[data-skin]');if(button){powerRequest(Number(shopEl('shopPlayer').value), 'skin',button.dataset.skin);shopEl('shopStatus').textContent=net.role==='guest'?'Sent to host.': 'Skin selection saved.';}};
shopEl('powerButtons').onclick=e=>{const button=e.target.closest('[data-power]');if(button)powerRequest(Number(button.dataset.player),button.dataset.power);};
document.addEventListener('keydown',e=>{if(!shopOpen)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeShop();}else if(e.key==='Tab'){const items=[...shopPanel.querySelectorAll('button:not(:disabled),select')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}else if(!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))e.stopImmediatePropagation();},true);
function pearlValue(p){return p.value||1;}
function relocatePearl(p){
 let best=null,bestClearance=-Infinity;
 for(let attempt=0;attempt<400;attempt++){
  const candidate={x:28+Math.random()*(CONFIG.width-56),y:28+Math.random()*(CONFIG.height-56)};
  if(distance(candidate,p)<160)continue;
  let clearance=Infinity;
  for(const s of snakes)if(s.alive)for(const b of s.parts)clearance=Math.min(clearance,distance(candidate,b)-snakeRadius(s)-CONFIG.pearlRadius-8);
  for(const q of pearls)if(q!==p)clearance=Math.min(clearance,distance(candidate,q)-22);
  if(clearance>bestClearance){best=candidate;bestClearance=clearance;}if(clearance>=0)break;
 }
 // Always retain the exact number of special dots, even in a crowded arena.
 if(best)Object.assign(p,best);
}
function replenishSpecials(){for(const [value,count,hue] of [[5,5,210],[10,1,275]])while(pearls.filter(p=>pearlValue(p)===value).length<count){const p={x:-1000,y:-1000,hue,value};relocatePearl(p);pearls.push(p);}}
function eatPearl(s,index){if(net.firebase){net.eat(s,index);return;}const p=pearls[index],value=pearlValue(p);s.size+=value*CONFIG.pearlGrowth;if(s.isPlayer)s.score+=value;if(value>1)relocatePearl(p);else pearls.splice(index,1);body(s);}
function skinPaint(s,i){
 if(s.skin==='invisible'||s.skin==='rainbow')return 'hsl('+((elapsed*55+i*19)%360)+' 90% 65%)';
 if(s.skin==='stripes')return i%3===1?'#302018':s.color;
 if(s.skin==='gold'||s.skin==='silver')return i%4===1?'#ffffff':s.color;
 return s.color;
}
function drawSkinMark(s,p,i,radius){if(s.skin==='spots'&&i%2===0){ctx.beginPath();ctx.fillStyle='#244939';ctx.arc(p.x,p.y,Math.max(2,radius*.36),0,Math.PI*2);ctx.fill();}}
function drawDevil(s){if(s.skin==='angel'){ctx.strokeStyle='#ffe782';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-14,7,3,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(-3,sign*5);ctx.lineTo(-11,sign*13);ctx.lineTo(5,sign*8);ctx.fill();}return;}if(s.skin!=='devil')return;ctx.fillStyle='#ffe5b9';for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(-4,sign*5);ctx.lineTo(-9,sign*14);ctx.lineTo(3,sign*7);ctx.fill();}}
