// Rounded, stepped landforms instead of a rectangular raised plateau.
export function terrainHeight(x,z){
 const meadow=9+Math.floor(Math.sin(x*.17)*1.1+Math.sin(z*.2)*1.1);
 const peak=Math.exp(-(((x-30)/8)**2+((z-21)/7)**2))*8;
 const ridge=Math.exp(-(((x-40)/7)**2+((z-31)/9)**2))*5;
 return Math.min(23,meadow+Math.floor(peak+ridge));
}

// Reconstruct the original 48-block world only to distinguish untouched terrain
// from a player's changes while migrating an old save.
export function legacyTerrain(){
 const size=48,height=28,blocks=new Uint8Array(size*size*height),inside=(x,y,z)=>x>=0&&z>=0&&y>=0&&x<size&&z<size&&y<height;
 const put=(x,y,z,id)=>{if(inside(x,y,z))blocks[x+size*(z+size*y)]=id;},at=(x,y,z)=>inside(x,y,z)?blocks[x+size*(z+size*y)]:0;
 const terrain=(x,z)=>9+Math.floor(Math.sin(x*.17)*1.1+Math.sin(z*.2)*1.1)+(x>=22&&x<=38&&z>=16&&z<=29?5:0);
 let seed=94721;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 for(let z=0;z<size;z++)for(let x=0;x<size;x++){let top=terrain(x,z);if(x>=31&&x<=40&&z>=6&&z<=15)top=7;for(let y=0;y<=top;y++)put(x,y,z,y===top?1:y>top-3?2:3);}
 for(let z=16;z<=33;z++){const floor=z>=30?terrain(28,z):Math.max(2,9-Math.floor((32-z)/2));for(let x=27;x<=29;x++){put(x,floor,z,3);for(let y=floor+1;y<=(z>=30?23:floor+3);y++)put(x,y,z,0);}}
 for(let z=14;z<=23;z++)for(let x=22;x<=35;x++)for(let y=3;y<=6;y++)if(((x-28)/7)**2+((z-18)/6)**2<1.1)put(x,y,z,0);
 for(const [x,y,z]of [[24,3,18],[25,3,16],[32,3,19],[26,4,14],[34,4,17],[23,5,20]])put(x,y,z,6);
 for(let z=4;z<size-4;z+=5)for(let x=4;x<size-4;x+=5){if(random()<.25||x>20&&x<40&&z<34||x>=30&&z<17||Math.hypot(x-12,z-33)<3)continue;const top=terrain(x,z),trunk=4+Math.floor(random()*2);for(let y=top+1;y<=top+trunk;y++)put(x,y,z,4);for(let dy=-1;dy<=2;dy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dz)+Math.abs(dy)<5&&at(x+dx,top+trunk+dy,z+dz)===0)put(x+dx,top+trunk+dy,z+dz,5);}
 return blocks;
}
