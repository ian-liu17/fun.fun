import * as THREE from './vendor/three/three.module.min.js';
export function createDragon({scene,size,at,damage,toast}){
 const group=new THREE.Group(),body=new THREE.Group(),crystals=[],shots=[];scene.add(group);group.visible=false;group.add(body);let hp=100,dead=false,shotAt=0,active=false;
 const black=new THREE.MeshStandardMaterial({color:'#29212f',roughness:.8}),purple=new THREE.MeshStandardMaterial({color:'#9161a7',roughness:.65,side:THREE.DoubleSide});
 function box(parent,w,h,d,x,y,z,mat=black){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 box(body,1.8,1.4,4,0,0,0);box(body,.9,.8,2,0,.2,2.7);box(body,1.2,.8,1.4,0,.3,4);box(body,.8,.4,3,0,-.1,-3.2);for(const x of [-.42,.42])box(body,.22,.12,.12,x,.55,4.72,new THREE.MeshBasicMaterial({color:'#d89cf4'}));
 for(const x of [-.5,.5]){const horn=box(body,.18,.75,.18,x,1,3.6,new THREE.MeshStandardMaterial({color:'#bab1bf'}));horn.rotation.x=-.4;}
 const wings=[];for(const side of [-1,1]){const wing=new THREE.Group();wing.position.set(side*.7,.45,0);const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(side*6,1.7);shape.lineTo(side*4,-1.6);shape.lineTo(side*2,-.6);shape.lineTo(0,-1.6);const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),purple);mesh.rotation.x=Math.PI/2;wing.add(mesh);body.add(wing);wings.push({wing,side});}
 body.userData.dragon=true;
 for(const [dx,dz]of [[-12,-10],[12,-10],[-12,10],[12,10]]){const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.8),new THREE.MeshStandardMaterial({color:'#e3a2ee',emissive:'#b953db',emissiveIntensity:1.2}));mesh.position.set(size/2+dx,17.7,size/2+dz);mesh.userData.crystal=crystals.length;group.add(mesh);crystals.push(mesh);}
 function state(){return {hp,dead,crystals:crystals.filter(c=>c.visible).length,destroyed:crystals.map((c,i)=>!c.visible?i:-1).filter(i=>i>=0),x:body.position.x,y:body.position.y,z:body.position.z};}
 function restore(saved){hp=Number.isFinite(saved?.hp)?Math.max(0,Math.min(100,saved.hp)):100;dead=saved?.dead===true||hp===0;body.visible=!dead;for(let i=0;i<crystals.length;i++)crystals[i].visible=!saved?.destroyed?.includes(i);}
 function blocked(origin,dir,distance){for(let d=.25;d<distance-.3;d+=.2)if(at(Math.floor(origin.x+dir.x*d),Math.floor(origin.y+dir.y*d),Math.floor(origin.z+dir.z*d)))return true;return false;}
 const ray=new THREE.Raycaster();
 function hit(camera,range,power){if(!active||dead)return false;group.updateMatrixWorld(true);ray.setFromCamera(new THREE.Vector2(),camera);ray.far=range;const hits=ray.intersectObjects(group.children,true);for(const hit of hits){let node=hit.object;while(node&&node!==group&&node.userData.crystal===undefined&&!node.userData.dragon)node=node.parent;if(!node||node===group||!node.visible)continue;if(blocked(ray.ray.origin,ray.ray.direction,hit.distance))return false;if(node.userData.crystal!==undefined){node.visible=false;toast('Healing crystal destroyed! '+state().crystals+' remain.');return true;}hp=Math.max(state().crystals?1:0,hp-power);if(hp===0){dead=true;body.visible=false;toast('Dragon defeated! The return portal is open.');}else toast(state().crystals?'Dragon hit! Destroy the healing crystals on the towers.':'Dragon hit! '+Math.ceil(hp)+' health remains.');return true;}return false;}
 function update(dt,player,time,isEnd){active=isEnd;group.visible=isEnd;if(!isEnd)return;
  for(const c of crystals)if(c.visible){c.rotation.y+=dt;c.rotation.z+=dt*.5;}
  if(!dead){const perch=time%24>15;body.position.set(size/2+(perch?0:Math.sin(time*.18)*17),perch?9.8:17+Math.sin(time*.4)*2,size/2+(perch?0:Math.cos(time*.18)*17));body.rotation.y=perch?0:time*.18+Math.PI/2;wings.forEach(({wing,side})=>wing.rotation.z=side*Math.sin(time*3)*.28);if(state().crystals)hp=Math.min(100,hp+dt*.7);
   if(Math.hypot(player.x-body.position.x,player.z-body.position.z)<3&&Math.abs(player.y-body.position.y)<3)damage('the dragon',2);
   if(time>=shotAt){shotAt=time+4;const mesh=new THREE.Mesh(new THREE.SphereGeometry(.25,8,6),new THREE.MeshBasicMaterial({color:'#c886f3'}));mesh.position.copy(body.position);group.add(mesh);const dir=new THREE.Vector3(player.x,player.y+1,player.z).sub(mesh.position).normalize();shots.push({mesh,dir,life:6});}
  }
  for(const p of shots){const distance=dt*9,n=Math.max(1,Math.ceil(distance/.15));for(let i=0;i<n&&p.life>0;i++){p.mesh.position.addScaledVector(p.dir,distance/n);const v=p.mesh.position;if(at(Math.floor(v.x),Math.floor(v.y),Math.floor(v.z)))p.life=0;else if(Math.hypot(v.x-player.x,v.z-player.z)<.6&&v.y>player.y&&v.y<player.y+1.8){damage('dragon breath',2);p.life=0;}}p.life-=dt;if(p.life<=0){group.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();}}for(let i=shots.length-1;i>=0;i--)if(shots[i].life<=0)shots.splice(i,1);
 }
 return {update,hit,restore,get state(){return state();},reset(){restore(null);}};
}
