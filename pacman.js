(() => {
  'use strict';
  // 28 x 31 tile maze. The tunnel is the only wrapping row.
  const blueprint = [
    '############################',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#o####.#####.##.#####.####o#',
    '#.####.#####.##.#####.####.#',
    '#..........................#',
    '#.####.##.########.##.####.#',
    '#.####.##.########.##.####.#',
    '#......##....##....##......#',
    '######.##### ## #####.######',
    '     #.##### ## #####.#     ',
    '     #.##          ##.#     ',
    '     #.## ###--### ##.#     ',
    '######.## #      # ##.######',
    '      .   #      #   .      ',
    '######.## #      # ##.######',
    '     #.## ######## ##.#     ',
    '     #.##          ##.#     ',
    '     #.## ######## ##.#     ',
    '######.## ######## ##.######',
    '#............##............#',
    '#.####.#####.##.#####.####.#',
    '#.####.#####.##.#####.####.#',
    '#o..##.......  .......##..o#',
    '###.##.##.########.##.##.###',
    '###.##.##.########.##.##.###',
    '#......##....##....##......#',
    '#.##########.##.##########.#',
    '#.##########.##.##########.#',
    '#..........................#',
    '############################'
  ];
  const $ = id => document.getElementById(id), canvas = $('game'), ctx = canvas.getContext('2d');
  const dirs = [[0,-1],[1,0],[0,1],[-1,0]], colors = ['#ff5466','#ffacdc','#63e5ed','#ffb368'];
  let pellets, player, ghosts, score=0, level=1, lives=3, best=0, state='ready', frightened=0, combo=0;
  let elapsed=0, pClock=0, gClock=0, ready=0, eaten=0, fruit=null, fruitCount=0, extra=false, last=0, sound=false, audio;
  try { best=Number(localStorage.getItem('funfun-pacman-best'))||0; } catch {}
  const tile=(x,y) => blueprint[y]?.[x];
  function next(entity,d) { let x=entity.x+dirs[d][0],y=entity.y+dirs[d][1]; if(y===14) x=(x+28)%28; return {x,y}; }
  function pass(x,y,eyes=false) { return x>=0&&x<28&&y>=0&&y<31&&tile(x,y)!=='#'&&(tile(x,y)!=='-'||eyes); }
  function tone(freq=300,duration=.05) { if(!sound)return; try {audio ||= new (window.AudioContext||window.webkitAudioContext)(); const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{} }
  function add(n) { score+=n; if(score>best){best=score;try{localStorage.setItem('funfun-pacman-best',best);}catch{}} if(score>=10000&&!extra){extra=true;lives++;announce('Extra life!');tone(900,.2);} hud(); }
  function hud(){ $('score').textContent=String(score).padStart(6,'0');$('best').textContent=String(best).padStart(6,'0');$('level').textContent=String(level).padStart(2,'0');$('lives').textContent='● '.repeat(lives);$('remaining').textContent=`${pellets?.size||0} dots left`;$('pause').textContent=state==='paused'?'Resume':'Pause'; }
  function announce(s){$('announcement').textContent=s;}
  function overlay(title,sub,button){$('message').textContent=title;$('submessage').textContent=sub;$('start').textContent=button;$('overlay').hidden=false;}
  function positions(){player={x:13,y:23,d:3,want:3};ghosts=colors.map((color,i)=>({x:13+(i%2),y:11,d:i,color,eyes:false,release:i*2}));frightened=0;combo=0;pClock=gClock=0;elapsed=0;ready=1.5;}
  function newLevel(){pellets=new Map();blueprint.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='.'||v==='o')pellets.set(`${x},${y}`,v);}));eaten=0;fruit=null;fruitCount=0;positions();hud();}
  function start(){score=0;level=1;lives=3;extra=false;state='playing';newLevel();$('overlay').hidden=true;announce('Ready! Clear every dot.');tone(550,.15);}
  function pause(){if(state==='playing'){state='paused';overlay('TAKE A BREATHER','Your maze will be right here.','Resume →');}else if(state==='paused'){state='playing';$('overlay').hidden=true;}hud();}
  function consume(){const key=`${player.x},${player.y}`,v=pellets.get(key);if(v){pellets.delete(key);eaten++;add(v==='o'?50:10);tone(v==='o'?480:180+(eaten%2)*60);if(v==='o'){frightened=Math.max(1,8-(level-1)*.6);combo=0;ghosts.forEach(g=>{if(!g.eyes)g.d=(g.d+2)%4;});announce('Power up! Chase the blue ghosts.');}if(fruitCount<2&&eaten>=[70,170][fruitCount]){fruit={x:13,y:17,ttl:10};fruitCount++;}if(!pellets.size){level++;newLevel();announce(`Level ${level}. A little faster now.`);return;}}if(fruit&&player.x===fruit.x&&player.y===fruit.y){const reward=[100,300,500,500,700,700,1000,1000,2000,2000,3000,3000,5000][Math.min(level-1,12)];add(reward);fruit=null;announce(`Bonus +${reward}!`);tone(800,.15);}}
  function collide(){for(const g of ghosts){if(g.release>elapsed||g.eyes||g.x!==player.x||g.y!==player.y)continue;if(frightened>0){g.eyes=true;const n=200*2**Math.min(combo++,3);add(n);announce(`Ghost combo +${n}!`);tone(700,.12);}else{lives--;tone(95,.4);if(!lives){state='over';overlay('GAME OVER',`Score ${score.toLocaleString()} · Ready for another run?`,'Play again →');announce('Game over.');}else{positions();announce('Caught! Get ready to try again.');}hud();return true;}}return false;}
  function movePlayer(){let n=next(player,player.want);if(pass(n.x,n.y))player.d=player.want;n=next(player,player.d);if(pass(n.x,n.y)){player.x=n.x;player.y=n.y;}consume();collide();}
  function target(g,i){if(g.eyes)return {x:13,y:11};const scatter=elapsed%27<7;if(scatter)return [{x:26,y:1},{x:1,y:1},{x:26,y:29},{x:1,y:29}][i];const ahead=n=>({x:player.x+dirs[player.d][0]*n,y:player.y+dirs[player.d][1]*n});if(i===0)return player;if(i===1)return ahead(4);if(i===2){const a=ahead(2);return{x:2*a.x-ghosts[0].x,y:2*a.y-ghosts[0].y};}return Math.hypot(g.x-player.x,g.y-player.y)>8?player:{x:1,y:29};}
  function moveGhosts(){ghosts.forEach((g,i)=>{if(elapsed<g.release)return;let options=dirs.map((_,d)=>({d,...next(g,d)})).filter(n=>pass(n.x,n.y,g.eyes));const forward=options.filter(n=>n.d!==(g.d+2)%4);if(forward.length)options=forward;if(!options.length)return;const t=target(g,i);let chosen;if(frightened>0&&!g.eyes)chosen=options[Math.floor(Math.random()*options.length)];else chosen=options.sort((a,b)=>(a.x-t.x)**2+(a.y-t.y)**2-((b.x-t.x)**2+(b.y-t.y)**2))[0];Object.assign(g,chosen);if(g.eyes&&g.x===13&&g.y===11){g.eyes=false;g.release=elapsed+2;}});collide();}
  function update(dt){if(state!=='playing')return;if(ready>0){ready-=dt;return;}elapsed+=dt;frightened=Math.max(0,frightened-dt);if(fruit){fruit.ttl-=dt;if(fruit.ttl<=0)fruit=null;}const speed=Math.max(.082,.132-(level-1)*.004);pClock+=dt;gClock+=dt;if(pClock>=speed){pClock-=speed;movePlayer();}if(state!=='playing'||ready>0)return;const ghostSpeed=(frightened>0?.23:Math.max(.09,.155-(level-1)*.004));if(gClock>=ghostSpeed){gClock-=ghostSpeed;moveGhosts();}}
  function draw(t){ctx.clearRect(0,0,560,620);ctx.fillStyle='#040710';ctx.fillRect(0,0,560,620);blueprint.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='#'){ctx.fillStyle='#0a1738';ctx.fillRect(x*20+2,y*20+2,16,16);ctx.strokeStyle='#365de8';ctx.lineWidth=1.5;ctx.strokeRect(x*20+2.5,y*20+2.5,15,15);}if(v==='-'){ctx.fillStyle='#f8bce4';ctx.fillRect(x*20,y*20+9,20,3);}}));pellets.forEach((v,key)=>{const [x,y]=key.split(',').map(Number);ctx.fillStyle='#ffe9bd';ctx.beginPath();ctx.arc(x*20+10,y*20+10,v==='o'?5+Math.sin(t/150):2,0,Math.PI*2);ctx.fill();});if(fruit){ctx.fillStyle='#ff5368';ctx.beginPath();ctx.arc(270,354,6,0,7);ctx.arc(281,354,6,0,7);ctx.fill();ctx.strokeStyle='#8de68f';ctx.beginPath();ctx.moveTo(274,351);ctx.lineTo(280,340);ctx.lineTo(284,347);ctx.stroke();}ghosts.forEach(g=>{if(g.release>elapsed)return;const x=g.x*20+10,y=g.y*20+10;ctx.save();ctx.translate(x,y);if(!g.eyes){ctx.fillStyle=frightened>0?(frightened<2&&Math.floor(t/160)%2?'#e9efff':'#425fe4'):g.color;ctx.beginPath();ctx.arc(0,-1,8,Math.PI,0);ctx.lineTo(8,8);ctx.lineTo(3,5);ctx.lineTo(0,8);ctx.lineTo(-4,5);ctx.lineTo(-8,8);ctx.closePath();ctx.fill();}for(const ex of [-3.5,3.5]){ctx.fillStyle='white';ctx.beginPath();ctx.ellipse(ex,-1,3,3.5,0,0,7);ctx.fill();ctx.fillStyle='#14234e';ctx.beginPath();ctx.arc(ex+dirs[g.d][0],-1+dirs[g.d][1],1.5,0,7);ctx.fill();}ctx.restore();});ctx.save();ctx.translate(player.x*20+10,player.y*20+10);ctx.rotate((player.d-1)*Math.PI/2);const mouth=.14+Math.abs(Math.sin(t/90))*.3;ctx.fillStyle='#ffe15c';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,8.5,mouth,Math.PI*2-mouth);ctx.closePath();ctx.fill();ctx.restore();if(ready>0&&state==='playing'){ctx.fillStyle='#ffe36b';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('READY!',280,350);}}
  function input(d){player.want=d;}
  document.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;const keys={ArrowUp:0,w:0,ArrowRight:1,d:1,ArrowDown:2,s:2,ArrowLeft:3,a:3};const k=e.key.length===1?e.key.toLowerCase():e.key;if(k in keys){e.preventDefault();input(keys[k]);}if(k===' '||k==='p'){e.preventDefault();pause();}});
  document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();input(Number(b.dataset.dir));}));
  let touch;canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>10)input(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));touch=null;});
  $('start').onclick=()=>state==='paused'?pause():start();$('pause').onclick=pause;$('restart').onclick=start;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));tone(440,.1);};document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
  newLevel();function frame(t){const dt=Math.min((t-last)/1000,.04);last=t;update(dt);draw(t);requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
