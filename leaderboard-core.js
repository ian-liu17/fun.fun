// Client validation improves UX; firestore.rules is the security boundary.
export const GAMES=Object.freeze({
  cat:Object.freeze({name:'Cat Sprint',cap:100000,maxPerSecond:6,unit:' m'}),
  pacman:Object.freeze({name:'Pac-Man',cap:10000000,maxPerSecond:2000,unit:''})
});
export function gameInfo(game){if(!Object.hasOwn(GAMES,game))throw Error('Unknown leaderboard game.');return GAMES[game];}
export function playerName(value){if(typeof value!=='string')throw Error('Use a name of 1–20 characters.');const name=value.trim();if(!name||[...name].length>20)throw Error('Use a name of 1–20 characters.');return name;}
export function createLeaderboardClient(sdk,config){
  const configured=Boolean(config?.apiKey&&config?.projectId&&config?.appId);
  const app=configured?sdk.initializeApp(config):null,auth=app?sdk.getAuth(app):null,db=app?sdk.getFirestore(app):null;
  const ready=auth?new Promise((resolve,reject)=>sdk.onAuthStateChanged(auth,resolve,reject)):Promise.resolve();
  ready.catch(()=>{});
  let signingIn=null;
  function requireConfig(){if(!db)throw Error('Firebase web configuration is missing.');}
  async function signedIn(){requireConfig();await ready;if(!auth.currentUser){signingIn??=sdk.signInAnonymously(auth).finally(()=>{signingIn=null;});await signingIn;}if(!auth.currentUser)throw Error('Sign in before starting a ranked run.');return auth.currentUser;}
  async function beginRun(game){gameInfo(game);const user=await signedIn(),uid=user.uid,ref=sdk.doc(sdk.collection(db,`runs_${game}`));await sdk.setDoc(ref,{uid,startedAt:sdk.serverTimestamp(),finished:false,score:0});return {game,uid,ref,submitted:false,busy:false};}
  async function finishRun(run,score,name){
    requireConfig();if(!run||run.submitted||run.busy||auth.currentUser?.uid!==run.uid)throw Error('Start a new signed-in run first, or wait for the current submission.');
    const info=gameInfo(run.game);name=playerName(name);if(!Number.isSafeInteger(score)||score<0||score>info.cap)throw Error(`Score must be a whole number from 0 to ${info.cap.toLocaleString()}.`);
    run.busy=true;
    try{
      const bestRef=sdk.doc(db,`scores_${run.game}`,run.uid),best=await sdk.getDocFromServer(bestRef);
      if(auth.currentUser?.uid!==run.uid)throw Error('Your sign-in changed. Start a new run with this account.');
      const improved=!best.exists()||score>best.data().score,batch=sdk.writeBatch(db);
      batch.update(run.ref,{finished:true,score});
      if(improved)batch.set(bestRef,{name,score,runId:run.ref.id,updatedAt:sdk.serverTimestamp()});
      await batch.commit();run.submitted=true;return improved;
    }finally{run.busy=false;}
  }
  async function topTen(game){gameInfo(game);requireConfig();await ready;return sdk.getDocs(sdk.query(sdk.collection(db,`scores_${game}`),sdk.orderBy('score','desc'),sdk.limit(10)));}
  async function googleSignIn(){requireConfig();await sdk.signInWithPopup(auth,new sdk.GoogleAuthProvider());}
  return {beginRun,finishRun,topTen,googleSignIn,get user(){return auth?.currentUser||null;},onUserChanged(callback){return auth?sdk.onAuthStateChanged(auth,callback):()=>{};}};
}
