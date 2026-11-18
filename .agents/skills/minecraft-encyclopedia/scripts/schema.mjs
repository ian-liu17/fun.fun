import fs from 'node:fs';
const schema=JSON.parse(fs.readFileSync(new URL('../references/block-schema.json',import.meta.url),'utf8'));
function check(value,rule,location,errors){
 if(rule.$ref){const ref=rule.$ref.slice(2).split('/').reduce((o,k)=>o[k],schema);return check(value,ref,location,errors);}
 if(rule.anyOf){if(!rule.anyOf.some(r=>{const candidate=[];check(value,r,location,candidate);return !candidate.length;}))errors.push(location+': no permitted type');return;}
 if(rule.const!==undefined&&value!==rule.const)errors.push(location+': invalid constant');
 if(rule.enum&&!rule.enum.includes(value))errors.push(location+': value is outside the allowed set');
 if(rule.type){const types=Array.isArray(rule.type)?rule.type:[rule.type];const matches=t=>t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):t==='integer'?Number.isInteger(value):typeof value===t;
  if(!types.some(matches)){errors.push(location+': expected '+types.join(' or '));return;}}
 if(typeof value==='string'){if(rule.minLength&&value.length<rule.minLength)errors.push(location+': empty string');if(rule.pattern&&!new RegExp(rule.pattern).test(value))errors.push(location+': invalid format');}
 if(typeof value==='number'){if(!Number.isFinite(value)||rule.minimum!==undefined&&value<rule.minimum||rule.maximum!==undefined&&value>rule.maximum)errors.push(location+': outside numeric bounds');}
 if(Array.isArray(value)){if(rule.minItems&&value.length<rule.minItems)errors.push(location+': too few items');if(rule.items)value.forEach((v,i)=>check(v,rule.items,location+'['+i+']',errors));}
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){for(const key of rule.required||[])if(!(key in value))errors.push(location+': missing '+key);for(const [key,v]of Object.entries(value)){if(rule.properties?.[key])check(v,rule.properties[key],location+'.'+key,errors);else if(rule.additionalProperties===false)errors.push(location+': unexpected '+key);}}
}
export function schemaErrors(blocks){const errors=[];if(!Array.isArray(blocks))return ['Catalog must be an array'];for(const b of blocks)check(b,schema,b?.id||'block',errors);return errors;}
