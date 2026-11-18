import blocks from '@/data/blocks.json';
import Atlas from '@/components/Atlas';
export function generateStaticParams(){return blocks.map(b=>({id:b.id.split(':')[1]}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const block=blocks.find(b=>b.id===`minecraft:${id}`);return {title:`${block?.name||'Block'} · MINE!!!`,description:block?.description};}
export default async function BlockPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Atlas initialBlock={`minecraft:${id}`} assetPrefix="../../"/>;}
