const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
fs.copyFileSync('../firestore.rules','firestore.generated.rules');
const log=fs.createWriteStream('rules-results.log'),env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH};
const child=spawn(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js','emulators:exec','--only','firestore','--project','demo-funfun-leaderboard','--config','firebase.json','node --test rules.test.mjs'],{env,windowsHide:true});
let output='';function collect(data){const text=data.toString();log.write(text);output+=text;}
child.stdout.on('data',collect);child.stderr.on('data',collect);child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('close',code=>{log.end();for(const line of output.split(/\r?\n/))if(/^(ok \d|not ok \d|# tests |# pass |# fail |# duration_ms)/.test(line))console.log(line);console.log('Full emulator log: leaderboard-tests/rules-results.log');process.exitCode=code??1;});
