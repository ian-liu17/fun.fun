// Browser UI fixture only. Actual access enforcement is tested in rules.test.mjs.
const state=globalThis.__leaderboardFixture??={auth:{currentUser:{uid:'alice',isAnonymous:true}},rows:new Map(),events:[],listeners:[],serial:0};
if(!state.rows.size)for(const game of ['cat','pacman']){for(let i=1;i<=12;i++)state.rows.set(`scores_${game}/player${i}`,{name:i===2?'<img src=x>':'Player '+i,score:(game==='cat'?1000:100000)-i*(game==='cat'?20:1000),runId:'old',updatedAt:'old'});state.rows.set(`scores_${game}/alice`,{name:'Me',score:game==='cat'?950:95000,runId:'old',updatedAt:'old'});}
export const initializeApp=()=>({});export const getAuth=()=>state.auth;export const getFirestore=()=>({});
export function onAuthStateChanged(auth,callback){state.listeners.push(callback);queueMicrotask(()=>callback(auth.currentUser));return()=>{};}
export async function signInAnonymously(){state.auth.currentUser={uid:'guest',isAnonymous:true};state.listeners.forEach(cb=>cb(state.auth.currentUser));}
export class GoogleAuthProvider{}
export async function signInWithPopup(){state.auth.currentUser={uid:'alice',isAnonymous:false};state.listeners.forEach(cb=>cb(state.auth.currentUser));}
export const collection=(_,name)=>({name});
export function doc(...args){const id=args.length===1?'run'+String(++state.serial).padStart(17,'0'):args[2],name=args.length===1?args[0].name:args[1];return {id,path:name+'/'+id};}
export const serverTimestamp=()=>'<server-timestamp>';
export async function setDoc(ref,data){state.events.push({type:'create',path:ref.path,data});state.rows.set(ref.path,{...data});}
export async function getDocFromServer(ref){state.events.push({type:'read',path:ref.path});return {exists:()=>state.rows.has(ref.path),data:()=>state.rows.get(ref.path)};}
export const query=(...parts)=>parts;export const orderBy=(field,direction)=>({field,direction});export const limit=n=>({limit:n});
export async function getDocs(parts){state.events.push({type:'query',collection:parts[0].name,field:parts[1].field,direction:parts[1].direction,limit:parts[2].limit});const docs=[...state.rows].filter(([p])=>p.startsWith(parts[0].name+'/')).sort((a,b)=>b[1].score-a[1].score).slice(0,parts[2].limit).map(([p,data])=>({id:p.split('/')[1],data:()=>data}));return {docs,empty:!docs.length};}
export function writeBatch(){const operations=[];return {update:(ref,data)=>operations.push({kind:'update',path:ref.path,data}),set:(ref,data)=>operations.push({kind:'set',path:ref.path,data}),commit:async()=>{state.events.push({type:'batch',operations});for(const op of operations)state.rows.set(op.path,op.kind==='set'?op.data:{...state.rows.get(op.path),...op.data});}};}
