'use strict';
(()=>{
 const dialog=document.getElementById('fieldGuideDialog'),button=document.getElementById('guideButton'),close=document.getElementById('closeFieldGuide');
 if(!dialog||!button||!close)return;
 let resume=false,lastFocus;
 function open(){if(dialog.open)return;lastFocus=document.activeElement;const game=window.BlockQuest;resume=!!game?.state.started&&!game.state.paused;game?.pause?.(true);if(document.pointerLockElement)document.exitPointerLock();const frame=dialog.querySelector('iframe');if(!frame.getAttribute('src')||frame.getAttribute('src')==='about:blank')frame.src=frame.dataset.src;dialog.showModal();close.focus();}
 button.onclick=open;close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.querySelector('iframe').src='about:blank';if(resume)window.BlockQuest?.pause?.(false);lastFocus?.focus();});
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='g'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('dialog,input,textarea,select')){e.preventDefault();open();}});
})();
