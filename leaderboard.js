import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDocFromServer, getDocs, query, orderBy, limit, serverTimestamp, writeBatch } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

import {createLeaderboardClient,gameInfo} from './leaderboard-core.js?v=security-2';
const client=createLeaderboardClient({initializeApp,getAuth,onAuthStateChanged,signInAnonymously,signInWithPopup,GoogleAuthProvider,getFirestore,collection,doc,setDoc,getDocFromServer,getDocs,query,orderBy,limit,serverTimestamp,writeBatch},firebaseConfig);
export const beginRun=client.beginRun;
export const finishRun=client.finishRun;

const style = document.createElement('style');
style.textContent = '.lb-button{padding:10px 16px;border:1px solid #9babb9;border-radius:10px;cursor:pointer}.lb-dialog{color:#eef4ff;background:#131f30;border:1px solid #839bb6;border-radius:18px;width:min(480px,90vw);max-height:85vh}.lb-dialog::backdrop{background:#000a}.lb-dialog button,.lb-dialog input{padding:9px;margin:4px}.lb-dialog li{padding:10px}.lb-dialog li.mine{background:#354d32;border-radius:8px}.lb-status{white-space:pre-wrap}.lb-submit{margin:10px 0}.lb-submit input{max-width:160px}.lb-header{flex-wrap:wrap}.lb-dialog .mine{outline:1px solid #b7e594}.lb-dialog button[aria-pressed=true]{background:#3b5638;color:#efffdb}.lb-auth{font-size:12px}';
document.head.append(style);
const dialog = document.createElement('dialog');
dialog.className = 'lb-dialog';
dialog.setAttribute('aria-labelledby','leaderboard-title');
dialog.innerHTML = '<h2 id="leaderboard-title">Leaderboard · Top 10</h2><p class="lb-auth"></p><button data-game="cat">Cat Sprint</button><button data-game="pacman">Pac-Man</button><button data-google>Sign in with Google</button><button data-close>Close</button><p class="lb-status" role="status"></p><ol></ol>';
document.body.append(dialog);
let selected = 'cat',loadId=0;
async function load(game) {
  gameInfo(game);const id=++loadId; selected = game;
  dialog.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game)));
  dialog.querySelector('.lb-auth').textContent=client.user?(client.user.isAnonymous?'Signed in as a guest. Google sign-in keeps an account across devices.':'Signed in. Your row is highlighted when you reach the top 10.'):'Public leaderboard. Sign-in is required to start and submit a ranked run.';
  const status = dialog.querySelector('.lb-status'), list = dialog.querySelector('ol');
  list.replaceChildren(); status.textContent = `Loading ${game === 'cat' ? 'Cat Sprint' : 'Pac-Man'}…`;
  try {
    const result = await client.topTen(game);
    if(id!==loadId)return;
    for (const entry of result.docs) {
      const row = document.createElement('li'), data = entry.data();
      const mine = entry.id === client.user?.uid;
      row.classList.toggle('mine', mine);row.dataset.uid=entry.id;if(mine)row.setAttribute('aria-current','true');
      row.textContent = `${data.name}${mine ? ' (you)' : ''} — ${data.score.toLocaleString()}${game === 'cat' ? ' m' : ''}`;
      list.append(row);
    }
    status.textContent = result.empty ? 'No scores yet. Play a run!' : `${game === 'cat' ? 'Cat Sprint' : 'Pac-Man'} · Your row is highlighted when you are in the top 10.`;
  } catch (error) { if(id===loadId)status.textContent = error.message; }
}
dialog.querySelectorAll('[data-game]').forEach(button => button.onclick = () => load(button.dataset.game));
dialog.querySelector('[data-close]').onclick = () => dialog.close();
dialog.querySelector('[data-google]').onclick = async () => {
  try { await client.googleSignIn(); await load(selected); }
  catch (error) { dialog.querySelector('.lb-status').textContent = error.message; }
};
export function leaderboardButton(parent, game = 'cat') {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'lb-button'; button.textContent = 'Leaderboard';
  button.onclick = () => { dialog.showModal(); load(game); };
  if(parent.tagName==='HEADER')parent.classList.add('lb-header');
  parent.append(button);
}
export function submissionForm(parent, game) {
  const form = document.createElement('form');
  form.className = 'lb-submit'; form.hidden = true;
  form.innerHTML = '<label>Leaderboard name <input required maxlength="20" autocomplete="nickname" aria-label="Leaderboard name"></label><button>Submit score</button><p role="status"></p>';
  parent.append(form); leaderboardButton(parent, game);
  let run, score, busy = false;
  form.onsubmit = async event => {
    event.preventDefault(); if (busy) return;
    busy = true; const button = form.querySelector('button'); button.disabled = true;
    try {
      const improved = await finishRun(run, score, form.querySelector('input').value);
      form.querySelector('p').textContent = improved ? 'Personal best saved!' : 'Run finished. Your best is higher or equal.';
    } catch (error) { form.querySelector('p').textContent = `Could not submit: ${error.message} Retry, or start a new run if another tab updated your best.`; }
    finally { busy = false; button.disabled = Boolean(run?.submitted); }
  };
  return {
    reset() { run=null;score=null;form.hidden=true;form.querySelector('p').textContent=''; },
    show(nextRun, nextScore) {
      run = nextRun; score = nextScore; form.hidden = !run;
      if(!run)return;
      form.querySelector('button').disabled = false;
      form.querySelector('p').textContent = 'Save this run before starting another.';
    }
  };
}
client.onUserChanged(()=>{if(dialog.open)load(selected);});
if (document.body.dataset.leaderboardLanding === 'true') leaderboardButton(document.querySelector('header') || document.body);
