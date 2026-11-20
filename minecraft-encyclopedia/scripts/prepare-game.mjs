import fs from 'node:fs';
fs.mkdirSync('public/game/vendor/three',{recursive:true});
for(const name of ['mine.html','mine-3d.js','mine-mobs.js','mine-world-rules.js','mine-guide.js','block-quest.css','block-quest-music.js','arcade-history.js']){
 let content=fs.readFileSync('../'+name,'utf8');
 if(name==='mine.html')content=content.replaceAll('href="fun.fun.html"','href="../index.html"').replace('src="encyclopedia/index.html"','src="../index.html"');
 fs.writeFileSync('public/game/'+name,content);
}
for(const name of ['three.module.min.js','three.core.min.js','LICENSE'])fs.copyFileSync('../vendor/three/'+name,'public/game/vendor/three/'+name);
console.log('MINE!!! 3D adventure packaged with the encyclopedia. Serve through HTTP for WebGL module support.');
