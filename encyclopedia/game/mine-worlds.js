import * as THREE from './vendor/three/three.module.min.js';
export function dimensionTerrain(dimension,size,height){
 const blocks=new Uint8Array(size*size*height),put=(x,y,z,id)=>{if(x>=0&&z>=0&&y>=0&&x<size&&z<size&&y<height)blocks[x+size*(z+size*y)]=id;},center=size/2;
 for(let z=0;z<size;z++)for(let x=0;x<size;x++){
  if(dimension==='end'){
   const radius=Math.hypot(x-center,z-center);if(radius>size*.39)continue;
   const top=7+Math.floor(Math.sin(x*.2)*.7+Math.cos(z*.21)*.7);for(let y=Math.max(1,Math.floor(radius/8)-2);y<=top;y++)put(x,y,z,17);
  }else{
   const top=6+Math.floor(Math.sin(x*.19)*1.5+Math.cos(z*.18)*1.5),lava=Math.sin(x*.16+z*.14)>.91&&Math.hypot(x-center,z-center)>9;
   for(let y=0;y<=top;y++)put(x,y,z,y===top&&lava?19:(x+z)%13===0?16:14);
   if(x%13===4&&z%15===3){for(let y=top+1;y<top+5;y++)put(x,y,z,14);put(x,top+5,z,15);}
  }
 }
 if(dimension==='end')for(const [dx,dz]of [[-12,-10],[12,-10],[-12,10],[12,10]])for(let y=7;y<=16;y++)for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)put(center+dx+x,y,center+dz+z,13);
 return blocks;
}
export function makePortalSurface(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const g=canvas.getContext('2d');g.fillStyle=kind==='nether'?'#6d329b':'#102b2a';g.fillRect(0,0,64,64);
 for(let i=0;i<70;i++){g.fillStyle=kind==='nether'?`rgba(221,146,255,${.1+(i%5)*.1})`:'#9be5d3';g.fillRect((i*23)%64,(i*17)%64,kind==='nether'?10:1,kind==='nether'?3:1);}
 const map=new THREE.CanvasTexture(canvas);map.magFilter=THREE.NearestFilter;map.wrapS=map.wrapT=THREE.RepeatWrapping;
 const material=new THREE.MeshBasicMaterial({map,transparent:true,opacity:.82,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(kind==='nether'?2:3,3),material);if(kind!=='nether')mesh.rotation.x=-Math.PI/2;return mesh;
}
