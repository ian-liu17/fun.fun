import chapters from '@/data/chapters.json';
import Atlas from '@/components/Atlas';
export function generateStaticParams(){return chapters.map(c=>({id:c.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const chapter=chapters.find(c=>c.id===id);return {title:`${chapter?.title||'Chapter'} · MINE!!!`,description:chapter?.intro};}
export default async function ChapterPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Atlas initialCategory={id} assetPrefix="../../"/>;}
