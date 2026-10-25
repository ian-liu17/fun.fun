'use strict';
const touchSteering=document.createElement('div');
touchSteering.className='touch-steering';
touchSteering.setAttribute('aria-label','Snake direction controls');
document.querySelector('.controls').prepend(touchSteering);
let steeringSignature='';
function updateTouchControls(){
 const indices=net.role==='guest'?[1]:net.role==='host'?[0]:players.map((_,i)=>i);
 const signature=JSON.stringify(indices.map(i=>[i,players[i]?.name]));
 if(signature===steeringSignature)return;
 steeringSignature=signature;
 document.querySelector('.controls').classList.toggle('two-touch',indices.length===2);
 touchSteering.innerHTML=indices.map(i=>'<div class="touch-pad" role="group" aria-label="'+escapeHTML(players[i]?.name||'Player')+' directions">'+[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,arrow])=>'<button type="button" data-steer="'+i+'" data-direction="'+direction+'" aria-label="'+escapeHTML(players[i]?.name||'Player')+' '+direction+'">'+arrow+'</button>').join('')+'</div>').join('');
}
function touchTurn(button){
 if(state!=='playing'||shopOpen)return;
 const direction=button.dataset.direction,index=Number(button.dataset.steer),s=players[index];
 if(!s?.alive)return;
 const angle={up:-Math.PI/2,left:Math.PI,down:Math.PI/2,right:0}[direction];
 if(net.role==='guest'){net.key({key:'Arrow'+direction[0].toUpperCase()+direction.slice(1),target:button,preventDefault(){}});return;}
 pointer=null;s.target=angle;
}
touchSteering.addEventListener('pointerdown',e=>{const button=e.target.closest('[data-steer]');if(!button)return;e.preventDefault();touchTurn(button);});
// Keyboard and assistive-technology activation also works.
touchSteering.addEventListener('click',e=>{const button=e.target.closest('[data-steer]');if(button)touchTurn(button);});
window.visualViewport?.addEventListener('resize',fitArena);
