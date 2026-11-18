export type Ingredient = { id: string; name: string; count: number };
export type Recipe = { type: 'shaped' | 'shapeless' | 'smelting' | 'stonecutting' | 'smithing'; grid: (Ingredient | null)[][]; ingredients: Ingredient[]; output: number; workstation: string; conditions: string | null };
export type Block = {
 id: string; name: string; namespace: string; edition: 'Java'; last_verified_version: string;
 introduced_version: string | null; removed_version: string | null; family: string; category: string; subcategory: string | null; special_mechanics: string[]; categories: string[]; variants: string[]; related_blocks: string[];
 description: string; appearance: { description: string; palette: string[]; shape: string }; image: { path: string; alt: string; license: string; provenance: string; fallback: boolean };
 natural_generation: { dimensions: string[]; biomes: string[]; structures: string[]; vertical_range: string | null };
 acquisition: string[]; tool: { preferred: string; minimum_tier: string | null; allowed: string[]; silk_touch: string | null; fortune: string | null; exceptions: string | null };
 drops: { name: string; note: string }[]; crafting: Recipe[];
 properties: {hardness: number | null; blast_resistance: number | null; light: number | null; gravity: boolean | null; transparent: boolean | null; waterlogging: boolean | null; flammable: boolean | null; collision: string | null; renewable: boolean | null; redstone: string | null};
 uses: string[]; warnings: string[]; tips: string[]; edition_differences: string[]; obtainability: string; rarity: string | null;
 sources: {title: string; url: string; accessed: string; scope: string}[]; verification_status: string;
};
export type Chapter = {id:string; title:string; icon:string; intro:string; guide:string[]};
