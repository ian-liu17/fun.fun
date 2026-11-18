'use strict';
// Original generative composition: "Meadow Lanterns". No recordings or game music.
(()=>{
 let audio,master,delay,feedback,wet,timer,next=0,beat=0,enabled=true,active=false,theme='meadow';
 const meadow=[0,7,12,16,14,7,9,12,4,7,16,19,14,12,9,7];
 const cave=[0,12,7,15,10,7,3,12,0,7,10,15,12,7,3,7];
 try{enabled=localStorage.getItem('funfun.blockquest.music')!=='off';}catch{}
 function init(){if(audio)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Audio is unavailable in this browser.');audio=new AC();master=audio.createGain();master.gain.value=0;master.connect(audio.destination);delay=audio.createDelay(1);delay.delayTime.value=.43;feedback=audio.createGain();feedback.gain.value=.24;wet=audio.createGain();wet.gain.value=.16;delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);}
 function note(midi,at,duration,volume,wave='sine'){const oscillator=audio.createOscillator(),envelope=audio.createGain();oscillator.type=wave;oscillator.frequency.value=440*2**((midi-69)/12);envelope.gain.setValueAtTime(0,at);envelope.gain.linearRampToValueAtTime(volume,at+.025);envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(envelope);envelope.connect(master);envelope.connect(delay);oscillator.start(at);oscillator.stop(at+duration+.05);oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};}
 function schedule(){if(!audio||!active||!enabled)return;const step=theme==='cave'?.64:.55;while(next<audio.currentTime+.16){const minor=theme==='cave',root=minor?48:48,melody=minor?cave:meadow,bar=Math.floor(beat/8)%4,bass=[0,minor?3:5,minor?10:9,7][bar];if(beat%8===0){note(root+bass,next,step*7,.105);note(root+bass+7,next+.04,step*6,.045,'triangle');}note(root+12+melody[beat%melody.length],next,step*2.7,.075);if(beat%4===2)note(root+24+bass,next+.02,step*3,.022);beat++;next+=step;}}
 function sync(){if(!audio)return;master.gain.cancelScheduledValues(audio.currentTime);master.gain.setTargetAtTime(enabled&&active?.7:0,audio.currentTime,.16);clearInterval(timer);if(enabled&&active){next=audio.currentTime+.06;timer=setInterval(schedule,60);schedule();}}
 async function start(){try{init();await audio.resume();active=true;sync();return true;}catch{enabled=false;update();return false;}}
 function update(){const b=document.getElementById('music');if(b){b.textContent=enabled?'♫ Music on':'♫ Music off';b.setAttribute('aria-pressed',String(enabled));}}
 async function toggle(){enabled=!enabled;try{localStorage.setItem('funfun.blockquest.music',enabled?'on':'off');}catch{}if(enabled&&active)await start();else sync();update();}
 window.BlockQuestMusic={start,toggle,pause(){active=false;sync();},resume(){active=true;if(enabled)start();},setTheme(value){theme=value;},get enabled(){return enabled;},get playing(){return !!audio&&active&&enabled&&audio.state==='running';},get theme(){return theme;}};
 document.getElementById('music').onclick=toggle;update();
})();
