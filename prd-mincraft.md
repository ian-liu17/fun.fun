# Product Requirements Document (PRD)
## Minecraft Illustrated Encyclopedia — Codex Skill
Version: 1.0 | Date: 2026-11-15 | Status: Implementation-ready specification

## 1. Product summary
Build a reusable Codex skill named `minecraft-illustrated-encyclopedia` that produces exceptionally detailed, accurate, illustrated Minecraft encyclopedias, especially a complete guide to blocks. It should recreate the **information architecture, tone, depth, tables, illustrated galleries, crafting demonstrations, interactive checklist, and chapter progression** of the reference conversation, without claiming to duplicate the proprietary ChatGPT interface or to embed live UI components that Codex cannot render.

The skill is a set of instructions, templates, schemas, scripts and tests, not a trained model. It must work in a Codex-compatible skill directory with `SKILL.md` and supporting files. When invoked for a user, it generates an exportable HTML encyclopedia (default), Markdown source, structured data, and a QA report. Images must be legally sourced, generated with an available authorized tool, or replaced by explicitly labeled placeholders. Never silently present approximate illustrations as authentic Minecraft screenshots.

## 2. User story
As a Minecraft learner, I want a massive, highly detailed, illustrated encyclopedia so I can identify blocks visually, learn where to find them, understand mining and crafting requirements, and discover their uses. As a creator, I want to run a repeatable Codex skill that generates or updates this encyclopedia and can be validated and exported.

## 3. Target audiences
- New survival players learning blocks and progression.
- Experienced players seeking recipes, properties and rare blocks.
- Educators and creators producing long-form Minecraft learning materials.
- Codex users building a standalone interactive Minecraft guide.

## 4. Scope
### In scope
- A complete block encyclopedia with categorized entries and search/filter capabilities.
- Visual reference per block or family; descriptive fallback when images unavailable.
- Minecraft Java/Bedrock version labeling and edition-specific notes.
- Locations, acquisition, tool/tier, drops, Silk Touch/Fortune, recipes, properties, uses, hazards, related blocks.
- Illustrated sections, side-by-side cards, sortable/reference tables, crafting grid visualization.
- Interactive checklists and progress tracking in browser local storage, if building HTML.
- Accessibility, responsive layout, export, source provenance, content validation.
- Incremental generation in chapters to prevent truncation.

### Out of scope
- Recreating ChatGPT's native proprietary components, backend, or UI internals.
- Reproducing copyrighted game textures without permission or proper rights.
- Claiming a complete current catalog without checking a version-specific authoritative block registry.
- Multiplayer gameplay, playable Minecraft clone, or unofficial Minecraft client.

## 5. Fidelity to reference experience
The reference encyclopedia has: (1) an oversized chapter title and subtitle, (2) a hero image group, (3) conversational explanation, (4) numbered themed sections, (5) picture galleries, (6) comparison tables, (7) cards with picture, block name, and short description, (8) step-by-step recipes, (9) special warnings, (10) dimension-by-dimension content, and (11) interactive features such as a recipe viewer and completion checklist. Reproduce these functional and editorial patterns, not exact interface-specific markup.

### Editorial voice
- English, accessible to curious students, engaging but factual.
- Explain what a block looks like, where to find it, how to obtain it, and what it does.
- Expand important blocks into deeper walkthroughs.
- No filler: maximum useful detail, not repetition.
- Use explicit uncertainty and edition/version caveats where needed.

## 6. Encyclopedia chapter map
1. Introduction: how blocks work (hardness, blast resistance, light, gravity, transparency, collision, tool requirements).
2. Natural ground: grass, dirt variants, mud, sand, red sand, gravel, snow, moss, clay.
3. Stone families: stone, cobblestone, granite, diorite, andesite, deepslate, tuff, calcite, dripstone, brick variants, slabs/stairs/walls.
4. Ores and minerals: ore variants, distributions, harvest tiers, drops, Fortune, Silk Touch, smelting, storage blocks.
5. Wood families: oak, spruce, birch, jungle, acacia, dark oak, mangrove, cherry, pale oak, bamboo, crimson, warped; all derivatives.
6. Decorative construction: sandstone, bricks, mud bricks, terracotta, glazed terracotta, concrete, concrete powder, wool, carpets, colored variants.
7. Transparent and cold: glass, panes, stained/tinted glass, ice, packed ice, blue ice.
8. Plants and crops: flowers, leaves, vines, mushrooms, saplings, food crops, aquatic plants, specialty vegetation.
9. Ocean: prismarine, sea lanterns, sponges, coral, kelp, bubble columns.
10. Geodes: smooth basalt, calcite, amethyst, budding amethyst, clusters and shard farming.
11. Nether: terrain, nylium, fungi, wart, glowstone, shroomlight, quartz, blackstone, basalt, ancient debris, nether bricks, obsidian, crying obsidian, respawn anchors.
12. End: End stone, bricks, purpur, chorus, End rods, portal frames, gateways.
13. Functional/workstations: crafting table, furnaces, smoker, blast furnace, stonecutter, smithing table, grindstone, loom, cartography table, enchanting table, brewing stand, anvil, beacon, lectern, composter, cauldron, barrel, chest, Ender chest, shulker boxes, beds.
14. Redstone: dust, blocks, torches, levers, buttons, plates, repeaters, comparators, pistons, observers, dispensers, droppers, hoppers, rails, target blocks, daylight sensors, sculk sensors, crafters, lamps.
15. Lighting and utility: torches, lanterns, campfires, candles, sea lanterns, froglights, end rods, glow lichen, scaffolding, ladders, signs, doors, trapdoors.
16. Archaeology, structures, and rare blocks: suspicious sand/gravel, decorated pots, spawners, trial spawners, vaults, sculk family, reinforced deepslate, Creaking Heart, dragon egg, monster eggs/infested blocks.
17. Technical and unobtainable blocks: bedrock, barriers, command blocks, structure blocks, jigsaw, light blocks, portal blocks, moving piston, with clear edition and access limitations.
18. Version-specific additions: generated from checked registry, not guessed.
19. Master index, glossary, cross-links, recipe directory, beginner and advanced checklists.

This chapter map is a **minimum taxonomy**, not proof that every block is listed. The complete catalog MUST be derived from a selected version's block registry or vetted reference dataset, with a reconciliation report for missing entries.

## 7. Canonical block data schema
Each block entry MUST have:
- `id`: stable namespaced block identifier, e.g. `minecraft:stone`.
- `name`, `edition`, `introduced_version`, `last_verified_version`.
- `family`, `categories`, `variants`, `related_blocks`.
- `appearance`: visual description, palette, texture cues, shape.
- `image`: local path or authorized URL, alt text, provenance/license, fallback status.
- `natural_generation`: dimensions, biomes, structures, vertical range if verified.
- `acquisition`: mining/collection, crafting, smelting, trading, loot, special mechanisms.
- `tool`: preferred tool, minimum tier if applicable, Silk Touch, Fortune, exceptions.
- `drops`: normal drops, conditional drops, explosion effects if relevant.
- `crafting`: shaped/shapeless/smelting/stonecutting/smithing recipes with exact quantities.
- `properties`: hardness, blast resistance, light emission, gravity, transparency, waterlogging, flammability, collision, renewable status; nullable when unverified.
- `uses`: construction, crafting, farming, transportation, automation, progression.
- `warnings`, `tips`, `edition_differences`, `sources`, `verification_status`.
Do not fill missing values with guesses. Display “Not verified for this version” when appropriate.

## 8. Functional requirements
**FR-01: Invocation.** Trigger on requests for a Minecraft block encyclopedia, Minecraft blocks explained, recipes/where to find blocks, or a long illustrated Minecraft chapter.
**FR-02: Version.** Default to the most recent version the available dataset can verify; disclose exact version and edition. Ask if version differences materially affect the request.
**FR-03: Completeness.** Enumerate registry IDs, track coverage and report percentage; no unsupported “every block” claim.
**FR-04: Block detail.** Every included block gets appearance, location, acquisition, tool, drops, recipe (or none), uses, and references or uncertainty marker.
**FR-05: Galleries.** Group visually related blocks; ensure each image corresponds to its actual block.
**FR-06: Recipe grid.** Render shaped recipes as faithful 3×3 grids and support shapeless recipes separately; include inputs, output count, workstation and conditions.
**FR-07: Search/filter.** Search names and IDs; filter by dimension, category, harvest tier, rarity/obtainability and edition.
**FR-08: Navigation.** Table of contents, chapter anchors, breadcrumbs, related-block links, back-to-top.
**FR-09: Interactive checklist.** Track learning/progression milestones; persist in localStorage when permitted; provide reset.
**FR-10: Accessibility.** Semantic headings, alt text, keyboard navigation, accessible focus, sufficient contrast, no color-only distinctions.
**FR-11: Responsive.** Desktop, tablet and phone; tables scroll horizontally on narrow screens.
**FR-12: Export.** `index.html`, `encyclopedia.md`, `blocks.json`, `qa-report.md`, and assets folder.
**FR-13: Sources.** Source list per entry or family; prefer official Minecraft release notes, official game data, and reputable Minecraft documentation; record access date.
**FR-14: No fabrication.** Never invent recipes, mining tiers, images, mechanics, citations, or version compatibility.
**FR-15: Incremental build.** Generate chapter-by-chapter and verify outputs before merging.

## 9. Visual design requirements
- Style: clean, inviting, highly visual reference book inspired by Minecraft's blocky visual language without copying ChatGPT proprietary UI.
- Layout: centered content max-width ~1100px; readable line lengths; generous vertical spacing.
- Header: title, short summary, hero gallery, edition/version badge (metadata only).
- Section headings: numbered, clear hierarchy.
- Gallery: responsive 2–4 columns; square images for individual blocks; wide imagery for biomes/structures.
- Block cards: consistent image, name, concise summary, optional location/tool metadata.
- Tables: striped or subtle rules; accessible headers; horizontally scrollable on mobile.
- Recipe panel: distinct 3×3 grid with ingredients and output; material selector where applicable.
- Interactive checklist: grouped stages and progress percentage.
- Dark/light themes; respect reduced-motion settings.
- Images must be appropriately licensed or marked placeholders. Do not scrape and hotlink arbitrarily.

## 10. Technical architecture
Recommended project:
```
minecraft-illustrated-encyclopedia/
  SKILL.md
  agents/openai.yaml                 # optional if supported
  references/PRD.md
  references/content-style.md
  references/block-schema.json
  references/chapter-outline.md
  scripts/build.py
  scripts/validate.py
  templates/index.html
  templates/styles.css
  templates/app.js
  data/blocks.json
  assets/images/
  output/index.html
  output/encyclopedia.md
  output/blocks.json
  output/qa-report.md
  tests/test_validation.py
  README.md
```
Use Python standard library for validation and HTML generation when feasible; vanilla HTML/CSS/JS for the standalone interactive encyclopedia. A framework is optional, not required. Do not require an internet connection for the exported HTML to function. If images are remote, provide a graceful offline fallback and clearly state the limitation.

## 11. User workflows
**Workflow A: Generate all blocks** — User requests complete guide → select edition/version → load registry and vetted data → reconcile entries → generate chapters → render galleries/tables/recipes → validate → export → report coverage.

**Workflow B: Find a block** — User searches block name → view appearance, location, acquisition, drops, tool, recipe, uses, variants, and related blocks.

**Workflow C: Explore by category** — User opens chapter → browses image gallery → filters blocks → opens detail → follows related links.

**Workflow D: Craft an item** — User selects recipe → sees correct grid and counts → checks edition/version constraints → gathers materials.

**Workflow E: Update version** — Update registry/data → identify added/removed/changed blocks → rerun validation → regenerate pages → summarize differences.

## 12. Data verification strategy
- Obtain a machine-readable registry for the target game version from an authorized source or a user-supplied dataset.
- Maintain separate version and edition metadata.
- Check recipes against actual game data or vetted documentation.
- Validate minimum tool tier and drops; some blocks have special-case collection behavior.
- Do not infer properties of one family member from another without verification.
- Do not confuse blocks with items, entities, fluids, or block states; explain exceptions explicitly.
- Avoid hardcoded “latest” claims if version cannot be checked.
- Every unverified entry must be visibly labeled and counted in QA.

## 13. Acceptance criteria
1. `SKILL.md` exists, is discoverable, and provides clear triggering and execution instructions.
2. `index.html` opens locally without a build server and core navigation/search/filter/recipe/checklist functions work.
3. A full build uses an explicit versioned registry and reports `covered/total` and percentage; any gaps are listed.
4. Every published entry passes schema validation, or missing fields are clearly marked unverified.
5. At least one example each of a block with Silk Touch behavior, falling gravity, smelting recipe, shaped recipe, dimension restriction, and unobtainable Survival status is tested.
6. Every image has alt text and documented provenance; missing images have honest fallbacks.
7. The encyclopedia includes all 19 chapter groups or explains why a group is empty for the selected version.
8. All navigation, search, filters, checklists, and crafting diagrams are keyboard accessible.
9. Responsive layout works at 375px, 768px, and 1440px widths.
10. No fabricated citations or recipes; unknown facts are labeled.
11. README documents setup, invocation, regeneration, tests, and known limitations.
12. QA report lists coverage, errors, warnings, version, edition, data sources, and output paths.

## 14. Priority
**P0:** skill packaging, accurate dataset/schema, chapter generation, HTML/Markdown export, search, block details, recipes, validation, provenance.
**P1:** galleries, responsive styling, filters, checklist, cross-linking, dark mode.
**P2:** offline image packaging, comparison mode, interactive crafting material selectors, print stylesheet, version-diff viewer.

## 15. Risks and mitigations
- **Content scope is enormous:** generate incrementally and track completeness with registry-based coverage.
- **Game updates:** pin version/edition and add update pipeline.
- **Copyright/asset rights:** use authorized media or honest placeholders.
- **Incorrect recipes:** validate against version-specific data and include provenance.
- **UI fidelity:** emulate layout and behavior in standalone web tech; do not claim native ChatGPT component equivalence.
- **Output truncation:** write files incrementally, not one enormous assistant message.

## 16. Definition of done
A Codex user can install the skill, invoke it, produce a versioned Minecraft blocks encyclopedia, open the interactive HTML locally, navigate/search/filter, view accurate recipes and block information, inspect source provenance and coverage, and rerun generation reliably. Any missing content is explicitly reported rather than hidden.
