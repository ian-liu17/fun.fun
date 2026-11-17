'use strict';
// Original synthesized tracks: "Corner Chase" (maze) and "Neon Noodles" (snake).
(()=>{
 const kind=document.currentScript.dataset.game,fast=kind==='pacman',key='funfun.music.'+kind;
 let ac,gain,timer,next=0,tick=0,enabled=true,unlocked=false,playing=false;
 try{enabled=localStorage.getItem(key)!=='off';}catch{}
 const button=document.createElement('button');button.className='arcade-music';button.id='arcadeMusic';button.type='button';
 const target=fast?document.querySelector('header'):document.querySelector('header .stats');target?.append(button);
 function label(){button.textContent=enabled?'♫ Music on':'♫ Music off';button.setAttribute('aria-pressed',String(enabled));}label();
 function tone(midi,at,dur,vol,type){const o=ac.createOscillator(),e=ac.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);e.gain.setValueAtTime(0,at);e.gain.linearRampToValueAtTime(vol,at+.008);e.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(e);e.connect(gain);o.start(at);o.stop(at+dur+.02);o.onended=()=>{o.disconnect();e.disconnect();};}
 function sequence(){if(!ac||!enabled||!playing)return;const duration=fast?.135:.19;while(next<ac.currentTime+.12){const bars=fast?[0,5,7,5]:[0,3,7,5],base=(fast?48:36)+bars[Math.floor(tick/16)%4];if(fast){const melody=[12,16,19,24,19,16,14,19,12,16,21,19,16,14,11,14];tone(base+melody[tick%16],next,duration*.7,.026,'square');if(tick%2===0)tone(base+(tick%4===0?0:7),next,duration*1.6,.06,'triangle');}else{if(tick%4===0)tone(base,next,duration*2,.105,'sine');if(tick%2===0)tone(base+12+[0,7,10,7,3,7,12,10][tick/2%8],next,duration*1.4,.048,'triangle');if(tick%4===2)tone(83,next,.04,.011,'square');}tick++;next+=duration;}}
 function active(){if(document.hidden)return false;const overlay=document.getElementById('overlay');if(!overlay)return false;return overlay.hidden||getComputedStyle(overlay).display==='none';}
 function sync(){playing=active();if(!ac)return;gain.gain.cancelScheduledValues(ac.currentTime);gain.gain.setTargetAtTime(enabled&&playing?.65:0,ac.currentTime,.08);clearInterval(timer);if(enabled&&playing){next=ac.currentTime+.03;timer=setInterval(sequence,50);sequence();}}
 async function unlock(){if(unlocked)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ac=new C();gain=ac.createGain();gain.gain.value=0;gain.connect(ac.destination);await ac.resume();unlocked=true;sync();}catch{enabled=false;label();}}
 button.onclick=async()=>{enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off');}catch{}if(enabled)await unlock();label();sync();};
 document.addEventListener('pointerdown',()=>{if(enabled)unlock();},{capture:true});document.addEventListener('keydown',()=>{if(enabled)unlock();},{capture:true});
 const overlay=document.getElementById('overlay');if(overlay)new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['hidden','style','class']});document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',()=>{playing=false;clearInterval(timer);if(ac)gain.gain.setValueAtTime(0,ac.currentTime);});
 window.ArcadeMusic={get playing(){return !!ac&&enabled&&playing&&ac.state==='running';},get enabled(){return enabled;},get track(){return fast?'Corner Chase':'Neon Noodles';},toggle:()=>button.click()};
})();
