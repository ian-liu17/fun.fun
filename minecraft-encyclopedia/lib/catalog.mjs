export const chapterDefinitions = [
 ['fundamentals','How blocks work','◈','Start with the world beneath your feet.','Hardness measures breaking time; blast resistance measures resistance to explosions. They are different properties.','A placed block is not always obtainable as an inventory item. Air, fluids and technical states appear in the registry too.','Survival emphasizes gathering and progression; Creative provides building materials and flight. Adventure restricts interaction through map rules. Spectator is for observing the world. This field guide is distinct from the custom MINE!!! adventure rules.'],
 ['ground','Natural ground','▧','The foundation of every adventure.','Learn the difference between a block that can be broken and a block that drops itself.','Use the researched entries for collection exceptions; unknown details remain explicitly unverified.'],
 ['stone','Stone & deepslate','⬡','From your first shelter to a mountain fortress.','Compare hardness and blast resistance before choosing a building material.','A preferred tool does not guarantee the correct harvest tier. Check the allowed tools in each entry.'],
 ['ores','Ores & minerals','◆','Find the resources that move your world forward.','Ore drops depend on the block, tool and enchantments. This catalog labels baseline registry drops separately.','Fortune and Silk Touch are special cases; never assume that every ore behaves identically.'],
 ['wood','Wood families','▥','A palette of forests, from oak to pale oak.','Logs, planks and their derivatives have separate registry entries. Search a wood name to explore a family.','Crafting recipes are tied to this Java version; material alternatives are selectable in the recipe viewer.'],
 ['building','Decorative construction','▦','Give your next build a little character.','Explore masonry, colored concrete, terracotta and wool.','Use comparison to inspect resistance, hardness and light without leaving the catalog.'],
 ['glass','Glass & ice','◇','Light, color and frozen landscapes.','Transparency in the registry is an engine property, not a promise of a clear texture.','Collection behavior requires separate verification. Look for Silk Touch notes.'],
 ['plants','Plants & crops','✿','Bring the living world into your builds.','A crop block and its inventory item may have different identifiers.','Growth, biome and farming details are marked unverified unless researched for the individual entry.'],
 ['ocean','Ocean & underwater','≈','Explore the world below the surface.','Coral, kelp, prismarine and aquatic blocks share this chapter.','Waterlogging and survival conditions vary per block. Do not infer them from appearance.'],
 ['geodes','Amethyst geodes','⬢','A small world of crystals inside the stone.','Budding amethyst and ordinary amethyst blocks are distinct registry entries.','Breaking a crystal source and collecting a crystal are different actions; check individual notes.'],
 ['nether','The Nether','♨','A different dimension. A different set of rules.','Progression: prepare equipment, build a safe portal shelter, then plan routes before gathering resources.','Check each researched block for dimension and hazard notes; dimension filters exclude unverified locations.'],
 ['end','The End','✧','Beyond the stronghold, another world awaits.','Progression: prepare for the dragon, secure the central island, then explore gateways and outer islands.','Portal blocks and frames have special acquisition restrictions. Registry presence does not imply Survival availability.'],
 ['functional','Workstations & storage','▣','Turn gathered resources into possibilities.','Crafting tables, furnaces and storage blocks support different tasks.','Recipes shown here are crafting recipes from the pinned dataset, plus explicitly sourced editorial smelting examples.'],
 ['redstone','Redstone & automation','⌁','Make your builds do something.','Read inputs and outputs carefully before connecting a circuit.','Java and Bedrock redstone can differ. This baseline does not claim Bedrock compatibility.'],
 ['utility','Light & utility','☀','The finishing touches that make a place home.','Light emission is listed on a 0–15 scale. State-dependent lighting needs additional verification.','Doors, signs and transport blocks may have placement or interaction behavior not captured in the registry.'],
 ['rare','Rare & remarkable','✦','Strange discoveries with exceptional mechanics.','Archaeology blocks, trial structures and sculk need special handling.','Research first: a block that breaks easily may still be impossible to collect.'],
 ['technical','Technical blocks','⌘','Behind the scenes of a block-built world.','This chapter includes air, fluids, portals and command or structure tooling.','Use explicit obtainability notes. Some entries represent internal states rather than inventory items.'],
 ['versions','Versions & editions','⟳','Know which world you are reading about.','This release pins Java 1.21.4. It is not presented as the latest Minecraft release.','Bedrock data is not loaded. Choose Bedrock to see an honest empty state instead of relabeled Java facts.'],
 ['index','Master index & glossary','☷','A place for every block, and a path back.','Hardness: resistance to breaking. Blast resistance: resistance to explosions.','Renewable: obtainable repeatedly without exhausting finite world generation; unknown here unless explicitly researched.']
].map(([id,title,icon,intro,...guide])=>({id,title,icon,intro,guide}));
export function categoryFor(name) {
 if (/^(air|cave_air|void_air|water|lava|barrier|light|structure_void|moving_piston|piston_head|jigsaw|structure_block|.*command_block|.*portal.*|end_gateway|bedrock)$/.test(name)) return 'technical';
 if (/sculk|spawner|vault|suspicious|dragon_egg|creaking_heart|reinforced|infested|decorated_pot/.test(name)) return 'rare';
 if (/amethyst|calcite|smooth_basalt/.test(name)) return 'geodes';
 if (/prismarine|coral|kelp|sponge|sea_lantern|sea_pickle|seagrass|bubble_column/.test(name)) return 'ocean';
 if (/end_stone|purpur|chorus|end_rod/.test(name)) return 'end';
 if (/netherrack|nether|nylium|soul_|glowstone|shroomlight|quartz|blackstone|basalt|ancient_debris|obsidian|respawn_anchor|warped_wart/.test(name)) return 'nether';
 if (/ore|diamond_block|emerald_block|gold_block|iron_block|copper|lapis_block|coal_block|raw_/.test(name)) return 'ores';
 if (/redstone|piston|observer|dispenser|dropper|hopper|repeater|comparator|lever|button|pressure_plate|daylight|target|tripwire|crafter|rail/.test(name)) return 'redstone';
 if (/crafting|furnace|smoker|stonecutter|smithing|grindstone|loom|cartography|enchanting|brewing|anvil|beacon|lectern|composter|cauldron|barrel|chest|shulker|bed$/.test(name)) return 'functional';
 if (/glass|ice$/.test(name)) return 'glass';
 if (/torch|lantern|campfire|candle|froglight|lichen|scaffolding|ladder|sign|door|chain|bell/.test(name)) return 'utility';
 if (/leaves|sapling|flower|tulip|orchid|dandelion|poppy|allium|bluet|daisy|lily|rose|peony|sunflower|vine|mushroom|fungus|roots|fern|cactus|crop|wheat|carrot|potato|beetroot|melon|pumpkin|sugar_cane|bamboo_sapling|azalea|petals|dripleaf|pitcher|torchflower|bush|propagule|spore|hanging_moss|short_grass|tall_grass/.test(name)) return 'plants';
 if (/oak|spruce|birch|jungle|acacia|mangrove|cherry|bamboo|crimson|warped|planks/.test(name)) return 'wood';
 if (/dirt|grass_block|mud$|sand$|gravel|snow|moss|clay|podzol|mycelium|farmland|dirt_path/.test(name)) return 'ground';
 if (/stone|deepslate|granite|diorite|andesite|tuff|dripstone/.test(name)) return 'stone';
 return 'building';
}
export function filterBlocks(blocks, f={}) {
 const q=(f.query||'').toLowerCase().trim();
 return blocks.filter(b=>(!q||`${b.name} ${b.id} ${b.description}`.toLowerCase().includes(q)) && (!f.category||f.category==='all'||b.category===f.category) && (!f.dimension||f.dimension==='all'||b.natural_generation.dimensions.includes(f.dimension)) && (!f.tool||f.tool==='all'||b.tool.preferred===f.tool) && (!f.tier||f.tier==='all'||(b.tool.minimum_tier??'Not verified')===f.tier) && (!f.edition||f.edition==='all'||b.edition===f.edition) && (!f.biome||f.biome==='all'||b.natural_generation.biomes.includes(f.biome)) && (!f.obtainability||f.obtainability==='all'||b.obtainability===f.obtainability) && (!f.version||f.version==='all'||b.last_verified_version===f.version) && (!f.rarity||f.rarity==='all'||(b.rarity??'Not verified')===f.rarity));
}
export function safeProgress(value, ids) { return Array.isArray(value) ? value.filter((v,i,a)=>typeof v==='string'&&ids.includes(v)&&a.indexOf(v)===i) : []; }
