import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDocFromServer, getDocs, query, orderBy, limit, serverTimestamp, writeBatch } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const app = configured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const ready = auth ? new Promise(resolve => {
  const unsubscribe = onAuthStateChanged(auth, () => { unsubscribe(); resolve(); });
}) : Promise.resolve();
function requireConfig() {
  if (!db) throw new Error('Add your public Firebase web config to firebase-config.js first.');
}
export async function beginRun(game) {
  requireConfig();
  await ready;
  if (!auth.currentUser) await signInAnonymously(auth);
  const uid = auth.currentUser.uid;
  const ref = doc(collection(db, `runs_${game}`));
  await setDoc(ref, { uid, startedAt: serverTimestamp(), finished: false, score: 0 });
  return { game, uid, ref, submitted: false };
}
export async function finishRun(run, score, name) {
  requireConfig();
  if (!run || run.submitted || auth.currentUser?.uid !== run.uid) throw new Error('Start a new signed-in run first.');
  name = name.trim();
  if (!name || [...name].length > 20) throw new Error('Use a name of 1–20 characters.');
  if (!Number.isSafeInteger(score) || score < 0) throw new Error('Invalid score.');
  const bestRef = doc(db, `scores_${run.game}`, run.uid);
  const best = await getDocFromServer(bestRef);
  const improved = !best.exists() || score > best.data().score;
  const batch = writeBatch(db);
  batch.update(run.ref, { finished: true, score });
  if (improved) batch.set(bestRef, { name, score, runId: run.ref.id, updatedAt: serverTimestamp() });
  await batch.commit();
  run.submitted = true;
  return improved;
}

const style = document.createElement('style');
style.textContent = '.lb-button{padding:10px 16px;border:1px solid #9babb9;border-radius:10px;cursor:pointer}.lb-dialog{color:#eef4ff;background:#131f30;border:1px solid #839bb6;border-radius:18px;width:min(480px,90vw);max-height:85vh}.lb-dialog::backdrop{background:#000a}.lb-dialog button,.lb-dialog input{padding:9px;margin:4px}.lb-dialog li{padding:10px}.lb-dialog li.mine{background:#354d32;border-radius:8px}.lb-status{white-space:pre-wrap}.lb-submit{margin:10px 0}.lb-submit input{max-width:160px}';
document.head.append(style);
const dialog = document.createElement('dialog');
dialog.className = 'lb-dialog';
dialog.innerHTML = '<h2>Leaderboard · Top 10</h2><button data-game="cat">Cat Sprint</button><button data-game="pacman">Pac-Man</button><button data-google>Sign in with Google</button><button data-close>Close</button><p class="lb-status" role="status"></p><ol></ol>';
document.body.append(dialog);
let selected = 'cat';
async function load(game) {
  selected = game;
  const status = dialog.querySelector('.lb-status'), list = dialog.querySelector('ol');
  list.replaceChildren(); status.textContent = `Loading ${game === 'cat' ? 'Cat Sprint' : 'Pac-Man'}…`;
  try {
    requireConfig(); await ready;
    const result = await getDocs(query(collection(db, `scores_${game}`), orderBy('score', 'desc'), limit(10)));
    for (const entry of result.docs) {
      const row = document.createElement('li'), data = entry.data();
      const mine = entry.id === auth.currentUser?.uid;
      row.classList.toggle('mine', mine);
      row.textContent = `${data.name}${mine ? ' (you)' : ''} — ${data.score.toLocaleString()}${game === 'cat' ? ' m' : ''}`;
      list.append(row);
    }
    status.textContent = result.empty ? 'No scores yet. Play a run!' : `${game === 'cat' ? 'Cat Sprint' : 'Pac-Man'} · Your row is highlighted when you are in the top 10.`;
  } catch (error) { status.textContent = error.message; }
}
dialog.querySelectorAll('[data-game]').forEach(button => button.onclick = () => load(button.dataset.game));
dialog.querySelector('[data-close]').onclick = () => dialog.close();
dialog.querySelector('[data-google]').onclick = async () => {
  try { requireConfig(); await signInWithPopup(auth, new GoogleAuthProvider()); await load(selected); }
  catch (error) { dialog.querySelector('.lb-status').textContent = error.message; }
};
export function leaderboardButton(parent, game = 'cat') {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'lb-button'; button.textContent = 'Leaderboard';
  button.onclick = () => { dialog.showModal(); load(game); };
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
    reset() { form.hidden = true; },
    show(nextRun, nextScore) {
      run = nextRun; score = nextScore; form.hidden = false;
      form.querySelector('button').disabled = false;
      form.querySelector('p').textContent = 'Save this run before starting another.';
    }
  };
}
if (document.body.dataset.leaderboardLanding === 'true') leaderboardButton(document.querySelector('header') || document.body);
