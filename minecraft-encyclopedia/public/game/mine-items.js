import * as THREE from './vendor/three/three.module.min.js';
export function appleModel(){
 const group=new THREE.Group(),red=new THREE.MeshStandardMaterial({color:'#d84437',roughness:.55});
 for(const x of [-.08,.08]){const lobe=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),red);lobe.position.set(x,0,0);lobe.scale.set(1,1.05,.9);group.add(lobe);}
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.022,.028,.15,5),new THREE.MeshStandardMaterial({color:'#65422b'}));stem.position.set(0,.2,0);stem.rotation.z=-.18;group.add(stem);
 const leaf=new THREE.Mesh(new THREE.SphereGeometry(.07,8,5),new THREE.MeshStandardMaterial({color:'#669646'}));leaf.scale.set(1.8,.3,.7);leaf.position.set(.09,.23,0);leaf.rotation.z=.35;group.add(leaf);return group;
}
export const APPLE_ICON='<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#cf493c" d="M16 9C5 2 0 16 8 26c4 5 6 2 8 2s5 3 8-2c8-10 3-24-8-17Z"/><path fill="none" stroke="#805330" stroke-width="3" d="M16 10q-2-6 1-8"/><path fill="#80a951" d="M17 7q2-8 11-4-2 8-11 4"/><path stroke="#f6a18a" stroke-width="2" fill="none" d="M8 13q-3 5 0 9"/></svg>';
