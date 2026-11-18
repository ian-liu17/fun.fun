# MINE!!! implementation and coverage

The source contracts are `../Minecraft_Encyclopedia_PRD.md` and `../Codex_Master_Prompt.md`, restored from the user's existing `prd-mincraft.md` and originally pasted master prompt. Those exact filenames were absent when this update began. The user's later instruction names the combined product **MINE!!!** and adds a playable game to the reference specification.

| Requirement | Implementation |
| --- | --- |
| Reusable discoverable skill | `.agents/skills/minecraft-encyclopedia`, with source contracts, schema, dependency-free validation/reporting, parameterized exporter and a packaged offline website |
| Next.js / React / strict TypeScript / Tailwind | `minecraft-encyclopedia/app`, `components`, `lib` and build configuration |
| 19 chapter groups and block detail routes | Static generated routes, chapter descriptions, related links, index, recipe directory and chapter Markdown |
| Search/filter/sort/compare | Names/IDs/descriptions, category, dimension, biome, tool, harvest tier, version, edition, rarity, obtainability, sorting and up to four-way comparison |
| Recipes | Exact imported shaped/shapeless grids and quantities, selectable variants, workstation labels and sourced smelting examples |
| Learning progress | Persisted checklist and learned entries, reset, graceful storage failures |
| Accessibility/responsive/offline | Keyboard dialogs, focus restoration, alt text, both themes, reduced motion, print styling, responsive tables and standalone file-openable encyclopedia |
| Version changes | Pinned 1.21.3→1.21.4 registry reconciliation, with added/removed ID export; no inferred mechanic changelog |
| Image provenance | Original labeled CC0 schematic placeholders; contained local image importer requiring authorization and attribution |
| MINE!!! integration | Guide button/G opens the encyclopedia within the game and pauses simulation/audio; standalone site also links to the bundled 3D adventure |
| Generation | New-directory output; optional `--data` and `--chapter`; browser data, JSON, Markdown and coverage regenerated together; malformed/incomplete datasets rejected |
| QA exports | Machine-readable per-ID missing fields, missing authentic images, registry reconciliation, warnings and chapter counts |

## Content gaps

All **1,095** selected Java 1.21.4 registry IDs are included. This is identity coverage, not a claim that all mechanics are researched. Four entries have historical official-source editorial examples; **every entry still has at least one unverified field**. Most locations, acquisition exceptions, rarity, uses, introduction versions, advanced mechanics, Fortune and edition differences remain gaps. Baseline drops are not a complete conditional loot model. Crafting data does not establish all smelting, stonecutting or smithing recipes. Bedrock has **0 verified entries** and returns an explicit empty state.

There are **0 authentic block images** and **1,095 clearly labeled schematic placeholders** by default. These depict category cues, not authentic block silhouettes or textures. `public/missing-block-data.json` names each missing field for each ID; `public/missing-images.json` names every missing authentic image. These gaps are intentional disclosures rather than fabricated facts.

The MINE!!! game uses its own simplified recipes and mechanics. It is not a Minecraft client or a simulation of all 1,095 blocks. The encyclopedia and the game share a product name and navigation; Minecraft reference facts remain distinguished from gameplay rules.
